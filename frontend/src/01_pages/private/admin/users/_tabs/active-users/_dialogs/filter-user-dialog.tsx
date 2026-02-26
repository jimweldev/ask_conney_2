import { FaCopy, FaPlus, FaTrash, FaXmark } from 'react-icons/fa6';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  id: Date.now(),
  name: 'Group 1',
  filters: [{ ...initialFilterRow, id: Date.now() }],
};

type FilterRow = {
  id: number;
  field: FilterField;
  operator: Operator;
  value: string | ReactSelectOption | null;
};

type FilterGroup = {
  id: number;
  name: string;
  filters: FilterRow[];
};

// Component Props
type FilterUserDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  applyFilters: () => void;
  groups: {
    id: number;
    name: string;
    filters: { id: number; field: string }[];
  }[];
  setGroups: React.Dispatch<
    React.SetStateAction<
      {
        id: number;
        name: string;
        filters: { id: number; field: string }[];
      }[]
    >
  >;
};

const FilterUserDialog = ({
  open,
  setOpen,
  applyFilters,
  groups,
  setGroups,
}: FilterUserDialogProps) => {
  // Function to add a new filter row to a specific group
  const addFilterToGroup = (groupId: number) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
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
  const removeFilterFromGroup = (groupId: number, filterId: number) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
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
    // Get all group names that start with "Group" followed by a number
    const groupNumbers = groups
      .map(group => {
        const match = group.name.match(/^Group (\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => num > 0);

    // Find the next available group number
    const nextGroupNumber =
      groupNumbers.length > 0
        ? Math.max(...groupNumbers) + 1
        : groups.length + 1;

    setGroups(prevGroups => [
      ...prevGroups,
      {
        id: Date.now(),
        name: `Group ${nextGroupNumber}`,
        filters: [{ ...initialFilterRow, id: Date.now() }],
      },
    ]);
  };

  // Function to remove a group
  const removeGroup = (groupId: number) => {
    setGroups(prevGroups => prevGroups.filter(group => group.id !== groupId));
  };

  // Function to update a filter in a group
  const updateFilterInGroup = (
    groupId: number,
    filterId: number,
    field: keyof FilterRow,
    value: string | null | ReactSelectOption,
  ) => {
    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId
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
  const duplicateGroup = (groupId: number) => {
    const groupToDuplicate = groups.find(group => group.id === groupId);
    if (groupToDuplicate) {
      // Find the next available group number
      const groupNumberPattern = /^Group (\d+)/;
      let maxGroupNumber = 0;

      groups.forEach(group => {
        const match = group.name.match(groupNumberPattern);
        if (match) {
          const num = parseInt(match[1], 10);
          if (num > maxGroupNumber) {
            maxGroupNumber = num;
          }
        }
      });

      // Check for duplicate names and find the next available number
      const existingGroupNames = groups.map(group => group.name);
      let nextGroupNumber = maxGroupNumber + 1;

      // Keep incrementing until we find an available name
      while (existingGroupNames.includes(`Group ${nextGroupNumber}`)) {
        nextGroupNumber++;
      }

      const newGroup: FilterGroup = {
        ...groupToDuplicate,
        id: Date.now(),
        name: `Group ${nextGroupNumber}`,
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
  const renderValueInput = (group: FilterGroup, filter: FilterRow) => {
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
                group.id,
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
                group.id,
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
              updateFilterInGroup(group.id, filter.id, 'value', e.target.value)
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
              updateFilterInGroup(group.id, filter.id, 'value', e.target.value)
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus={true}>
        {/* Dialog header */}
        <DialogHeader>
          <DialogTitle>Create User</DialogTitle>
        </DialogHeader>

        {/* Dialog body */}
        <DialogBody>
          <form className="flex flex-col gap-2" onSubmit={applyFilters}>
            {groups.map(group => (
              <div key={group.id} className="rounded-lg border-2 p-2">
                <div className="mb-1 flex items-end justify-between gap-2">
                  <h6 className="text-xs font-semibold">{group.name}</h6>

                  <div className="flex gap-1">
                    <Button
                      variant="info"
                      size="icon-xs"
                      onClick={() => duplicateGroup(group.id)}
                    >
                      <FaCopy />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon-xs"
                      onClick={() => removeGroup(group.id)}
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
                            group.id,
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
                            group.id,
                            filter.id,
                            'operator',
                            selectedOption?.value || null,
                          )
                        }
                        placeholder="Operator"
                      />
                      <div className="w-full">
                        {renderValueInput(group, filter)}
                      </div>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() =>
                          removeFilterFromGroup(group.id, filter.id)
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
                    onClick={() => addFilterToGroup(group.id)}
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
        </DialogBody>

        {/* Dialog footer */}
        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FilterUserDialog;
