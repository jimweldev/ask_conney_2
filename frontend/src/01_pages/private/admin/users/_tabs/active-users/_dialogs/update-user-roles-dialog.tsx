import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import useUserStore from '@/05_stores/user/user-store';
import { mainInstance } from '@/07_instances/main-instance';
import RoleSelect from '@/components/react-select/role-select';
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
import { Label } from '@/components/ui/label';
import { formatName } from '@/lib/user/format-name';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

// Zod schema to validate the form input
const FormSchema = z.object({
  roles: z.array(createReactSelectSchema()),
});

// Component Props
type UpdateUserRolesDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const UpdateUserRolesDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateUserRolesDialogProps) => {
  // Access store values
  const { selectedUser } = useUserStore();

  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      roles: [],
    },
  });

  // Populate form with selected items's data
  useEffect(() => {
    if (selectedUser) {
      const selectedRoles = selectedUser?.rbac_user_roles?.map(role => ({
        label: role.rbac_role?.label,
        value: role.rbac_role?.id,
      }));

      form.reset({
        roles: selectedRoles || [],
      });
    }
  }, [selectedUser, form]);

  // Track loading state for submit button
  const [isLoadingUpdateItem, setIsLoadingUpdateItem] =
    useState<boolean>(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    // Remove permissions from data
    const newData = {
      role_ids: data.roles.map(role => role.value),
    };

    setIsLoadingUpdateItem(true);

    // Send PATCH request and show toast notifications
    toast.promise(
      mainInstance.patch(`/users/${selectedUser?.id}/user-roles`, newData),
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
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Update User Roles</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="gap-layout grid grid-cols-12">
                {/* First Name field */}
                <div className="col-span-12">
                  <Label className="mb-1">User</Label>
                  <Input value={formatName(selectedUser)} readOnly />
                </div>

                <FormField
                  control={form.control}
                  name="roles"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Roles</FormLabel>
                      <FormControl>
                        <RoleSelect
                          placeholder="Select roles"
                          value={field.value || []}
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

export default UpdateUserRolesDialog;
