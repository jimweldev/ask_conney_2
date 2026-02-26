import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import useSystemDropdownModuleStore from '@/05_stores/system/system-dropdown-module-store';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

// Props
type DeleteSystemDropdownModuleDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void; // Function to refetch the table data after deletion
};

const DeleteSystemDropdownModuleDialog = ({
  open,
  setOpen,
  refetch,
}: DeleteSystemDropdownModuleDialogProps) => {
  // Zustand store
  const { selectedSystemDropdownModule } = useSystemDropdownModuleStore();

  // Loading state for delete button
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingDelete(true);

    toast.promise(
      mainInstance.delete(
        `/system/system-dropdowns/modules/${selectedSystemDropdownModule?.id}`,
      ),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error =>
          error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingDelete(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogBody>
            {/* Warning icon */}
            <CircleAlert className="text-destructive mx-auto mb-4" size={64} />

            {/* Modal title */}
            <h3 className="text-center text-xl">
              Delete System Dropdown Module
            </h3>
            <p className="text-muted-foreground mb-2 text-center">
              Are you sure you want to delete this record?
            </p>

            {/* Display item name */}
            <h2 className="text-center text-2xl font-semibold">
              {selectedSystemDropdownModule?.label}
            </h2>
          </DialogBody>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              type="submit"
              disabled={isLoadingDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteSystemDropdownModuleDialog;
