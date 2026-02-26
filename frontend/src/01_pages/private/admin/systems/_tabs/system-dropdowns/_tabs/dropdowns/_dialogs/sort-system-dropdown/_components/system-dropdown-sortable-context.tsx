import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { SystemDropdown } from '@/04_types/system/system-dropdown';

type SystemDropdownSortableContextProps = {
  children: React.ReactNode;
  items: SystemDropdown[];
};

const SystemDropdownSortableContext = ({
  children,
  items,
}: SystemDropdownSortableContextProps) => {
  return (
    <SortableContext
      items={items.map(i => i.label!).filter(Boolean)}
      strategy={verticalListSortingStrategy}
    >
      {children}
    </SortableContext>
  );
};

export default SystemDropdownSortableContext;
