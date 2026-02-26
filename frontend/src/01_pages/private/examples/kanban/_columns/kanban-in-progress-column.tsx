import { useEffect, useRef, useState } from 'react';
import { FaArrowsRotate } from 'react-icons/fa6';
import { TbReportSearch } from 'react-icons/tb';
import InfiniteScroll from 'react-infinite-scroll-component';
import { type ExampleTask } from '@/04_types/example/example-task';
import ComponentMultipier from '@/components/other/component-multiplier';
import Tooltip from '@/components/tooltip/tooltip';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useTanstackInfiniteQuery from '@/hooks/tanstack/use-tanstack-infinite-query';
import { cn } from '@/lib/utils';

type KanbanColumnProps = {
  searchTerm: string;
};

const KanbanToDoColumn = ({ searchTerm }: KanbanColumnProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isLoading,
    isFetchingNextPage,
    handlePullToRefresh,
  } = useTanstackInfiniteQuery<ExampleTask>({
    endpoint: 'examples/tasks',
    params: `sort=-id&limit=10&status=In Progress&search=${searchTerm}`,
  });

  const [tasks, setTasks] = useState<ExampleTask[]>([]);

  useEffect(() => {
    setTasks(data?.pages.flatMap(page => page.records) ?? []);
  }, [data]);

  // Ensure we fetch next page if we have more data and initial load is complete
  useEffect(() => {
    if (hasNextPage && !initialLoadComplete && tasks.length > 0) {
      fetchNextPage();
      setInitialLoadComplete(true);
    }
  }, [hasNextPage, initialLoadComplete, tasks.length, fetchNextPage]);

  // Alternative: Fetch if container is not scrollable
  useEffect(() => {
    const checkScroll = () => {
      const container = containerRef.current;
      if (container && hasNextPage) {
        const hasScrollbar = container.scrollHeight > container.clientHeight;
        if (!hasScrollbar && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    // Check after a short delay to allow DOM to render
    const timer = setTimeout(checkScroll, 100);
    return () => clearTimeout(timer);
  }, [tasks, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <div
      className="relative flex-1 overflow-y-scroll rounded-lg border-2"
      id="container-in-progress"
      ref={containerRef}
    >
      <div className="bg-card sticky top-0 z-10 flex items-center justify-between border-b-2 p-2">
        <div className="flex gap-2">
          <h5 className="text-xs font-semibold">In Progress</h5>{' '}
          <span className="text-xs">
            ({data?.pages[0]?.meta?.total_records ?? tasks.length})
          </span>
        </div>

        <Tooltip content="Refresh">
          <Button
            variant="outline"
            size="icon-xs"
            onClick={() => handlePullToRefresh()}
            disabled={isLoading}
          >
            <FaArrowsRotate className={isLoading ? 'animate-spin' : ''} />
          </Button>
        </Tooltip>
      </div>
      <InfiniteScroll
        scrollableTarget="container-in-progress"
        dataLength={tasks.length}
        next={fetchNextPage}
        hasMore={!!hasNextPage}
        loader={null}
        endMessage={
          <p
            className={cn(
              'text-muted-foreground p-2 pt-0 text-center text-xs',
              (isLoading || tasks.length === 0) && 'hidden',
            )}
          >
            No more tasks
          </p>
        }
      >
        <div className="space-y-2 p-2">
          {tasks.map(req => (
            <div className="rounded-lg border p-2" key={req.id}>
              <h1 className="font-semibold">{req.name}</h1>
              <p className="text-muted-foreground text-xs">{req.status}</p>
            </div>
          ))}
          {isLoading || isFetchingNextPage ? (
            <ComponentMultipier
              component={<Skeleton className="h-14 w-full" />}
              count={10}
            />
          ) : null}

          {!isLoading && tasks.length === 0 && (
            <div className="text-muted-foreground p-layout flex flex-col items-center">
              <div className="p-layout">
                <TbReportSearch className="size-12" />
              </div>
              <h4 className="text-center text-sm">No records found</h4>
            </div>
          )}
        </div>
      </InfiniteScroll>
    </div>
  );
};

export default KanbanToDoColumn;
