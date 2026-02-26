import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import * as z from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { publicInstance } from '@/07_instances/public-instance';
import PasswordInput from '@/components/input/password-input';
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

const FormSchema = z
  .object({
    new_password: z.string().min(1, { message: 'Required' }),
    confirm_password: z.string().min(1, { message: 'Required' }),
  })
  .refine(data => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

const ResetPasswordPage = () => {
  const { setAuthUser } = useAuthUserStore();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const newData = {
      ...data,
      token: token,
    };

    setIsLoading(true);

    toast.promise(publicInstance.post('/auth/reset-password', newData), {
      loading: 'Loading...',
      success: response => {
        setAuthUser(response.data.user, response.data.access_token);
        return `Success!`;
      },
      error: error => {
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        <div>
          <h2 className="mb-1 text-xl font-semibold">Set new password</h2>
          <p className="text-muted-foreground text-sm">
            Enter your new password below.
          </p>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardBody className="space-y-layout p-8!">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-12 gap-3">
                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="new_password"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <PasswordInput type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Confirm Password */}
                  <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <PasswordInput type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="col-span-12"
                    disabled={isLoading}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </Form>
          </CardBody>
        </Card>

        {/* <div className="text-muted-foreground flex justify-center gap-1 text-sm">
          <p>Don't have an account yet?</p>
          <a className="text-primary font-medium hover:underline">Register</a>
        </div> */}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
