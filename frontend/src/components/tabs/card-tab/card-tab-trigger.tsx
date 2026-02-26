import { NavLink } from 'react-router';
import { cn } from '@/lib/utils';

type CardTabTriggerProps = {
  to: string;
  children: React.ReactNode;
};

const CardTabTrigger = ({ to, children, ...props }: CardTabTriggerProps) => {
  return (
    <NavLink
      to={to}
      {...props}
      className={({ isActive }) =>
        cn(
          'inline-flex items-center justify-center gap-2',
          'mb-[-1px] rounded-t-md border border-b-0 border-transparent',
          'px-3 py-1',
          isActive ? 'bg-card text-card-foreground border-border' : '',
        )
      }
    >
      {children}
    </NavLink>
  );
};

export default CardTabTrigger;
