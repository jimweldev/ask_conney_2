import { cn } from '@/lib/utils';

type InputGroupTextProps = {
  className?: string;
  children: React.ReactNode;
};

const InputGroupText = ({ className, children }: InputGroupTextProps) => {
  return (
    <span
      className={cn(
        'bg-card text-card-foreground flex items-center border px-3 text-xs text-nowrap',
        className,
      )}
    >
      {children}
    </span>
  );
};

export default InputGroupText;
