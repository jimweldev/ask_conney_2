import { Skeleton } from '../ui/skeleton';

type NotificationsSkeletonProps = {
  count?: number;
};

const NotificationsSkeleton = ({ count }: NotificationsSkeletonProps) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <div className="flex items-start gap-2 border-b p-2" key={index}>
          <Skeleton className="size-8 rounded-full" />

          <div className="min-w-0 flex-1">
            <Skeleton className="mb-2 h-4 w-2/5" />
            <Skeleton className="mb-1 h-3 w-full" />
            <Skeleton className="h-3 w-15" />
          </div>
        </div>
      ))}
    </>
  );
};

export default NotificationsSkeleton;
