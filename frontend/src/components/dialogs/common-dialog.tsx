import type { ReactNode } from 'react';
import { Info } from 'lucide-react';
import { FaRegCircleCheck } from 'react-icons/fa6';
import { MdErrorOutline } from 'react-icons/md';
import { PiWarningLight } from 'react-icons/pi';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

// Props
type CommonDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  variant?: 'info' | 'success' | 'warning' | 'destructive';
  title?: string;
  description?: string;
  item?: string;
  content?: ReactNode;
};

const CommonDialog = ({
  open,
  setOpen,
  variant,
  title,
  description,
  item,
  content,
}: CommonDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogBody>
          {/* Variant icon */}
          {variant === 'info' ? (
            <Info className="text-info mx-auto mb-4" size={64} />
          ) : null}
          {variant === 'warning' ? (
            <PiWarningLight className="text-warning mx-auto mb-4" size={64} />
          ) : null}
          {variant === 'destructive' ? (
            <MdErrorOutline
              className="text-destructive mx-auto mb-4"
              size={64}
            />
          ) : null}
          {variant === 'success' ? (
            <FaRegCircleCheck className="text-success mx-auto mb-4" size={64} />
          ) : null}

          {/* Modal title */}
          {title ? <h3 className="text-center text-xl">{title}</h3> : null}
          {description ? (
            <p className="text-muted-foreground mb-2 text-center">
              {description}
            </p>
          ) : null}
          {/* Display item name */}
          {item ? (
            <p className="text-muted-foreground text-center">{item}</p>
          ) : null}

          {/* Content */}
          {content ? <div className="mt-layout">{content}</div> : null}
        </DialogBody>

        <DialogFooter className="flex justify-end gap-2">
          <Button
            variant={variant}
            type="submit"
            onClick={() => setOpen(false)}
          >
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CommonDialog;
