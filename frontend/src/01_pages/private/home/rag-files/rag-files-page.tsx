import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type RagFile } from '@/04_types/rag/rag-file';
import useRagFileStore from '@/05_stores/rag/rag-file-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import FancyboxViewer from '@/components/fancybox/fancybox-viewer';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useFancybox from '@/hooks/fancybox/use-fancybox';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import CreateRagFileDialog from './_dialogs/create-rag-file-dialog';
import DeleteRagFileDialog from './_dialogs/delete-rag-file-dialog';
import UpdateRagFileDialog from './_dialogs/update-rag-file-dialog';

const RagFilesPage = () => {
  const [fancyboxRef] = useFancybox();

  // Store
  const { setSelectedRagFile } = useRagFileStore();

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Tanstack query hook for pagination
  const ragFilesPagination = useTanstackPaginateQuery<RagFile>({
    endpoint: '/rag/files',
    defaultSort: '-id',
  });

  // Table column definitions
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Title', column: 'title' },
    { label: 'File Path', column: 'file_path' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  // Actions buttons
  const actions = (
    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
      Create
    </Button>
  );

  return (
    <>
      <PageHeader className="mb-3">Rag Files</PageHeader>

      <Card ref={fancyboxRef}>
        <CardBody>
          <DataTable
            pagination={ragFilesPagination}
            columns={columns}
            actions={actions}
          >
            {ragFilesPagination.data?.records
              ? ragFilesPagination.data.records.map(ragFile => (
                  <TableRow key={ragFile.id}>
                    <TableCell>{ragFile.id}</TableCell>
                    <TableCell>{ragFile.title}</TableCell>
                    <TableCell>
                      {/* Render each attachment as a clickable badge */}
                      <div className="flex flex-wrap items-center gap-1">
                        {ragFile.file_path ? (
                          <FancyboxViewer
                            baseUrl={import.meta.env.VITE_STORAGE_BASE_URL}
                            filePath={ragFile.file_path}
                            key={ragFile.id}
                            data-fancybox={`${ragFile.id}`}
                            data-caption={ragFile.title}
                          >
                            <Badge
                              variant="secondary"
                              className="cursor-pointer"
                            >
                              {ragFile.title}
                            </Badge>
                          </FancyboxViewer>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDateTimezone(ragFile.created_at, 'date_time')}
                    </TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        <Tooltip content="Update">
                          <Button
                            variant="info"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedRagFile(ragFile);
                              setOpenUpdateDialog(true);
                            }}
                          >
                            <FaPenToSquare />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button
                            variant="destructive"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedRagFile(ragFile);
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <FaTrash />
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
      <CreateRagFileDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        refetch={ragFilesPagination.refetch}
      />
      <UpdateRagFileDialog
        open={openUpdateDialog}
        setOpen={setOpenUpdateDialog}
        refetch={ragFilesPagination.refetch}
      />
      <DeleteRagFileDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        refetch={ragFilesPagination.refetch}
      />
    </>
  );
};

export default RagFilesPage;
