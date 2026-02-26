import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type ExampleTask } from '@/04_types/example/example-task';
import useExampleTaskStore from '@/05_stores/example/example-task-store';
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
import CreateExampleTaskDialog from './_dialogs/create-example-task-dialog';
import DeleteExampleTaskDialog from './_dialogs/delete-example-task-dialog';
import UpdateExampleTaskDialog from './_dialogs/update-example-task-dialog';

const DataTableListPage = () => {
  // Store
  const { setSelectedExampleTask } = useExampleTaskStore();

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Tanstack query hook for pagination
  const exampleTasksPagination = useTanstackPaginateQuery<ExampleTask>({
    endpoint: '/examples/tasks',
    defaultSort: '-id',
  });

  // Table column definitions
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Name', column: 'name' },
    { label: 'Status', column: 'status' },
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
      <PageHeader className="mb-3">Example Tasks</PageHeader>

      <Card>
        <CardBody>
          <DataTable
            pagination={exampleTasksPagination}
            columns={columns}
            actions={actions}
          >
            {exampleTasksPagination.data?.records
              ? exampleTasksPagination.data.records.map(exampleTask => (
                  <TableRow key={exampleTask.id}>
                    <TableCell>{exampleTask.id}</TableCell>
                    <TableCell>{exampleTask.name}</TableCell>
                    <TableCell>{exampleTask.status}</TableCell>
                    <TableCell>
                      {getDateTimezone(exampleTask.created_at, 'date_time')}
                    </TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        <Tooltip content="Update">
                          <Button
                            variant="info"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedExampleTask(exampleTask);
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
                              setSelectedExampleTask(exampleTask);
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
      <CreateExampleTaskDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        refetch={exampleTasksPagination.refetch}
      />
      <UpdateExampleTaskDialog
        open={openUpdateDialog}
        setOpen={setOpenUpdateDialog}
        refetch={exampleTasksPagination.refetch}
      />
      <DeleteExampleTaskDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        refetch={exampleTasksPagination.refetch}
      />
    </>
  );
};

export default DataTableListPage;
