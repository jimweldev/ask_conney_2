import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ReactSelectCreatable from 'react-select/creatable';
import { toast } from 'sonner';
import { z } from 'zod';
import useSystemDropdownModuleStore from '@/05_stores/system/system-dropdown-module-store';
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

// Form validation schema
const FormSchema = z.object({
  label: z.string().min(1, { message: 'Required' }),
  system_dropdown_module_types: z.array(createReactSelectSchema(false)),
});

// Props
type UpdateSystemDropdownModuleDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void; // Function to refetch the table data after update
};

const UpdateSystemDropdownModuleDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateSystemDropdownModuleDialogProps) => {
  // Zustand store
  const { selectedSystemDropdownModule } = useSystemDropdownModuleStore();

  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      system_dropdown_module_types: [],
    },
  });

  // Populate form with selected item's data
  useEffect(() => {
    if (selectedSystemDropdownModule) {
      form.reset({
        label: selectedSystemDropdownModule.label || '',
        system_dropdown_module_types:
          selectedSystemDropdownModule.system_dropdown_module_types?.map(
            type => ({
              value: type.label,
              label: type.label,
            }),
          ) || [],
      });
    }
  }, [selectedSystemDropdownModule, form]);

  // Loading state for submit button
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdate(true);

    const newData = {
      ...data,
      system_dropdown_module_types: data.system_dropdown_module_types.map(
        item => item.value,
      ),
    };

    toast.promise(
      mainInstance.patch(
        `/system/system-dropdowns/modules/${selectedSystemDropdownModule?.id}`,
        newData,
      ),
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Update System Dropdown Module</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Label Field */}
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

                {/* System Dropdown Module Types Field */}
                <FormField
                  control={form.control}
                  name="system_dropdown_module_types"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Types</FormLabel>
                      <FormControl>
                        <ReactSelectCreatable
                          className="react-select"
                          classNamePrefix="react-select"
                          {...field}
                          options={[]}
                          isMulti
                        />
                      </FormControl>
                      <FormDescription>
                        Type a value and press{' '}
                        <kbd className="text-foreground">Tab</kbd> to add it.
                      </FormDescription>
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
  );
};

export default UpdateSystemDropdownModuleDialog;
