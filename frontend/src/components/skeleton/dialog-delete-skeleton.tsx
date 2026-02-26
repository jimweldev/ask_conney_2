import {
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';

const DialogDeleteSkeleton = () => {
  return (
    <>
      <DialogTitle />
      <DialogDescription />
      <DialogBody>
        <div>
          <Skeleton className="mx-auto mb-4 h-16 w-16 rounded-full" />

          <Skeleton className="mx-auto mb-1 h-7 w-24 rounded" />
          <Skeleton className="mx-auto mb-2 h-5 w-[70%] rounded" />

          <Skeleton className="mx-auto h-8 w-[40%] rounded" />
        </div>
      </DialogBody>
      <DialogFooter className="flex justify-end gap-2">
        <Skeleton className="h-9 w-17" />
        <Skeleton className="h-9 w-18" />
      </DialogFooter>
    </>
  );
};

export default DialogDeleteSkeleton;
