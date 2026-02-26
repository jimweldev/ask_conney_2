import { useState } from 'react';
import {
  FaCopy,
  FaFilter,
  FaFingerprint,
  FaPenToSquare,
  FaPlus,
  FaRegCircleXmark,
  FaShield,
  FaTrash,
  FaXmark,
} from 'react-icons/fa6';
import ReactSelect from 'react-select';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { type User } from '@/04_types/user/user';
import useUserStore from '@/05_stores/user/user-store';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import FancyboxViewer from '@/components/fancybox/fancybox-viewer';
import ReactImage from '@/components/image/react-image';
import InputGroup from '@/components/input-group/input-group';
import UserSelect from '@/components/react-select/user-select';
import Tooltip from '@/components/tooltip/tooltip';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { TableCell, TableRow } from '@/components/ui/table';
import useFancybox from '@/hooks/fancybox/use-fancybox';
import useTanstackPostPaginateQuery, {
  type FilterCondition,
  type FilterOutput,
} from '@/hooks/tanstack/use-tanstack-post-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { formatName } from '@/lib/user/format-name';
import CreateUserDialog from './_dialogs/create-user-dialog';
import DeleteUserDialog from './_dialogs/delete-user-dialog';
import DisableUser2faDialog from './_dialogs/disable-user-2fa-dialog';
import UpdateUserDialog from './_dialogs/update-user-dialog';
import UpdateUserRolesDialog from './_dialogs/update-user-roles-dialog';

// Define types for filter rows
type FilterField = 'id' | 'is_admin' | 'full_name' | null;
type Operator =
  | '=='
  | '!='
  | '>'
  | '>='
  | '<'
  | '<='
  | 'like'
  | 'not_like'
  | null;

// Initial data structure for a filter row
const initialFilterRow: FilterRow = {
  id: Date.now(),
  field: null,
  operator: '==',
  value: '',
};

// Initial data structure for a group
const initialGroup: FilterGroup = {
  filters: [{ ...initialFilterRow, id: Date.now() }],
};

type FilterRow = {
  id: number;
  field: FilterField;
  operator: Operator;
  value: string | ReactSelectOption | null;
};

type FilterGroup = {
  filters: FilterRow[];
};

