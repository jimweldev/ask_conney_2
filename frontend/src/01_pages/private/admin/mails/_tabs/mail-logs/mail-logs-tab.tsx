import { useState } from 'react';
import { FaEye, FaRegCircleCheck, FaRegCircleXmark } from 'react-icons/fa6';
import { type MailLog } from '@/04_types/mail/mail-log';
import useMailLogStore from '@/05_stores/mail/mail-log-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import FancyboxViewer from '@/components/fancybox/fancybox-viewer';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useFancybox from '@/hooks/fancybox/use-fancybox';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import CreateMailLogDialog from './_dialogs/create-mail-log-dialog';
import ViewMailLogDialog from './_dialogs/view-mail-log-dialog';

const MailLogsTab = () => {
  const [fancyboxRef] = useFancybox();

  // Store
  const { setSelectedMailLog } = useMailLogStore();

  // Dialog States
  const [openCreateMailLogDialog, setOpenCreateMailLogDialog] = useState(false);
  const [openViewMailLogDialog, setOpenViewMailLogDialog] = useState(false);

  // Tanstack query hook for pagination
  const mailLogsPagination = useTanstackPaginateQuery<MailLog>({
    endpoint: '/mails/logs',
    defaultSort: '-id',
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Subject', column: 'subject' },
    { label: 'Recipient', column: 'recipient' },
    { label: 'Attachments' },
    { label: 'Status', className: 'w-[100px]' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  // Actions buttons
  const actions = (
    <Button
      size="sm"
      onClick={() => {
        setOpenCreateMailLogDialog(true);
      }}
    >
      Create
    </Button>
  );

  return (
    <>
      <Card ref={fancyboxRef}>
        <CardBody>
          {/* Data Table */}
          <DataTable
            pagination={mailLogsPagination}
            columns={columns}
            actions={actions}
          >
            {/* Render rows only if data is present */}
            {mailLogsPagination.data?.records
              ? mailLogsPagination.data.records.map(mailLog => (
                  <TableRow key={mailLog.id}>
                    <TableCell>{mailLog.id}</TableCell>
                    <TableCell>{mailLog.subject}</TableCell>
                    <TableCell>{mailLog.recipient_email}</TableCell>
                    <TableCell>
                      {/* Render each attachment as a clickable badge */}
                      <div className="flex flex-wrap items-center gap-1">
                        {mailLog.mail_log_attachments?.map(attachment => {
                          return (
                            <FancyboxViewer
                              baseUrl={import.meta.env.VITE_STORAGE_BASE_URL}
                              filePath={attachment.file_path}
                              key={attachment.id}
                              data-fancybox={`${mailLog.id}`}
                              data-caption={attachment.file_name}
                            >
                              <Badge
                                variant="secondary"
                                className="cursor-pointer"
                              >
                                {attachment.file_name}
                              </Badge>
                            </FancyboxViewer>
                          );
                        })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={mailLog.is_sent ? 'success' : 'destructive'}
                      >
                        {mailLog.is_sent ? (
                          <>
                            <FaRegCircleCheck />
                            Success
                          </>
                        ) : (
                          <>
                            <FaRegCircleXmark />
                            Failed
                          </>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {getDateTimezone(mailLog.created_at, 'date_time')}
                    </TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        {/* View button */}
                        <Tooltip content="View">
                          <Button
                            variant="info"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedMailLog(mailLog);
                              setOpenViewMailLogDialog(true);
                            }}
                          >
                            <FaEye />
                          </Button>
                        </Tooltip>
                      </InputGroup>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </DataTable>
        </CardBody>
      </Card>

      {/* Dialogs */}
      <CreateMailLogDialog
        open={openCreateMailLogDialog}
        setOpen={setOpenCreateMailLogDialog}
        refetch={mailLogsPagination.refetch}
      />
      <ViewMailLogDialog
        open={openViewMailLogDialog}
        setOpen={setOpenViewMailLogDialog}
      />
    </>
  );
};

export default MailLogsTab;
