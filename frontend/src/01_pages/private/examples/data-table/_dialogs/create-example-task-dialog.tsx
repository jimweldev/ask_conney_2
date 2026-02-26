import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { cn } from '@/lib/utils';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

// Form validation schema
const FormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  status: createReactSelectSchema(true),
});

// Props
type CreateExampleTaskDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateExampleTaskDialog = ({
  open,
  setOpen,
  refetch,
}: CreateExampleTaskDialogProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      status: undefined,
    },
  });

  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingCreateItem(true);

    const newData = {
      ...data,
      status: data.status?.value,
    };

    toast.promise(mainInstance.post(`/examples/tasks`, newData), {
      loading: 'Loading...',
      success: () => {
        form.reset();
        refetch();
        setOpen(false);
        return 'Success!';
      },
      error: error =>
        error.response?.data?.message || error.message || 'An error occurred',
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d))}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Create Example Task</DialogTitle>
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
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <ReactSelect
                          className={cn(
                            'react-select-container',
                            fieldState.invalid ? 'invalid' : '',
                          )}
                          classNamePrefix="react-select"
                          options={convertToSelectOptions([
                            'To Do',
                            'In Progress',
                            'Completed',
                          ])}
                          value={field.value}
                          onChange={field.onChange}
                        />
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
              <Button type="submit" disabled={isLoadingCreateItem}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateExampleTaskDialog;
