import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { cn } from '@/lib/utils';

// Zod schema to validate the form input
const FormSchema = z.object({
  first_name: z.string().min(1, {
    message: 'Required',
  }),
  middle_name: z.string(),
  last_name: z.string().min(1, {
    message: 'Required',
  }),
  suffix: z.string(),
  email: z.email({
    message: 'Invalid email address',
  }),
  account_type: z.object(
    {
      label: z.string(),
      value: z.any(),
    },
    {
      message: 'Required',
    },
  ),
  is_admin: z.object(
    {
      label: z.string(),
      value: z.any(),
    },
    {
      message: 'Required',
    },
  ),
});

// Component Props
type CreateUserDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateUserDialog = ({
  open,
  setOpen,
  refetch,
}: CreateUserDialogProps) => {
  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      email: '',
      account_type: {
        label: 'Main',
        value: 'Main',
      },
      is_admin: {
        label: 'No',
        value: 'No',
      },
    },
  });

  // Track loading state for submit button
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    const newData = {
      ...data,
      account_type: data.account_type.value,
      is_admin: data.is_admin.value === 'Yes',
    };

    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/users`, newData), {
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
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* First Name field */}
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Middle Name field */}
                <FormField
                  control={form.control}
                  name="middle_name"
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel>Middle Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Last Name field */}
                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem className="col-span-5">
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Suffix field */}
                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Suffix</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Email field */}
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Account Type field */}
                <FormField
                  control={form.control}
                  name="account_type"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Account Type</FormLabel>
                      <FormControl>
                        <ReactSelect
                          className={cn(
                            'react-select-container',
                            fieldState.invalid ? 'invalid' : '',
                          )}
                          classNamePrefix="react-select"
                          options={convertToSelectOptions(['Main', 'Guest'])}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Is Admin field */}
                <FormField
                  control={form.control}
                  name="is_admin"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-6">
                      <FormLabel>Admin</FormLabel>
                      <FormControl>
                        <ReactSelect
                          className={cn(
                            'react-select-container',
                            fieldState.invalid ? 'invalid' : '',
                          )}
                          classNamePrefix="react-select"
                          options={convertToSelectOptions(['Yes', 'No'])}
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

export default CreateUserDialog;
