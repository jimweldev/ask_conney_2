import { useMemo, useState } from 'react';
import {
  keepPreviousData,
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query';
import { type PaginatedRecord } from '@/04_types/_common/paginated-record';
import { mainInstance } from '@/07_instances/main-instance';

export type FilterCondition = {
  field: string;
  operator: string;
  value: string;
};

export type FilterGroup = FilterCondition[];
export type FilterOutput = FilterGroup[];

export type useTanstackPostPaginateQueryReturn<T> = Omit<
  UseQueryResult<PaginatedRecord<T>>,
  'refetch'
> & {
  refetch: () => void;
  limit: string;
  page: number;
  sort: string;
  searchTerm: string;
  setLimit: (val: string) => void;
  setPage: (val: number) => void;
  setSort: (val: string) => void;
  setSearchTerm: (val: string) => void;
};

type Url = {
  endpoint: string;
  params?: string;
  groupFilters?: FilterOutput;
  defaultSort?: string;
  defaultLimit?: string;
};

const useTanstackPostPaginateQuery = <T>(
  url: Url,
  options?: Omit<UseQueryOptions<PaginatedRecord<T>>, 'queryKey' | 'queryFn'>,
) => {
  const queryClient = useQueryClient();

  // Always define local state
  const [limit, setLimit] = useState(url.defaultLimit || '10');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(url.defaultSort || '');
  const [searchTerm, setSearchTerm] = useState('');

  const queryString = useMemo(() => {
    const params = new URLSearchParams({
      limit,
      page: page.toString(),
      sort,
      search: searchTerm,
    });

    if (url.params) {
      url.params.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params.append(key, value);
        }
      });
    }

    return `${url.endpoint}?${params.toString()}`;
  }, [url.endpoint, url.params, limit, page, sort, searchTerm]);

  // Add groupFilters to queryKey for proper caching when filters change
  const queryKey = useMemo(
    () => [
      url.endpoint,
      limit,
      page,
      sort,
      searchTerm,
      url.params,
      url.groupFilters,
    ],
    [url.endpoint, limit, page, sort, searchTerm, url.params, url.groupFilters],
  );

  const tanstackQuery = useQuery<PaginatedRecord<T>>({
    queryKey,
    queryFn: async ({ signal }) => {
      const res = await mainInstance.post(
        queryString,
        { group_filters: url.groupFilters || [] },
        {
          signal,
        },
      );
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled:
      options?.enabled === undefined
        ? !queryClient.getQueryData(queryKey)
        : options?.enabled && !queryClient.getQueryData(queryKey),
    ...options,
  });

  const refetch = () => {
    tanstackQuery.refetch();
    queryClient.invalidateQueries({ queryKey: [url.endpoint] });
    queryClient.removeQueries({ queryKey: [url.endpoint] });
  };

  return {
    ...tanstackQuery,
    limit,
    page,
    sort,
    searchTerm,
    refetch,
    setLimit,
    setPage,
    setSort,
    setSearchTerm,
  };
};

export default useTanstackPostPaginateQuery;
