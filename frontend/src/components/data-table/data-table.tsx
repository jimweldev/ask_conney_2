import { useEffect, useState, type ReactNode } from 'react';
import { isAxiosError } from 'axios';
import { FaArrowsRotate, FaListUl, FaTableCellsLarge } from 'react-icons/fa6';
import { TbReportSearch } from 'react-icons/tb';
import ReactPaginate from 'react-paginate';
import { type useTanstackPaginateQueryReturn } from '@/hooks/tanstack/use-tanstack-paginate-query';
import { cn } from '@/lib/utils';
import InputGroup from '../input-group/input-group';
import SearchInput from '../input/search-input';
import DataTableGridSkeleton from '../skeleton/data-table-grid-skeleton';
import DataTableListSkeleton from '../skeleton/data-table-list-skeleton';
import Tooltip from '../tooltip/tooltip';
import { Button } from '../ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import DataTableHead from './data-table-head';

export type DataTableColumn = {
  label: string | ReactNode;
  column?: string;
  className?: string;
};

type DataTableProps<T> = {
  pagination: useTanstackPaginateQueryReturn<T>;
  columns?: DataTableColumn[];
  actions?: ReactNode;
  showViewToggle?: boolean;
  showHeader?: boolean;
  limits?: string[];
  defaultView?: 'list' | 'grid';
  list?: ReactNode;
  grid?: ReactNode;
  listSkeleton?: ReactNode;
  gridSkeleton?: ReactNode;
  children?: ReactNode;
};

