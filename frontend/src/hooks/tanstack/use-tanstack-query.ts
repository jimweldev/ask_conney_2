import { useMemo } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { mainInstance } from '@/07_instances/main-instance';

type Url = {
  endpoint: string;
  params?: string;
};

const useTanstackQuery = <T>(
  url: Url,
  options?: Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'>,
) => {
  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (url.params) {
      url.params.split('&').forEach(param => {
        const [key, value] = param.split('=');
        if (key && value) {
          params.append(key, value);
        }
      });
    }

    return `${url.endpoint}${params.toString() ? `?${params.toString()}` : ''}`;
  }, [url.endpoint, url.params]);

  const tanstackQuery = useQuery<T>({
    queryKey: [url.endpoint, url.params],
    queryFn: async ({ signal }) => {
      const res = await mainInstance.get(queryString, { signal });
      return res.data;
    },
    ...options,
  });

  return tanstackQuery;
};

export default useTanstackQuery;
