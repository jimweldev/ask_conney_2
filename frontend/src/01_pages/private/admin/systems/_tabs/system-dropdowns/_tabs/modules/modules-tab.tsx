import { useState } from 'react';
import { FaPenToSquare, FaRegCircleXmark, FaTrash } from 'react-icons/fa6';
import { type SystemDropdownModule } from '@/04_types/system/system-dropdown-module';
import useSystemDropdownModuleStore from '@/05_stores/system/system-dropdown-module-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import CreateSystemDropdownModuleDialog from './_dialogs/create-system-dropdown-module-dialog';
import DeleteSystemDropdownModuleDialog from './_dialogs/delete-system-dropdown-module-dialog';
import UpdateSystemDropdownModuleDialog from './_dialogs/update-system-dropdown-module-dialog';

const ModulesTab = () => {
  // Zustand store
  const { setSelectedSystemDropdownModule } = useSystemDropdownModuleStore();

  // Dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  // Pagination
  const systemDropdownModulesPagination =
    useTanstackPaginateQuery<SystemDropdownModule>({
      endpoint: '/system/system-dropdowns/modules',
      defaultSort: '-id',
    });

  // DataTable columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Label', column: 'label' },
    { label: 'Types' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  // DataTable actions
  const actions = (
    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
      Create
    </Button>
  );

  return (
    <>
      {/* DataTable */}
      <DataTable
        pagination={systemDropdownModulesPagination}
        columns={columns}
        actions={actions}
      >
        {systemDropdownModulesPagination.data?.records?.map(
          systemDropdownModule => (
            <TableRow key={systemDropdownModule.id}>
              <TableCell>{systemDropdownModule.id}</TableCell>
              <TableCell>{systemDropdownModule.label}</TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-1">
                  {systemDropdownModule?.system_dropdown_module_types
                    ?.length === 0 ? (
                    <Badge variant="outline">
                      <FaRegCircleXmark />
                      No types
                    </Badge>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1">
                      {systemDropdownModule?.system_dropdown_module_types?.map(
                        (type, index) => (
                          <Badge key={index}>{type?.label}</Badge>
                        ),
                      )}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {getDateTimezone(systemDropdownModule.created_at, 'date_time')}
              </TableCell>
              <TableCell>
                <InputGroup size="sm">
                  <Tooltip content="Update">
                    <Button
                      variant="info"
                      size="icon-xs"
                      onClick={() => {
                        setSelectedSystemDropdownModule(systemDropdownModule);
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
                        setSelectedSystemDropdownModule(systemDropdownModule);
                        setOpenDeleteDialog(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </Tooltip>
                </InputGroup>
              </TableCell>
            </TableRow>
          ),
        )}
      </DataTable>

      {/* Dialogs */}
      <CreateSystemDropdownModuleDialog
        open={openCreateDialog}
        setOpen={setOpenCreateDialog}
        refetch={systemDropdownModulesPagination.refetch}
      />
      <UpdateSystemDropdownModuleDialog
        open={openUpdateDialog}
        setOpen={setOpenUpdateDialog}
        refetch={systemDropdownModulesPagination.refetch}
      />
      <DeleteSystemDropdownModuleDialog
        open={openDeleteDialog}
        setOpen={setOpenDeleteDialog}
        refetch={systemDropdownModulesPagination.refetch}
      />
    </>
  );
};

export default ModulesTab;
