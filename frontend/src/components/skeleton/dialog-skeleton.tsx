import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

interface DialogSkeletonProps {
  title?: string;
  description?: string;
  inputCount?: number;
}

const DialogSkeleton = ({
  title = '',
  description = '',
  inputCount = 1,
}: DialogSkeletonProps) => {
  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-12 gap-3">
          {[...Array(inputCount)].map((_, index) => (
            <div className="col-span-12 space-y-1" key={index}>
              <div className="space-y-1">
                <Skeleton className="h-3.5 w-[20%]" />
                <Skeleton className="h-9 w-[100%]" />
              </div>
            </div>
          ))}
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-end gap-2">
        <Skeleton className="h-9 w-17" />
        <Skeleton className="h-9 w-16" />
      </DialogFooter>
    </>
  );
};

export default DialogSkeleton;
