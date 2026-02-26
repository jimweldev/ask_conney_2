import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragCancelEvent,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';
import type { SystemDropdown } from '@/04_types/system/system-dropdown';

type SystemDropdownDndContextProps = {
  children: React.ReactNode;
  items: SystemDropdown[];
  onItemsChange: (items: SystemDropdown[]) => void;
  renderDragOverlay?: (activeId: string) => React.ReactNode;
};

const SystemDropdownDndContext = ({
  children,
  items,
  onItemsChange,
  renderDragOverlay,
}: SystemDropdownDndContextProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    document.body.classList.add('dragging');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      document.body.classList.remove('dragging');
      setActiveId(null);
      return;
    }

    const activeKey = active.id as string;
    const overKey = over.id as string;

    if (activeKey !== overKey) {
      // Find indices based on label
      const oldIndex = items.findIndex(item => item.label === activeKey);
      const newIndex = items.findIndex(item => item.label === overKey);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Use arrayMove to properly reorder items
        const newItems = arrayMove(items, oldIndex, newIndex);
        onItemsChange(newItems);
      }
    }

    document.body.classList.remove('dragging');
    setActiveId(null);
  };

  const handleDragCancel = (_event: DragCancelEvent) => {
    document.body.classList.remove('dragging');
    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}

      {createPortal(
        <DragOverlay>
          {activeId && renderDragOverlay ? (
            renderDragOverlay(activeId)
          ) : activeId ? (
            <div
              className="bg-card rounded-lg border p-2 text-sm opacity-90 shadow-lg"
              style={{ cursor: 'grabbing' }}
            >
              {activeId}
            </div>
          ) : null}
        </DragOverlay>,
        document.body,
      )}
    </DndContext>
  );
};

export default SystemDropdownDndContext;
