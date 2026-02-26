import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactSelectCreatable from 'react-select/creatable';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
type CreateSystemDropdownModuleDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void; // Function to refetch the table data after creation
};

const CreateSystemDropdownModuleDialog = ({
  open,
  setOpen,
  refetch,
}: CreateSystemDropdownModuleDialogProps) => {
  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      system_dropdown_module_types: [],
    },
  });

  // Loading state for submit button
  const [isLoadingCreate, setIsLoadingCreate] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    setIsLoadingCreate(true);

    const newData = {
      ...data,
      system_dropdown_module_types: data.system_dropdown_module_types.map(
        item => item.value,
      ),
    };

    toast.promise(
      mainInstance.post(`/system/system-dropdowns/modules`, newData),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          if (!keepOpen) {
            form.reset();
            setOpen(false);
          }
          return 'Success!';
        },
        error: error =>
          error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingCreate(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d, false))}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Create System Dropdown Module</DialogTitle>
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

            {/* Dialog footer with buttons */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <ButtonGroup>
                {/* Main submit */}
                <Button type="submit" disabled={isLoadingCreate}>
                  Submit
                </Button>

                {/* Dropdown actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isLoadingCreate}>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(data => onSubmit(data, false))()
                        }
                      >
                        Submit & Close
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(data => onSubmit(data, true))()
                        }
                      >
                        Submit & Keep Open
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSystemDropdownModuleDialog;
