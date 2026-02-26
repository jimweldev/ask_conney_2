import { useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { FaRegCircleXmark } from 'react-icons/fa6';
import { type User } from '@/04_types/user/user';
import useUserStore from '@/05_stores/user/user-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import FancyboxViewer from '@/components/fancybox/fancybox-viewer';
import ReactImage from '@/components/image/react-image';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import useFancybox from '@/hooks/fancybox/use-fancybox';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import { formatName } from '@/lib/user/format-name';
import RestoreUserDialog from './_dialogs/restore-user-dialog';

const ArchivedUsersTab = () => {
  // Store
  const { setSelectedUser } = useUserStore();

  const [fancyboxRef] = useFancybox();

  // Dialog States
  const [openRestoreUserDialog, setOpenRestoreUserDialog] = useState(false);

  // Tanstack query hook for pagination
  const usersPagination = useTanstackPaginateQuery<User>({
    endpoint: '/users/archived',
    defaultSort: 'last_name,first_name',
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Name', column: 'last_name,first_name' },
    { label: 'Admin' },
    { label: 'Roles' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  return (
    <>
      {/* Card */}
      <Card ref={fancyboxRef}>
        <CardBody>
          {/* Data Table */}
          <DataTable
            pagination={usersPagination}
            columns={columns}
            listSkeleton={<Skeleton className="h-8 w-full" />}
          >
            {/* Render rows only if data is present */}
            {usersPagination.data?.records
              ? usersPagination.data.records.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="shrink-0">
                          <FancyboxViewer
                            baseUrl={import.meta.env.VITE_STORAGE_BASE_URL}
                            filePath={user.avatar_path}
                            data-fancybox={`${user.id}`}
                            data-caption={formatName(user)}
                            fallback="/images/default-avatar.png"
                          >
                            <ReactImage
                              className="outline-primary border-card flex size-7 items-center justify-center overflow-hidden rounded-full border-1 outline-2"
                              src={`${import.meta.env.VITE_STORAGE_BASE_URL}${user?.avatar_path}`}
                              fallback="/images/default-avatar.png"
                            />
                          </FancyboxViewer>
                        </div>

                        <div>
                          <h6 className="text-xs font-semibold">
                            {formatName(user)}
                          </h6>
                          <p className="text-muted-foreground text-xs">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                        {user.is_admin ? 'Admin' : 'User'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {user?.rbac_user_roles?.length === 0 ? (
                          <Badge variant="outline">
                            <FaRegCircleXmark />
                            No roles
                          </Badge>
                        ) : (
                          <div className="flex flex-wrap items-center gap-1">
                            {user?.rbac_user_roles?.map(role => (
                              <Badge key={role.id}>
                                {role.rbac_role?.label}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDateTimezone(user.created_at, 'date_time')}
                    </TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        {/* Restore button */}
                        <Tooltip content="Restore">
                          <Button
                            variant="warning"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedUser(user);
                              setOpenRestoreUserDialog(true);
                            }}
                          >
                            <FaHistory />
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
      <RestoreUserDialog
        open={openRestoreUserDialog}
        setOpen={setOpenRestoreUserDialog}
        refetch={usersPagination.refetch}
      />
    </>
  );
};

export default ArchivedUsersTab;
