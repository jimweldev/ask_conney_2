import { useState } from 'react';
import { FaSortAmountUpAlt } from 'react-icons/fa';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { type SystemDropdown } from '@/04_types/system/system-dropdown';
import useSystemDropdownStore from '@/05_stores/system/system-dropdown-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import SystemDropdownModuleSelect from '@/components/react-select/system-dropdown-module-select';
import SystemDropdownModuleTypeSelect from '@/components/react-select/system-dropdown-module-type-select';
import Tooltip from '@/components/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import CreateSystemDropdownDialog from './_dialogs/create-system-dropdown-dialog';
import DeleteSystemDropdownDialog from './_dialogs/delete-system-dropdown-dialog';
import SortSystemDropdownsDialog from './_dialogs/sort-system-dropdown/sort-system-dropdowns-dialog';
import UpdateSystemDropdownDialog from './_dialogs/update-system-dropdown-dialog';

const DropdownsTab = () => {
  // Store
  const { setSelectedSystemDropdown } = useSystemDropdownStore();

  // Dialog States
  const [openCreateSystemDropdownDialog, setOpenCreateSystemDropdownDialog] =
    useState(false);
  const [openUpdateSystemDropdownDialog, setOpenUpdateSystemDropdownDialog] =
    useState(false);
  const [openDeleteSystemDropdownDialog, setOpenDeleteSystemDropdownDialog] =
    useState(false);
  const [openSortSystemDropdownsDialog, setOpenSortSystemDropdownsDialog] =
    useState(false);

  const [selectedModule, setSelectedModule] =
    useState<ReactSelectOption | null>(null);
  const [selectedModuleType, setSelectedModuleType] =
    useState<ReactSelectOption | null>(null);

  // Tanstack query hook for pagination
  const systemDropdownsPagination = useTanstackPaginateQuery<SystemDropdown>({
    endpoint: '/system/system-dropdowns',
    defaultSort: 'module,type,order,label',
    params: `${selectedModule?.value ? 'module=' + selectedModule.value : ''}${selectedModuleType?.value ? '&type=' + selectedModuleType.value : ''}`,
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Module', column: 'module' },
    { label: 'Type', column: 'type' },
    { label: 'Order', column: 'module,type,order,label' },
    { label: 'Label', column: 'label' },
    { label: 'Properties' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  // Actions buttons
  const actions = (
    <>
      <Button
        size="sm"
        onClick={() => {
          setOpenCreateSystemDropdownDialog(true);
        }}
      >
        Create
      </Button>

      <SystemDropdownModuleSelect
        size="sm"
        className="w-full max-w-[160px]"
        placeholder="Select module"
        onChange={(value: ReactSelectOption | null) => {
          setSelectedModule(value);
          setSelectedModuleType(null); // clears the second dropdown
        }}
        isClearable
      />
      <SystemDropdownModuleTypeSelect
        value={selectedModuleType} // REQUIRED for clearing to work
        system_dropdown_module={selectedModule?.label}
        size="sm"
        className="w-full max-w-[160px]"
        placeholder="Select type"
        onChange={setSelectedModuleType}
        isClearable
      />
      <Button
        size="icon-sm"
        variant="outline"
        onClick={() => setOpenSortSystemDropdownsDialog(true)}
        disabled={!selectedModule || !selectedModuleType}
      >
        <FaSortAmountUpAlt />
      </Button>
    </>
  );

  return (
    <>
      {/* Data Table */}
      <DataTable
        pagination={systemDropdownsPagination}
        columns={columns}
        actions={actions}
      >
        {/* Render rows only if data is present */}
        {systemDropdownsPagination.data?.records
          ? systemDropdownsPagination.data.records.map(systemDropdown => (
              <TableRow key={systemDropdown.id}>
                <TableCell>{systemDropdown.id}</TableCell>
                <TableCell>
                  <Badge>{systemDropdown.module}</Badge>
                </TableCell>
                <TableCell>
                  <Badge>{systemDropdown.type}</Badge>
                </TableCell>
                <TableCell>{systemDropdown.order}</TableCell>
                <TableCell>{systemDropdown.label}</TableCell>
                <TableCell>
                  {systemDropdown.properties
                    ? JSON.stringify(systemDropdown.properties, null, 2)
                    : ''}
                </TableCell>

                <TableCell>
                  {getDateTimezone(systemDropdown.created_at, 'date_time')}
                </TableCell>
                <TableCell>
                  <InputGroup size="sm">
                    {/* Update button */}
                    <Tooltip content="Update">
                      <Button
                        variant="info"
                        size="icon-xs"
                        onClick={() => {
                          setSelectedSystemDropdown(systemDropdown);
                          setOpenUpdateSystemDropdownDialog(true);
                        }}
                      >
                        <FaPenToSquare />
                      </Button>
                    </Tooltip>

                    {/* Delete button */}
                    <Tooltip content="Delete">
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => {
                          setSelectedSystemDropdown(systemDropdown);
                          setOpenDeleteSystemDropdownDialog(true);
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

      {/* Dialogs */}
      <CreateSystemDropdownDialog
        open={openCreateSystemDropdownDialog}
        setOpen={setOpenCreateSystemDropdownDialog}
        refetch={systemDropdownsPagination.refetch}
      />
      <UpdateSystemDropdownDialog
        open={openUpdateSystemDropdownDialog}
        setOpen={setOpenUpdateSystemDropdownDialog}
        refetch={systemDropdownsPagination.refetch}
      />
      <DeleteSystemDropdownDialog
        open={openDeleteSystemDropdownDialog}
        setOpen={setOpenDeleteSystemDropdownDialog}
        refetch={systemDropdownsPagination.refetch}
      />
      <SortSystemDropdownsDialog
        open={openSortSystemDropdownsDialog}
        setOpen={setOpenSortSystemDropdownsDialog}
        refetch={systemDropdownsPagination.refetch}
        module={selectedModule?.label || ''}
        type={selectedModuleType?.label || ''}
      />
    </>
  );
};

export default DropdownsTab;
