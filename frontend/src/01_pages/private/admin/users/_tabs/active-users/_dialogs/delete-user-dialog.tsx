import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '@/04_types/user/user';
import useUserStore from '@/05_stores/user/user-store';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { formatName } from '@/lib/user/format-name';

// Component Props
type DeleteUserDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const DeleteUserDialog = ({
  open,
  setOpen,
  refetch,
}: DeleteUserDialogProps) => {
  // Access store values
  const { selectedUser } = useUserStore();

  // Tanstack query hook for pagination
  const { refetch: refetchArchivedUsers } = useTanstackPaginateQuery<User>(
    {
      endpoint: '/users/archived',
      defaultSort: 'id',
    },
    {
      enabled: false,
    },
  );

  // Track loading state for submit button
  const [isLoadingDeleteItem, setIsLoadingDeleteItem] =
    useState<boolean>(false);

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default form submission behavior
    setIsLoadingDeleteItem(true); // Start loading state

    // Send DELETE request and show toast notifications
    toast.promise(mainInstance.delete(`/users/${selectedUser?.id}`), {
      loading: 'Loading...',
      success: () => {
        refetch();
        refetchArchivedUsers();
        setOpen(false);
        return 'Success!';
      },
      error: error => {
        // Display error message from response or fallback
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoadingDeleteItem(false); // Reset loading state
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <form onSubmit={onSubmit}>
          {/* Dialog body */}
          <DialogBody>
            {/* Warning icon */}
            <CircleAlert className="text-destructive mx-auto mb-4" size={64} />

            {/* Modal title */}
            <h3 className="text-center text-xl">Delete User</h3>
            <p className="text-muted-foreground mb-2 text-center">
              Are you sure you want to delete this record?
            </p>

            {/* Item */}
            <h2 className="text-center text-2xl font-semibold">
              {formatName(selectedUser)}
            </h2>
          </DialogBody>

          {/* Modal footer */}
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="submit"
              disabled={isLoadingDeleteItem}
            >
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteUserDialog;
