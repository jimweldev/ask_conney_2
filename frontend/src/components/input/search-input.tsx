import { FaMagnifyingGlass } from 'react-icons/fa6';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';

const SearchInput = ({ ...props }) => {
  return (
    <div className="relative self-center">
      <FaMagnifyingGlass
        className={cn(
          'text-muted-foreground absolute top-1/2 -translate-y-1/2',
          props.inputSize === 'sm' && 'left-3 text-xs',
          props.inputSize === 'lg' && 'left-2.5',
          (props.inputSize === 'default' || props.inputSize === undefined) &&
            'left-2.5 text-sm',
        )}
      />
      <Input className="pl-8" {...props} type="search" />
    </div>
  );
};

export default SearchInput;
