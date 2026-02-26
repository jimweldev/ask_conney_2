import { Skeleton } from '../ui/skeleton';

type NotificationSkeletonProps = {
  inputCount?: number;
};

const NotificationSkeleton = ({
  inputCount = 1,
}: NotificationSkeletonProps) => {
  return (
    <>
      {[...Array(inputCount)].map((_, index) => (
        <div className="flex items-center gap-2 p-2" key={index}>
          <div className="flex size-8 items-center justify-center overflow-hidden rounded-full border-2">
            <Skeleton className="size-full" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-full" />
          </div>
        </div>
      ))}
    </>
  );
};

export default NotificationSkeleton;
