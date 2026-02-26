import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-black/50',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

const dialogVariants = cva('', {
  variants: {
    size: {
      default: 'max-w-md',
      sm: 'max-w-sm',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
      '2xl': 'max-w-2xl',
      '3xl': 'max-w-3xl',
      '4xl': 'max-w-4xl',
      '5xl': 'max-w-5xl',
      '6xl': 'max-w-6xl',
      '7xl': 'max-w-7xl',
    },
    position: {
      top: 'justify-start',
      center: 'justify-center',
    },
  },
});

function DialogContent({
  className,
  children,
  size = 'default',
  position = 'top',
  staticBackdrop = false,
  autoFocus = false,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> &
  VariantProps<typeof dialogVariants> & {
    staticBackdrop?: boolean;
    autoFocus?: boolean;
    showCloseButton?: boolean;
  }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay>
        <div
          className="fixed inset-0 z-50 overflow-y-auto"
          onPointerDown={e => {
            const target = e.target as HTMLElement;
            const isScrollbar =
              target.offsetWidth < target.scrollWidth ||
              target.offsetHeight < target.scrollHeight;
            if (isScrollbar) {
              e.stopPropagation();
            }
          }}
        >
          <div
            className={cn(
              'flex min-h-screen w-full flex-col items-center p-6',
              cn(dialogVariants({ position, className })),
            )}
          >
            <DialogPrimitive.Content
              data-slot="dialog-content"
              className={cn(
                '@container/main',
                'bg-card relative w-full rounded-lg border',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
                'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
                'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
                'data-[state=closed]:slide-out-to-top-[48%]',
                'data-[state=open]:slide-in-from-top-[48%]',
                cn(dialogVariants({ size, className })),
              )}
              onInteractOutside={e => {
                // if the html has "with-fancybox" class, e.preventDefault
                const htmlEl = document.documentElement;
                if (htmlEl.classList.contains('with-fancybox')) {
                  e.preventDefault();
                }

                if (staticBackdrop) {
                  e.preventDefault();
                }
              }}
              onEscapeKeyDown={e => {
                // if the html has "with-fancybox" class, e.preventDefault
                const htmlEl = document.documentElement;
                if (htmlEl.classList.contains('with-fancybox')) {
                  e.preventDefault();
                }
              }}
              {...props}
            >
              {children}
              <DialogTitle />
              <DialogDescription />
              {/* show close button */}
              {showCloseButton && (
                <DialogPrimitive.Close
                  data-slot="dialog-close"
                  className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-3 right-3 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                  autoFocus={!autoFocus}
                  tabIndex={0}
                >
                  <XIcon />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </DialogPrimitive.Content>
          </div>
        </div>
      </DialogOverlay>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('p-layout border-b', className)}
      {...props}
    />
  );
}

function DialogBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('p-layout', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('p-layout border-t', className)}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-base leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground mt-0.5 text-xs', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogBody,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
