import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import PermissionSelect from '@/components/react-select/permission-select';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

// Zod schema to validate the form input
const FormSchema = z.object({
  label: z.string().min(1, {
    message: 'Required',
  }),
  value: z.string().min(1, {
    message: 'Required',
  }),
  permissions: z.array(createReactSelectSchema()),
});

// Component Props
type CreateRoleDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateRoleDialog = ({
  open,
  setOpen,
  refetch,
}: CreateRoleDialogProps) => {
  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      label: '',
      value: '',
      permissions: [],
    },
  });

  // Watch label to generate value
  const label = form.watch('label');

  // Generate value based on label
  useEffect(() => {
    const value = label
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    form.setValue('value', value);
  }, [label, form]);

  // Track loading state for submit button
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    const newData = {
      ...data,
      permission_ids: data.permissions.map(item => item.value),
    };

    if ('permissions' in newData) {
      delete (newData as { permissions?: unknown }).permissions;
    }

    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/rbac/roles`, newData), {
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
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus={true}>
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d, false))}
            autoComplete="off"
          >
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Create Role</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
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

                {/* Value field */}
                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Value</FormLabel>
                      <FormControl>
                        <Input {...field} readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Permissions field */}
                <FormField
                  control={form.control}
                  name="permissions"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Permissions</FormLabel>
                      <FormControl>
                        <PermissionSelect
                          className={cn(
                            'react-select-container',
                            fieldState.invalid ? 'invalid' : '',
                          )}
                          classNamePrefix="react-select"
                          value={field.value}
                          onChange={field.onChange}
                          isMulti
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            {/* Dialog footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <ButtonGroup>
                {/* Main submit */}
                <Button type="submit" disabled={isLoadingCreateItem}>
                  Submit
                </Button>

                {/* Dropdown actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isLoadingCreateItem}>
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

export default CreateRoleDialog;
