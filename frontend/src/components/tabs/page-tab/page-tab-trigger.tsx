import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';

type PageTabTriggerProps = {
  to: string;
  children: React.ReactNode;
};

const PageTabTrigger = ({ to, children, ...props }: PageTabTriggerProps) => {
  return (
    <NavLink
      to={to}
      {...props}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center justify-center gap-2',
          'rounded-md border border-transparent',
          '-m-0.5 px-3 py-1',
          isActive ? 'bg-card text-card-foreground border-border' : '',
        )
      }
    >
      {children}
    </NavLink>
  );
};

export default PageTabTrigger;