const ActiveUsersTab = () => {
  // Store
  const { setSelectedUser } = useUserStore();

  const [fancyboxRef] = useFancybox();

  // Dialog States
  const [openCreateUserDialog, setOpenCreateUserDialog] = useState(false);
  const [openUpdateUserDialog, setOpenUpdateUserDialog] = useState(false);
  const [openDeleteUserDialog, setOpenDeleteUserDialog] = useState(false);
  const [openUpdateUserRolesDialog, setOpenUpdateUserRolesDialog] =
    useState(false);
  const [openDisableUser2faDialog, setOpenDisableUser2faDialog] =
    useState(false);

  const [groupFilters, setGroupFilters] = useState<FilterOutput>([]);

  // Tanstack query hook for pagination
  const usersPagination = useTanstackPostPaginateQuery<User>({
    endpoint: '/users/filter',
    defaultSort: 'first_name,last_name',
    groupFilters: groupFilters,
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Name', column: 'first_name,last_name' },
    { label: 'Admin' },
    { label: 'Roles' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  const [openFilter, setOpenFilter] = useState(true);

  // Actions buttons
  const actions = (
    <>
      <Button
        variant={groupFilters.length > 0 ? 'success' : 'outline'}
        size="icon-sm"
        onClick={() => setOpenFilter(!openFilter)}
      >
        <FaFilter />
      </Button>
      <Button size="sm" onClick={() => setOpenCreateUserDialog(true)}>
        Create
      </Button>
    </>
  );

  // State to manage filter groups
  const [groups, setGroups] = useState<FilterGroup[]>([initialGroup]);

  // Function to add a new filter row to a specific group
  const addFilterToGroup = (groupIndex: number) => {
    setGroups(prevGroups =>
      prevGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              filters: [
                ...group.filters,
                { ...initialFilterRow, id: Date.now() },
              ],
            }
          : group,
      ),
    );
  };

  // Function to remove a filter row from a group
  const removeFilterFromGroup = (groupIndex: number, filterId: number) => {
    setGroups(prevGroups =>
      prevGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              filters: group.filters.filter(filter => filter.id !== filterId),
            }
          : group,
      ),
    );
  };

  // Function to add a new group
  const addNewGroup = () => {
    setGroups(prevGroups => [
      ...prevGroups,
      {
        filters: [{ ...initialFilterRow, id: Date.now() }],
      },
    ]);
  };

  // Function to remove a group
  const removeGroup = (groupIndex: number) => {
    setGroups(prevGroups =>
      prevGroups.filter((_, index) => index !== groupIndex),
    );
  };

  // Function to update a filter in a group
  const updateFilterInGroup = (
    groupIndex: number,
    filterId: number,
    field: keyof FilterRow,
    value: string | null | ReactSelectOption,
  ) => {
    setGroups(prevGroups =>
      prevGroups.map((group, index) =>
        index === groupIndex
          ? {
              ...group,
              filters: group.filters.map(filter =>
                filter.id === filterId ? { ...filter, [field]: value } : filter,
              ),
            }
          : group,
      ),
    );
  };

  // Function to duplicate a group
  const duplicateGroup = (groupIndex: number) => {
    const groupToDuplicate = groups[groupIndex];
    if (groupToDuplicate) {
      const newGroup: FilterGroup = {
        filters: groupToDuplicate.filters.map(filter => ({
          ...filter,
          id: Date.now() + Math.random(),
        })),
      };
      setGroups(prevGroups => [...prevGroups, newGroup]);
    }
  };

  // Options for the selects
  const fieldOptions = [
    {
      label: 'User',
      value: 'id',
    },
    {
      label: 'Admin',
      value: 'is_admin',
    },
    {
      label: 'Name',
      value: 'full_name',
    },
  ];
  const operatorOptions = convertToSelectOptions([
    '==',
    '!=',
    '>',
    '>=',
    '<',
    '<=',
    'like',
    'not_like',
  ]);

  // Options for Admin field (Yes/No)
  const adminOptions: ReactSelectOption[] = [
    { value: '1', label: 'Yes' },
    { value: '0', label: 'No' },
  ];

  // Render the appropriate input component based on the selected field
  const renderValueInput = (groupIndex: number, filter: FilterRow) => {
    switch (filter.field) {
      case 'id':
        return (
          <UserSelect
            className="react-select-container-sm w-full"
            classNamePrefix="react-select-sm"
            value={
              typeof filter.value === 'object'
                ? (filter.value as ReactSelectOption)
                : null
            }
            onChange={(selectedOption: ReactSelectOption | null) =>
              updateFilterInGroup(
                groupIndex,
                filter.id,
                'value',
                selectedOption || null,
              )
            }
          />
        );
      case 'is_admin':
        return (
          <ReactSelect
            className="react-select-container-sm w-full"
            classNamePrefix="react-select-sm"
            options={adminOptions}
            value={
              typeof filter.value === 'object'
                ? (filter.value as ReactSelectOption)
                : filter.value === '1' || filter.value === '0'
                  ? adminOptions.find(opt => opt.value === filter.value)
                  : null
            }
            onChange={(selectedOption: ReactSelectOption | null) =>
              updateFilterInGroup(
                groupIndex,
                filter.id,
                'value',
                selectedOption || null,
              )
            }
            placeholder="Select..."
          />
        );
      case 'full_name':
        return (
          <Input
            inputSize="sm"
            placeholder="Search"
            value={typeof filter.value === 'string' ? filter.value : ''}
            onChange={e =>
              updateFilterInGroup(
                groupIndex,
                filter.id,
                'value',
                e.target.value,
              )
            }
            className="w-full"
          />
        );
      default:
        return (
          <Input
            inputSize="sm"
            placeholder="Search"
            value={typeof filter.value === 'string' ? filter.value : ''}
            onChange={e =>
              updateFilterInGroup(
                groupIndex,
                filter.id,
                'value',
                e.target.value,
              )
            }
            className="w-full"
          />
        );
    }
  };

  const applyFilters = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Convert groups to FilterOutput format (array of groups, each group is array of conditions)
    const filterOutput: FilterOutput = groups
      .map(group => {
        // Process filters in this group
        const groupConditions: FilterCondition[] = group.filters
          .map(filter => {
            // Skip incomplete filters
            if (!filter.field || !filter.operator) {
              return null;
            }

            // Extract value from object if it's an object
            let value: string | undefined;

            if (filter.value === null || filter.value === undefined) {
              value = undefined;
            } else if (
              typeof filter.value === 'object' &&
              filter.value !== null &&
              'value' in filter.value
            ) {
              // Extract value from ReactSelectOption object
              const extractedValue = (filter.value as ReactSelectOption).value;
              value =
                typeof extractedValue === 'number'
                  ? extractedValue.toString()
                  : extractedValue;
            } else if (typeof filter.value === 'string') {
              // Already a string
              value = filter.value;
            } else {
              // Fallback: convert to string
              value = String(filter.value);
            }

            // Skip if value is empty
            if (value === undefined || value === '') {
              return null;
            }

            // Handle special cases for certain fields
            let finalValue = value;

            // For is_admin field, ensure the value is '1' or '0'
            if (filter.field === 'is_admin') {
              if (value === 'Yes' || value === '1') {
                finalValue = '1';
              } else if (value === 'No' || value === '0') {
                finalValue = '0';
              }
            }

            // For id field (User select), we need to extract the numeric ID
            if (filter.field === 'id' && typeof filter.value === 'object') {
              const userOption = filter.value as ReactSelectOption;
              if (userOption.value) {
                finalValue = String(userOption.value);
              }
            }

            // Return filter condition
            return {
              field: filter.field as string,
              operator: filter.operator as string,
              value: finalValue,
            } as FilterCondition;
          })
          .filter(
            (condition): condition is FilterCondition => condition !== null,
          );

        // Return the group conditions only if there are valid conditions
        return groupConditions.length > 0 ? groupConditions : null;
      })
      .filter((group): group is FilterCondition[] => group !== null);

    // Set the groupFilters state - this will trigger the query to refetch
    setGroupFilters(filterOutput);

    // Force a refetch by calling refetch on the pagination hook
    // This ensures the data is refetched even if filters haven't changed
    usersPagination.refetch();
  };

  return (
    <>
      <div className="gap-layout flex items-start">
        <Card
          className={`hidden w-[500px] shrink-0 transition-all duration-300 lg:block ${
            openFilter ? 'ml-0' : '-mr-layout -ml-[500px] opacity-0'
          }`}
        >
          <CardBody>
            <h4 className="text-muted-foreground mb-0.5 font-semibold">
              Filter
            </h4>

            <form className="flex flex-col gap-2" onSubmit={applyFilters}>
              {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="rounded-lg border-2 p-2">
                  <div className="mb-1 flex items-end justify-between gap-2">
                    <h6 className="text-xs font-semibold">
                      Group {groupIndex + 1}
                    </h6>

                    <div className="flex gap-1">
                      <Button
                        variant="info"
                        size="icon-xs"
                        onClick={() => duplicateGroup(groupIndex)}
                      >
                        <FaCopy />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon-xs"
                        onClick={() => removeGroup(groupIndex)}
                        disabled={groups.length <= 1}
                      >
                        <FaTrash />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.filters.map(filter => (
                      <div key={filter.id} className="flex gap-1">
                        <ReactSelect
                          className="react-select-container-sm w-[250px]"
                          classNamePrefix="react-select-sm"
                          options={fieldOptions}
                          value={fieldOptions.find(
                            opt => opt.value === filter.field,
                          )}
                          onChange={selectedOption =>
                            updateFilterInGroup(
                              groupIndex,
                              filter.id,
                              'field',
                              selectedOption?.value || null,
                            )
                          }
                          placeholder="Field"
                        />
                        <ReactSelect
                          className="react-select-container-sm w-[200px]"
                          classNamePrefix="react-select-sm"
                          options={operatorOptions}
                          value={operatorOptions.find(
                            opt => opt.value === filter.operator,
                          )}
                          onChange={selectedOption =>
                            updateFilterInGroup(
                              groupIndex,
                              filter.id,
                              'operator',
                              selectedOption?.value || null,
                            )
                          }
                          placeholder="Operator"
                        />
                        <div className="w-full">
                          {renderValueInput(groupIndex, filter)}
                        </div>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          onClick={() =>
                            removeFilterFromGroup(groupIndex, filter.id)
                          }
                          disabled={group.filters.length <= 1}
                        >
                          <FaXmark />
                        </Button>
                      </div>
                    ))}
                    <Button
                      className="border border-dashed"
                      variant="ghost"
                      size="sm"
                      onClick={() => addFilterToGroup(groupIndex)}
                    >
                      <FaPlus />
                      Add Filter
                    </Button>
                  </div>
                </div>
              ))}

              {/* Group Management and Apply Button Section */}
              <div className="flex items-center justify-between gap-2">
                <Button variant="outline" size="sm" onClick={addNewGroup}>
                  <FaPlus />
                  Add Group
                </Button>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setGroups([initialGroup]);
                      setGroupFilters([]); // Clear applied filters
                    }}
                  >
                    Reset Filters
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={usersPagination.isFetching}
                    type="submit"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Card */}
        <Card className="min-w-0 flex-1" ref={fancyboxRef}>
          <CardBody>
            {/* Data Table */}
            <DataTable
              pagination={usersPagination}
              columns={columns}
              actions={actions}
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
                                className="outline-primary border-card flex size-7 items-center justify-center overflow-hidden rounded-full border outline-2"
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
                        <Badge
                          variant={user.is_admin ? 'default' : 'secondary'}
                        >
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
                          {/* Update button */}
                          <Tooltip content="Update">
                            <Button
                              variant="info"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenUpdateUserDialog(true);
                              }}
                            >
                              <FaPenToSquare />
                            </Button>
                          </Tooltip>

                          {/* Update Roles button */}
                          <Tooltip content="Update user roles">
                            <Button
                              variant="warning"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenUpdateUserRolesDialog(true);
                              }}
                            >
                              <FaShield />
                            </Button>
                          </Tooltip>

                          {/* Disable 2fa button */}
                          <Tooltip content="Disable 2fa">
                            <Button
                              variant="success"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenDisableUser2faDialog(true);
                              }}
                              disabled={!user.is_two_factor_enabled}
                            >
                              <FaFingerprint />
                            </Button>
                          </Tooltip>

                          {/* Delete button */}
                          <Tooltip content="Delete">
                            <Button
                              variant="destructive"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedUser(user);
                                setOpenDeleteUserDialog(true);
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
      </div>

      {/* Dialogs */}
      <CreateUserDialog
        open={openCreateUserDialog}
        setOpen={setOpenCreateUserDialog}
        refetch={usersPagination.refetch}
      />
      <UpdateUserDialog
        open={openUpdateUserDialog}
        setOpen={setOpenUpdateUserDialog}
        refetch={usersPagination.refetch}
      />
      <DeleteUserDialog
        open={openDeleteUserDialog}
        setOpen={setOpenDeleteUserDialog}
        refetch={usersPagination.refetch}
      />
      <UpdateUserRolesDialog
        open={openUpdateUserRolesDialog}
        setOpen={setOpenUpdateUserRolesDialog}
        refetch={usersPagination.refetch}
      />
      <DisableUser2faDialog
        open={openDisableUser2faDialog}
        setOpen={setOpenDisableUser2faDialog}
        refetch={usersPagination.refetch}
      />
    </>
  );
};

export default ActiveUsersTab;
