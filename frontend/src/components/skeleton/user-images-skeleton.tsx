import { Skeleton } from '../ui/skeleton';

type UserImagesSkeletonProps = {
  inputCount?: number | string;
};

const UserImagesSkeleton = ({ inputCount = 1 }: UserImagesSkeletonProps) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
      {[...Array(Number(inputCount))].map((_, index) => (
        <div className="relative space-y-1 rounded-lg border-2 p-1" key={index}>
          <div className="flex justify-between">
            <Skeleton className="h-5 w-2/4" />
            <Skeleton className="size-5" />
          </div>
          <Skeleton className="aspect-square w-full rounded-md" />
        </div>
      ))}
    </div>
  );
};

export default UserImagesSkeleton;
