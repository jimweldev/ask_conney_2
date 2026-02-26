export type Pagination = {
  limit: string;
  page: number;
  sort: string;
  searchTerm: string;
  setLimit: (val: string) => void;
  setPage: (val: number) => void;
  setSort: (val: string) => void;
  setSearchTerm: (val: string) => void;
};
