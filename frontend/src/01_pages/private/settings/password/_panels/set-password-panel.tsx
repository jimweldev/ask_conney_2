import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { mainInstance } from '@/07_instances/main-instance';
import PasswordInput from '@/components/input/password-input';
import PageSubHeader from '@/components/typography/page-sub-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

// ✅ Zod validation schema for password form
const FormSchema = z
  .object({
    new_password: z.string().min(1, { message: 'Required' }),
    confirm_new_password: z.string().min(1, { message: 'Required' }),
  })
  .refine(data => data.new_password === data.confirm_new_password, {
    message: 'Passwords do not match',
    path: ['confirm_new_password'],
  });

const SetPasswordPanel = () => {
  const { user, setUser } = useAuthUserStore();
  const [isLoadingChangePassword, setIsLoadingChangePassword] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      new_password: '',
      confirm_new_password: '',
    },
  });

  // ✅ Change password
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingChangePassword(true);
    toast.promise(mainInstance.patch(`/settings/set-password`, data), {
      loading: 'Updating password...',
      success: () => {
        setUser({ ...user, has_password: true });
        form.reset();
        return 'Password updated successfully!';
      },
      error: err => err.response?.data?.message || err.message || 'Error',
      finally: () => setIsLoadingChangePassword(false),
    });
  };

  return (
    <>
      <PageSubHeader className="mb-3">Set Password</PageSubHeader>

      {/* ✅ Set password */}
      <Card className="mb-layout max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardBody className="space-y-layout">
              <div className="gap-layout grid grid-cols-12">
                <FormField
                  control={form.control}
                  name="new_password"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_new_password"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoadingChangePassword}>
                  Submit
                </Button>
              </div>
            </CardBody>
          </form>
        </Form>
      </Card>
    </>
  );
};

export default SetPasswordPanel;
