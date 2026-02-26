import { useMemo } from 'react';
import {
  useInfiniteQuery,
  useQueryClient,
  type InfiniteData,
  type UseInfiniteQueryOptions,
} from '@tanstack/react-query';
import { mainInstance } from '@/07_instances/main-instance';

type Url = {
  endpoint: string;
  params?: string;
};

type InfinitePage<T> = {
  records: T[];
  nextPage: number;
  hasMore: boolean;
  meta: {
    total_records: number;
    total_pages: number;
  };
};

const useTanstackInfiniteQuery = <T>(
  url: Url,
  options?: Omit<
    UseInfiniteQueryOptions<
      InfinitePage<T>, // TQueryFnData (data from each queryFn call)
      Error, // TError
      InfiniteData<InfinitePage<T>, number>, // TData (what useInfiniteQuery returns in data)
      [string, string?], // TQueryKey type
      number // TPageParam
    >,
    'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam'
  >,
) => {
  const queryClient = useQueryClient();

  const queryStringBase = useMemo(() => {
    const params = new URLSearchParams();

    if (url.params) {
      url.params.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params.append(key, value);
        }
      });
    }

    return `${url.endpoint}?${params.toString()}`;
  }, [url.endpoint, url.params]);

  const tanstackQuery = useInfiniteQuery<
    InfinitePage<T>, // TQueryFnData
    Error, // TError
    InfiniteData<InfinitePage<T>, number>, // TData
    [string, string?], // TQueryKey
    number // TPageParam
  >({
    queryKey: [url.endpoint, url.params],
    queryFn: async ({ pageParam = 1, signal }) => {
      const res = await mainInstance.get(
        queryStringBase + `&page=${pageParam}`,
        { signal },
      );

      return {
        records: res.data.records,
        nextPage: pageParam + 1,
        hasMore: pageParam < res.data.meta.total_pages,
        meta: res.data.meta,
      };
    },
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage.hasMore ? lastPage.nextPage : undefined,
    ...options,
    staleTime: 0,
    gcTime: 0,
  });

  const handlePullToRefresh = async () => {
    queryClient.removeQueries({ queryKey: [url.endpoint, url.params] });

    await tanstackQuery.refetch();
  };

  return { ...tanstackQuery, handlePullToRefresh };
};

export default useTanstackInfiniteQuery;
