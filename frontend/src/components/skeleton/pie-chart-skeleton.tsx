import { Skeleton } from '../ui/skeleton';

const PieChartSkeleton = () => {
  return (
    <div className="mx-auto flex aspect-[4/3] max-h-[250px] items-center justify-center">
      <Skeleton className="flex aspect-square w-[60%] items-center justify-center rounded-full">
        <div className="bg-card flex aspect-square w-[60%] flex-col items-center justify-center gap-2 rounded-full">
          <Skeleton className="h-8 w-15" />
          <Skeleton className="h-4 w-20" />
        </div>
      </Skeleton>
    </div>
  );
};

export default PieChartSkeleton;
