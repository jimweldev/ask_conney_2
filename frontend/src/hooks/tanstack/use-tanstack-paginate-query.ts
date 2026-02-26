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

export type useTanstackPaginateQueryReturn<T> = Omit<
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
  defaultSort?: string;
  defaultLimit?: string;
};

const useTanstackPaginateQuery = <T>(
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

  const tanstackQuery = useQuery<PaginatedRecord<T>>({
    queryKey: [url.endpoint, limit, page, sort, searchTerm, url.params],
    queryFn: async ({ signal }) => {
      const res = await mainInstance.get(queryString, { signal });
      return res.data;
    },
    placeholderData: keepPreviousData,
    staleTime: Infinity,
    gcTime: Infinity,
    enabled:
      options?.enabled === undefined
        ? !queryClient.getQueryData([
            url.endpoint,
            limit,
            page,
            sort,
            searchTerm,
            url.params,
          ])
        : options?.enabled &&
          !queryClient.getQueryData([
            url.endpoint,
            limit,
            page,
            sort,
            searchTerm,
            url.params,
          ]),
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

export default useTanstackPaginateQuery;
