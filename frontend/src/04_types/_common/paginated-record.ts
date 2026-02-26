// Generic API response type for paginated endpoints
export type PaginatedRecord<T> = {
  records: T[];
  meta: Meta;
};

type Meta = {
  total_records: number;
  total_pages: number;
};
