import { useMemo, type ReactNode } from 'react';
import { ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TableHead } from '../ui/table';

type DataTableHeadProps = {
  sort: string;
  setSort: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  label: ReactNode | string;
  column: string;
  className?: string;
};

const DataTableHead = ({
  sort,
  setSort,
  setCurrentPage,
  label,
  column,
  className,
}: DataTableHeadProps) => {
  const isCurrentSort = useMemo(
    () => sort.replace('-', '') === column,
    [sort, column],
  );
  const isDescending = useMemo(() => sort.startsWith('-'), [sort]);

  const handleSetSort = () => {
    const newSort = isCurrentSort && !isDescending ? `-${column}` : column;
    setSort(newSort);
    setCurrentPage(1);
  };

  const chevronClassName = useMemo(() => {
    if (!isCurrentSort) return 'hidden';
    return isDescending ? 'rotate-180' : '';
  }, [isCurrentSort, isDescending]);

  return (
    <TableHead
      className={cn('cursor-pointer', className)}
      onClick={handleSetSort}
    >
      <div className="flex items-center justify-between gap-2">
        <span>{label}</span>
        <ChevronUp
          size={16}
          className={cn(
            'transform transition-transform duration-200',
            chevronClassName,
          )}
        />
      </div>
    </TableHead>
  );
};

export default DataTableHead;
