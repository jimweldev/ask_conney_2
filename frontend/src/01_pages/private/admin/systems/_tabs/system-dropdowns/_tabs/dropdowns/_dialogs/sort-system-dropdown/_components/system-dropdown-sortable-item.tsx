import type { CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type SystemDropdownSortableItemProps = {
  label: string;
  index: number;
};

const SystemDropdownSortableItem = ({
  label,
  index,
}: SystemDropdownSortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: label });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.3 : 1,
    userSelect: 'none',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-card flex items-center justify-between rounded-lg border p-2 text-sm shadow-sm"
    >
      <span>{label}</span>

      <div className="flex items-center gap-2">
        {/* Show the dynamic sort number starting from 1 */}
        <Badge className="text-xs" variant="outline">
          {index + 1}
        </Badge>

        <button
          {...listeners}
          {...attributes}
          className="text-muted-foreground cursor-grab"
          style={{ touchAction: 'none' }}
        >
          <GripVertical size={18} />
        </button>
      </div>
    </div>
  );
};

export default SystemDropdownSortableItem;
