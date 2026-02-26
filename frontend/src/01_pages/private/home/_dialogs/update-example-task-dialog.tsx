import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import useExampleTaskStore from '@/05_stores/example/example-task-store';
import { mainInstance } from '@/07_instances/main-instance';
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

// Form validation schema
const FormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  status: z.string().min(1, { message: 'Required' }),
});

// Props
type UpdateExampleTaskDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void; // Function to refetch the table data after update
};

const UpdateExampleTaskDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateExampleTaskDialogProps) => {
  // Zustand store
  const { selectedExampleTask } = useExampleTaskStore();

  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      status: '',
    },
  });

  // Populate form with selected item's data
  useEffect(() => {
    if (selectedExampleTask) {
      form.reset({
        name: selectedExampleTask.name || '',
        status: selectedExampleTask.status || '',
      });
    }
  }, [selectedExampleTask, form]);

  // Loading state for submit button
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdate(true);

    toast.promise(
      mainInstance.patch(`/examples/tasks/${selectedExampleTask?.id}`, data),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error =>
          error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingUpdate(false), // Reset loading state
      },
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
              <DialogHeader>
                <DialogTitle>Update Example Task</DialogTitle>
              </DialogHeader>

              <DialogBody>
                <div className="grid grid-cols-12 gap-3">
                  {/* Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* Status Field */}
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </DialogBody>

              <DialogFooter className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoadingUpdate}>
                  Submit
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UpdateExampleTaskDialog;
