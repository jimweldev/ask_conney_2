'use client';

import { createContext, useContext } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// === Context Setup ===
type TabsVariantContextType = {
  variant?: 'default' | 'outline' | 'pills' | 'underline' | null;
  size?: 'default' | 'sm' | 'lg' | null;
};

const TabsVariantContext = createContext<TabsVariantContextType>({});
const useTabsVariant = () => useContext(TabsVariantContext);

// === Tabs Root ===
function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn('flex flex-col', className)}
      {...props}
    />
  );
}

// === Tabs List ===
const tabsListVariants = cva('font-medium', {
  variants: {
    variant: {
      default: 'w-fit bg-muted text-muted-foreground rounded-md p-1',
      outline: 'border-b p-layout pb-0',
      pills: 'w-fit',
      underline: 'border-b-2 p-layout pb-0',
    },
    size: {
      default: 'text-sm',
      sm: 'text-xs',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

function TabsList({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants>) {
  return (
    <TabsVariantContext.Provider value={{ variant, size }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        className={cn(tabsListVariants({ variant, size, className }))}
        {...props}
      />
    </TabsVariantContext.Provider>
  );
}

// === Tabs Trigger ===
const tabsTriggerVariants = cva(
  'inline-flex gap-2 items-center justify-center',
  {
    variants: {
      variant: {
        default:
          'border border-transparent data-[state=active]:bg-card data-[state=active]:text-card-foreground data-[state=active]:border-border rounded-md',
        outline:
          'data-[state=active]:bg-card data-[state=active]:text-card-foreground border border-transparent data-[state=active]:border-border border-b-0 rounded-t-md mb-[-1px]',
        pills:
          'data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground rounded-full',
        underline:
          'data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:text-primary mb-[-2px]',
      },
      size: {
        default: 'px-3 py-1',
        sm: 'px-3 py-1 -m-0.5',
        lg: 'px-5 py-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger> &
  VariantProps<typeof tabsTriggerVariants>) {
  const { variant, size } = useTabsVariant();

  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant, size, className }))}
      {...props}
    />
  );
}

// === Tabs Content ===
function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn(
        'flex-1 outline-none',
        'data-[state=inactive]:hidden',
        className,
      )}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
