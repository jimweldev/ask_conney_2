import { FaRegCircleQuestion } from 'react-icons/fa6';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

// Props
type InfoDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
};

const InfoDialog = ({ open, setOpen }: InfoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogBody>
          {/* Warning icon */}
          <FaRegCircleQuestion className="text-info mx-auto mb-4" size={64} />

          {/* Modal title */}
          <h3 className="text-center text-xl">Delete Example Task</h3>
          <p className="text-muted-foreground mb-2 text-center">
            Are you sure you want to delete this record?
          </p>

          {/* Display item name */}
          <h2 className="text-center text-2xl font-semibold">Name</h2>
        </DialogBody>

        <DialogFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button variant="info" type="submit">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;
