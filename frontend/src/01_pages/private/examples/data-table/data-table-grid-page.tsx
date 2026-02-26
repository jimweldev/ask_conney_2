import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type ExampleTask } from '@/04_types/example/example-task';
import useExampleTaskStore from '@/05_stores/example/example-task-store';
import DataTable from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import DataTableGridSkeleton from '@/components/skeleton/data-table-grid-skeleton';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import CreateExampleTaskDialog from './_dialogs/create-example-task-dialog';
import DeleteExampleTaskDialog from './_dialogs/delete-example-task-dialog';
import UpdateExampleTaskDialog from './_dialogs/update-example-task-dialog';

const DataTableGridPage = () => {
  // Store
  const { setSelectedExampleTask } = useExampleTaskStore();

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Tanstack query hook for pagination
  const exampleTasksPagination = useTanstackPaginateQuery<ExampleTask>({
    endpoint: '/examples/tasks',
    defaultSort: 'id',
  });

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
            actions={actions}
            defaultView="grid"
            gridSkeleton={
              <DataTableGridSkeleton count={exampleTasksPagination.limit} />
            }
          >
            {exampleTasksPagination.data?.records ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {exampleTasksPagination.data.records.map(exampleTask => (
                  <div className="p-layout rounded border" key={exampleTask.id}>
                    <h4 className="mb-layout">{exampleTask.name}</h4>

                    <div className="flex justify-end">
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
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
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

export default DataTableGridPage;
