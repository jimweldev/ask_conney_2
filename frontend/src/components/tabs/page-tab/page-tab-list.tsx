import { cn } from '@/lib/utils';

type PageTabListProps = {
  children: React.ReactNode;
};

const PageTabList = ({ children }: PageTabListProps) => {
  return (
    <div
      className={cn(
        'bg-muted text-muted-foreground w-fit rounded-md p-1',
        'text-xs',
        'font-medium',
      )}
    >
      {children}
    </div>
  );
};

export default PageTabList;
