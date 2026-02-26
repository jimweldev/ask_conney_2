import { Skeleton } from '../ui/skeleton';

type DataTableGridSkeleton = {
  count?: string | number;
};

const DataTableGridSkeleton = ({ count = 10 }: DataTableGridSkeleton) => {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
      {Array.from({ length: Number(count) }).map((_, index) => (
        <div className="p-layout rounded border" key={index}>
          <Skeleton className="mb-layout h-6 w-20" />

          <div className="flex justify-end">
            <Skeleton className="h-5 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default DataTableGridSkeleton;
