import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import useMailTemplateStore from '@/05_stores/mail/mail-template-store';
import { mainInstance } from '@/07_instances/main-instance';
import IframePreview from '@/components/iframe/iframe-preview';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Zod schema to validate the form input
const FormSchema = z.object({
  label: z.string().min(1, {
    message: 'Required',
  }),
  content: z.string().min(1, {
    message: 'Required',
  }),
});

// Component Props
type UpdateMailTemplateProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const UpdateMailTemplate = ({
  open,
  setOpen,
  refetch,
}: UpdateMailTemplateProps) => {
  // Access store values
  const { selectedMailTemplate } = useMailTemplateStore();

  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      content: '',
    },
  });

  // Populate form with selected items's data
  useEffect(() => {
    if (selectedMailTemplate) {
      form.reset({
        label: selectedMailTemplate.label || '',
        content: selectedMailTemplate.content || '',
      });
    }
  }, [selectedMailTemplate, form]);

  // Track loading state for submit button
  const [isLoadingUpdateItem, setIsLoadingUpdateItem] =
    useState<boolean>(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdateItem(true);

    // Send PATCH request and show toast notifications
    toast.promise(
      mainInstance.patch(`/mails/templates/${selectedMailTemplate?.id}`, data),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error => {
          // Display error message from response or fallback
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsLoadingUpdateItem(false); // Reset loading state
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="5xl">
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Update Mail Template</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="gap-layout grid grid-cols-2 items-start">
                <div className="grid grid-cols-12 gap-3">
                  {/* Label field */}
                  <FormField
                    control={form.control}
                    name="label"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Label</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={`
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Welcome Template</title>
  </head>
  <body>

  </body>
</html>
                              `.trim()}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="sticky top-[calc(var(--spacing)*var(--space))] bottom-3 max-h-[calc(100vh-var(--spacing)*(var(--space)*2))] overflow-auto rounded-lg border">
                  <IframePreview htmlContent={form.watch('content')} />
                </div>
              </div>
            </DialogBody>

            {/* Dialog footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoadingUpdateItem}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateMailTemplate;
