import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type RbacRole } from '@/04_types/rbac/rbac-role';
import useRoleStore from '@/05_stores/rbac/rbac-role-store';
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
import CreateRoleDialog from './_dialogs/create-role-dialog';
import DeleteRoleDialog from './_dialogs/delete-role-dialog';
import UpdateRoleDialog from './_dialogs/update-role-dialog';

const RolesTab = () => {
  // Store
  const { setSelectedRole } = useRoleStore();

  // Dialog States
  const [openCreateRoleDialog, setOpenCreateRoleDialog] = useState(false);
  const [openUpdateRoleDialog, setOpenUpdateRoleDialog] = useState(false);
  const [openDeleteRoleDialog, setOpenDeleteRoleDialog] = useState(false);

  // Tanstack query hook for pagination
  const rolesPagination = useTanstackPaginateQuery<RbacRole>({
    endpoint: '/rbac/roles',
    defaultSort: 'label',
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Label', column: 'label' },
    { label: 'Value', column: 'value' },
    { label: 'Permissions' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  // Actions buttons
  const actions = (
    <Button
      size="sm"
      onClick={() => {
        setOpenCreateRoleDialog(true);
      }}
    >
      Create
    </Button>
  );

  return (
    <>
      {/* Data Table */}
      <DataTable
        pagination={rolesPagination}
        columns={columns}
        actions={actions}
      >
        {/* Render rows only if data is present */}
        {rolesPagination.data?.records
          ? rolesPagination.data.records.map(role => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.label}</TableCell>
                <TableCell>{role.value}</TableCell>
                <TableCell className="flex flex-wrap gap-1">
                  {role.rbac_role_permissions?.map(rolePermission => (
                    <Badge key={rolePermission.id}>
                      {rolePermission.rbac_permission?.label}
                    </Badge>
                  ))}
                </TableCell>
                <TableCell>
                  {getDateTimezone(role.created_at, 'date_time')}
                </TableCell>
                <TableCell>
                  <InputGroup size="sm">
                    {/* Update button */}
                    <Tooltip content="Update">
                      <Button
                        variant="info"
                        size="icon-xs"
                        onClick={() => {
                          setSelectedRole(role);
                          setOpenUpdateRoleDialog(true);
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
                          setSelectedRole(role);
                          setOpenDeleteRoleDialog(true);
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
      <CreateRoleDialog
        open={openCreateRoleDialog}
        setOpen={setOpenCreateRoleDialog}
        refetch={rolesPagination.refetch}
      />
      <UpdateRoleDialog
        open={openUpdateRoleDialog}
        setOpen={setOpenUpdateRoleDialog}
        refetch={rolesPagination.refetch}
      />
      <DeleteRoleDialog
        open={openDeleteRoleDialog}
        setOpen={setOpenDeleteRoleDialog}
        refetch={rolesPagination.refetch}
      />
    </>
  );
};

export default RolesTab;
