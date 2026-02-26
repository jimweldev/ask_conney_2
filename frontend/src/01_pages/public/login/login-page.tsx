import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
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
import { Input } from '@/components/ui/input';
import GoogleLoginButton from './_components/google-login-button';
import TwoFactorAuthVerifyDialog from './_dialogs/two-factor-auth-verify-dialog';

const FormSchema = z.object({
  email: z.string().min(1, { message: 'Required' }),
  password: z.string().min(1, { message: 'Required' }),
});

const LoginPage = () => {
  const { setAuthUser } = useAuthUserStore();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [twoFAEmail, setTwoFAEmail] = useState('');

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    toast.promise(publicInstance.post('/auth/login', data), {
      loading: 'Authenticating...',
      success: response => {
        // 🔐 If 2FA is required
        if (response.data.requires_2fa) {
          setTwoFAEmail(data.email);
          setIs2FAModalOpen(true);
          return 'Two-Factor Authentication required.';
        }

        // ✅ Normal login
        setAuthUser(response.data.user, response.data.access_token);
        return 'Login successful!';
      },
      error: error => {
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => setIsLoading(false),
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {/* Logo and App Name */}
        <div className="flex flex-col items-center justify-center gap-2">
          <img className="size-15" src="/logos/logo.svg" alt="Logo" />
          <h4 className="text-center text-xl font-semibold">
            {import.meta.env.VITE_APP_NAME}
          </h4>
        </div>

        {/* Login Card */}
        <Card className="w-full">
          <CardBody className="space-y-layout p-8!">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="grid grid-cols-12 gap-3">
                  {/* Email */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="me@example.com"
                            {...field}
                            autoComplete="email"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            type="password"
                            {...field}
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-12 flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="col-span-12"
                    disabled={isLoading}
                  >
                    Login
                  </Button>
                </div>
              </form>
            </Form>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <span className="bg-input h-px w-full"></span>
              <span className="text-muted-foreground text-xs">OR</span>
              <span className="bg-input h-px w-full"></span>
            </div>

            {/* Google Login */}
            <GoogleLoginButton />
          </CardBody>
        </Card>
      </div>

      {/* ✅ Two-Factor Verification Modal */}
      <TwoFactorAuthVerifyDialog
        open={is2FAModalOpen}
        email={twoFAEmail}
        onClose={() => setIs2FAModalOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
