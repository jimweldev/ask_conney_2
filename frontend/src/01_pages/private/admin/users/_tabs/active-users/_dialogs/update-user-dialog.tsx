import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
import { toast } from 'sonner';
import { z } from 'zod';
import useUserStore from '@/05_stores/user/user-store';
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
type UpdateUserDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const UpdateUserDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateUserDialogProps) => {
  // Access store values
  const { selectedUser } = useUserStore();

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

  // Populate form with selected items's data
  useEffect(() => {
    if (selectedUser) {
      form.reset({
        first_name: selectedUser.first_name || '',
        middle_name: selectedUser.middle_name || '',
        last_name: selectedUser.last_name || '',
        suffix: selectedUser.suffix || '',
        email: selectedUser.email || '',
        account_type: {
          label: selectedUser.account_type || 'Main',
          value: selectedUser.account_type || 'Main',
        },
        is_admin: {
          label: selectedUser.is_admin ? 'Yes' : 'No',
          value: selectedUser.is_admin ? 'Yes' : 'No',
        },
      });
    }
  }, [selectedUser, form]);

  // Track loading state for submit button
  const [isLoadingUpdateItem, setIsLoadingUpdateItem] =
    useState<boolean>(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newData = {
      ...data,
      account_type: data.account_type.value,
      is_admin: data.is_admin.value === 'Yes' ? true : false,
    };
    setIsLoadingUpdateItem(true);

    // Send PATCH request and show toast notifications
    toast.promise(mainInstance.patch(`/users/${selectedUser?.id}`, newData), {
      loading: 'Loading...',
      success: () => {
        refetch();
        setOpen(false);
        return 'Success!';
      },
      error: error => {
        // Display error message from response or fallback
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoadingUpdateItem(false); // Reset loading state
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Update User</DialogTitle>
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

export default UpdateUserDialog;
