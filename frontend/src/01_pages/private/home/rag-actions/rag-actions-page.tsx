import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type RagAction } from '@/04_types/rag/rag-action';
import useRagActionStore from '@/05_stores/rag/rag-action-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import CreateRagActionDialog from './_dialogs/create-rag-action-dialog';
import DeleteRagActionDialog from './_dialogs/delete-rag-action-dialog';
import UpdateRagActionDialog from './_dialogs/update-rag-action-dialog';

const RagActionsPage = () => {
  // Store
  const { setSelectedRagAction } = useRagActionStore();

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Tanstack query hook for pagination
  const ragActionsPagination = useTanstackPaginateQuery<RagAction>({
    endpoint: '/rag/actions',
    defaultSort: '-id',
  });

  // Table column definitions
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Name', column: 'name' },
    { label: 'Description', column: 'description' },
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
      <PageHeader className="mb-3">Rag Actions</PageHeader>

      <Card>
        <CardBody>
          <DataTable
            pagination={ragActionsPagination}
            columns={columns}
            actions={actions}
          >
            {ragActionsPagination.data?.records
              ? ragActionsPagination.data.records.map(ragAction => (
                  <TableRow key={ragAction.id}>
                    <TableCell>{ragAction.id}</TableCell>
                    <TableCell>{ragAction.name}</TableCell>
                    <TableCell>{ragAction.description}</TableCell>
                    <TableCell>
                      {getDateTimezone(ragAction.created_at, 'date_time')}
                    </TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        <Tooltip content="Update">
                          <Button
                            variant="info"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedRagAction(ragAction);
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
                              setSelectedRagAction(ragAction);
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
      <CreateRagActionDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        refetch={ragActionsPagination.refetch}
      />
      <UpdateRagActionDialog
        open={openUpdateDialog}
        setOpen={setOpenUpdateDialog}
        refetch={ragActionsPagination.refetch}
      />
      <DeleteRagActionDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        refetch={ragActionsPagination.refetch}
      />
    </>
  );
};

export default RagActionsPage;