const DataTable = <T,>({
  pagination,
  columns,
  actions,
  showViewToggle,
  showHeader = true,
  limits = ['10', '25', '50', '100'],
  defaultView = 'list',
  list,
  grid,
  listSkeleton = <DataTableListSkeleton />,
  gridSkeleton = <DataTableGridSkeleton count={Number(pagination.limit)} />,
  children,
}: DataTableProps<T>) => {
  const [view, setView] = useState<'list' | 'grid'>(defaultView);

  const [search, setSearch] = useState(pagination.searchTerm);

  useEffect(() => {
    if (search === pagination.searchTerm) return;

    pagination.setSearchTerm(search);
    pagination.setPage(1);
  }, [search, pagination]);

  const handlePageChange = ({ selected }: { selected: number }) => {
    pagination.setPage(selected + 1);
  };

  return (
    <div>
      <div className="mb-layout flex flex-col items-start justify-between gap-2 @sm/main:flex-row">
        <div className="flex flex-1 flex-wrap gap-2">{actions}</div>

        <div className="flex flex-wrap justify-center gap-2">
          <div className="flex min-w-full flex-1 gap-2 @sm/main:min-w-auto">
            <SearchInput
              inputSize="sm"
              placeholder="Search..."
              defaultValue={search}
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  setSearch(e.currentTarget.value);
                }
              }}
            />
            <Select
              value={pagination.limit}
              onValueChange={value => {
                pagination.setLimit(value);
                pagination.setPage(1);
              }}
            >
              <SelectTrigger
                size="sm"
                className="@lg/main:w-[75px] @lg/main:min-w-[75px]"
              >
                <SelectValue placeholder="Select entry" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {limits.map((limit: string) => (
                    <SelectItem key={limit} value={limit}>
                      {limit}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Tooltip content="Refresh">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => pagination.refetch()}
                disabled={pagination.isFetching}
              >
                <FaArrowsRotate
                  className={pagination.isFetching ? 'animate-spin' : ''}
                />
              </Button>
            </Tooltip>
          </div>

          {showViewToggle ? (
            <InputGroup>
              <Tooltip content="List">
                <Button
                  size="icon-sm"
                  variant={view === 'list' ? 'default' : 'outline'}
                  onClick={() => setView('list')}
                >
                  <FaListUl />
                </Button>
              </Tooltip>
              <Tooltip content="Grid">
                <Button
                  size="icon-sm"
                  variant={view === 'grid' ? 'default' : 'outline'}
                  onClick={() => setView('grid')}
                >
                  <FaTableCellsLarge />
                </Button>
              </Tooltip>
            </InputGroup>
          ) : null}
        </div>
      </div>

      <div className="relative">
        {/* List */}
        {view === 'list' ? (
          <Table
            className={cn(
              'border-t',
              pagination.isFetching ? 'border-primary' : '',
            )}
          >
            {showHeader && columns ? (
              <TableHeader>
                <TableRow>
                  {columns?.map((column, index) =>
                    column.column ? (
                      <DataTableHead
                        key={index}
                        sort={pagination.sort}
                        setSort={pagination.setSort}
                        setCurrentPage={pagination.setPage}
                        label={column.label}
                        column={column.column}
                        className={column.className}
                      />
                    ) : (
                      <TableHead key={index} className={column.className}>
                        {column.label}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
            ) : null}
            <TableBody className="border-b">
              {/* List or Children */}
              {!pagination.isFetching ? list || children : null}

              {/* Loading */}
              {pagination.isFetching
                ? [...Array(Number(pagination.limit))].map((_, index) => (
                    <TableRow className="pointer-events-none" key={index}>
                      <TableCell colSpan={columns?.length}>
                        {listSkeleton}
                      </TableCell>
                    </TableRow>
                  ))
                : null}

              {/* No data found */}
              {!pagination.isFetching &&
              !pagination.error &&
              pagination.data?.records?.length === 0 ? (
                <TableRow>
                  <TableCell className="text-center" colSpan={columns?.length}>
                    No records found
                  </TableCell>
                </TableRow>
              ) : null}

              {/* Error */}
              {pagination.error ? (
                <TableRow className="">
                  <TableCell
                    className="text-center whitespace-pre-wrap"
                    colSpan={columns?.length}
                  >
                    <div className="flex flex-col">
                      <p className="font-semibold">
                        {isAxiosError(pagination.error) &&
                        pagination.error.response?.data?.message
                          ? pagination.error.response.data.message
                          : 'An error occurred'}
                      </p>
                      <p>
                        {isAxiosError(pagination.error) &&
                        pagination.error.response?.data?.error
                          ? pagination.error.response.data.error
                          : 'Unknown error occurred'}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        ) : null}

        {/* Grid */}
        {view === 'grid' ? (
          <div
            className={`pt-layout border-t ${pagination.isFetching ? 'border-primary' : ''} `}
          >
            {/* Grid or Children */}
            {!pagination.isFetching ? grid || children : null}

            {/* Loading */}
            {pagination.isFetching ? gridSkeleton : null}

            {/* No data found */}
            {!pagination.isFetching &&
            !pagination.error &&
            pagination.data?.records?.length === 0 ? (
              <div className="text-muted-foreground p-layout flex flex-col items-center">
                <div className="p-layout">
                  <TbReportSearch className="size-12" />
                </div>
                <h4 className="text-center text-sm">No records found</h4>
              </div>
            ) : null}

            {/* Error */}
            {pagination.error ? (
              <div className="p-layout flex flex-col items-center gap-3">
                <p className="font-semibold">
                  {isAxiosError(pagination.error) &&
                  pagination.error.response?.data?.message
                    ? pagination.error.response.data.message
                    : 'An error occurred'}
                </p>
                <p>
                  {isAxiosError(pagination.error) &&
                  pagination.error.response?.data?.error
                    ? pagination.error.response.data.error
                    : 'Unknown error occurred'}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="mt-layout flew-wrap flex items-center justify-between gap-4">
        <span className="text-muted-foreground text-xs">
          {`Showing ${
            (pagination.data?.records?.length || 0) > 0
              ? (pagination.page - 1) * Number(pagination.limit) + 1
              : 0
          } to ${
            (pagination.page - 1) * Number(pagination.limit) +
            (pagination.data?.records?.length || 0)
          } of ${pagination.data?.meta?.total_records || 0} entries`}
        </span>

        <ReactPaginate
          containerClassName="pagination pagination-sm"
          pageCount={pagination.data?.meta?.total_pages || 1}
          marginPagesDisplayed={1}
          pageRangeDisplayed={3}
          onPageChange={handlePageChange}
          forcePage={pagination.page - 1}
          previousLabel={<>&laquo;</>}
          nextLabel={<>&raquo;</>}
          breakLabel="..."
          activeClassName="active"
        />
      </div>
    </div>
  );
};

export default DataTable;
