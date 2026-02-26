import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { FaArrowsRotate } from 'react-icons/fa6';
import { toast } from 'sonner';
import type { SystemDropdown } from '@/04_types/system/system-dropdown';
import { mainInstance } from '@/07_instances/main-instance';
import ComponentMultipier from '@/components/other/component-multiplier';
import Tooltip from '@/components/tooltip/tooltip';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import useTanstackQuery from '@/hooks/tanstack/use-tanstack-query';
import SystemDropdownDndContext from './_components/system-dropdown-dnd-context';
import SystemDropdownSortableContext from './_components/system-dropdown-sortable-context';
import SystemDropdownSortableItem from './_components/system-dropdown-sortable-item';

// Component Props
type SortSystemDropdownsDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
  module: string;
  type: string;
};

const SortSystemDropdownsDialog = ({
  open,
  setOpen,
  refetch,
  module,
  type,
}: SortSystemDropdownsDialogProps) => {
  const {
    data,
    isFetching,
    error,
    refetch: refetchSystemDropdowns,
  } = useTanstackQuery<SystemDropdown[]>(
    {
      endpoint: `/system/system-dropdowns/${module}/${type}`,
      params: 'sort=order,label',
    },
    { enabled: !!(open && module && type) },
  );

  // Initialize items as empty array
  const [items, setItems] = useState<SystemDropdown[]>([]);

  // Update items when API data changes
  useEffect(() => {
    if (data) {
      setItems(data);
    }
  }, [data]);

  const handleItemsChange = (newItems: SystemDropdown[]) => {
    setItems(newItems);
  };

  const resetSort = () => {
    if (data) {
      setItems(data);
    }
  };

  // Function to sort items ascending by label
  const sortByLabelAsc = () => {
    setItems(prev =>
      [...prev].sort((a, b) => (a.label ?? '').localeCompare(b.label ?? '')),
    );
  };

  // Function to sort items descending by label
  const sortByLabelDesc = () => {
    setItems(prev =>
      [...prev].sort((a, b) => (b.label ?? '').localeCompare(a.label ?? '')),
    );
  };

  const [isLoadingUpdateItem, setIsLoadingUpdateItem] = useState(false);

  const onSubmit = () => {
    setIsLoadingUpdateItem(true);

    const payload = items.map((item, index) => ({
      ...item,
      order: index + 1, // ensure order is updated
    }));

    toast.promise(mainInstance.put(`/system/system-dropdowns/order`, payload), {
      loading: 'Loading...',
      success: () => {
        refetch();
        setOpen(false);
        return 'Success!';
      },
      error: error => {
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoadingUpdateItem(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sort System Dropdowns</DialogTitle>
        </DialogHeader>

        <DialogBody>
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={resetSort}>
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={sortByLabelAsc}>
                Sort A → Z
              </Button>
              <Button variant="outline" size="sm" onClick={sortByLabelDesc}>
                Sort Z → A
              </Button>
            </div>

            <Tooltip content="Refresh">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => {
                  refetchSystemDropdowns();
                }}
                disabled={isFetching}
              >
                <FaArrowsRotate className={isFetching ? 'animate-spin' : ''} />
              </Button>
            </Tooltip>
          </div>

          {error ? (
            <div className="p-layout flex flex-col items-center gap-2 rounded-lg border">
              <p className="text-sm font-semibold">
                {isAxiosError(error) && error.response?.data?.message
                  ? error.response.data.message
                  : 'An error occurred'}
              </p>
              <p className="text-xs">
                {isAxiosError(error) && error.response?.data?.error
                  ? error.response.data.error
                  : 'Unknown error occurred'}
              </p>
            </div>
          ) : (
            <SystemDropdownDndContext
              items={items}
              onItemsChange={handleItemsChange}
            >
              <SystemDropdownSortableContext items={items}>
                <div className="flex flex-col gap-2">
                  {isFetching ? (
                    <ComponentMultipier
                      count={5}
                      component={<Skeleton className="h-9" />}
                    />
                  ) : (
                    items.map((item, index) => (
                      <SystemDropdownSortableItem
                        key={item.label}
                        label={item.label!}
                        index={index}
                      />
                    ))
                  )}
                </div>
              </SystemDropdownSortableContext>
            </SystemDropdownDndContext>
          )}
        </DialogBody>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>

          <Button disabled={isLoadingUpdateItem} onClick={onSubmit}>
            Submit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SortSystemDropdownsDialog;
