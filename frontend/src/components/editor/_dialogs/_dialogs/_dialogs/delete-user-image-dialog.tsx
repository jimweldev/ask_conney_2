import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import type { UserImage } from '@/04_types/user/user-image';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

type DeleteUserImageDialogProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedItem: UserImage | null;
  refetch: () => void;
};

const DeleteUserImageDialog = ({
  open,
  setOpen,
  selectedItem,
  refetch,
}: DeleteUserImageDialogProps) => {
  const [isLoadingDeleteItem, setIsLoadingDeleteItem] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsLoadingDeleteItem(true);

    toast.promise(mainInstance.delete(`/user-images/${selectedItem?.id}`), {
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
        setIsLoadingDeleteItem(false);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form
          onSubmit={e => {
            e.stopPropagation();
            onSubmit(e);
          }}
        >
          <DialogBody>
            <CircleAlert className="text-destructive mx-auto mb-4" size={64} />

            <h3 className="text-center text-xl">Delete Image</h3>

            <p className="text-muted-foreground mb-2 text-center">
              Are you sure you want to delete this record?
            </p>

            <h2 className="text-center text-2xl font-semibold">
              {selectedItem?.file_name}
            </h2>
          </DialogBody>
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

export default DeleteUserImageDialog;
