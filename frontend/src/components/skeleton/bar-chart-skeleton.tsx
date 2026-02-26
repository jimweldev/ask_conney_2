import { Skeleton } from '../ui/skeleton';

const barHeights = [
  '50%',
  '55%',
  '60%',
  '65%',
  '75%',
  '75%',
  '75%',
  '80%',
  '80%',
  '80%',
  '85%',
  '85%',
];

const BarChartSkeleton = () => {
  return (
    <div className="grid h-[250px] grid-cols-12 gap-5 px-4 py-2">
      {barHeights.map((height, index) => (
        <div key={index} className="col-span-1 flex flex-col justify-end gap-3">
          <div className="flex flex-1 items-end">
            <Skeleton className="w-full" style={{ height }} />
          </div>
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
};

export default BarChartSkeleton;
