import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import * as z from 'zod';
import { publicInstance } from '@/07_instances/public-instance';
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

const FormSchema = z.object({
  email: z.string().min(1, { message: 'Required' }).email('Invalid email'),
});

const ForgotPasswordPage = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(0); // seconds left for resend

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // Countdown effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer]);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    toast.promise(
      publicInstance.post('/auth/send-reset-password-email', data),
      {
        loading: 'Loading...',
        success: _ => {
          setSubmittedEmail(data.email);
          setIsSubmitted(true);
          setTimer(60); // Start 1-minute countdown
          return `Success!`;
        },
        error: error => {
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsLoading(false);
        },
      },
    );
  };

  const handleResend = async () => {
    setIsResending(true);

    toast.promise(
      publicInstance.post('/auth/send-reset-password-email', {
        email: submittedEmail,
      }),
      {
        loading: 'Resending...',
        success: _ => {
          setTimer(180); // restart 3-minute countdown
          return `Link resent successfully!`;
        },
        error: error => {
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsResending(false);
        },
      },
    );
  };

  // Format remaining time (mm:ss)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-3">
        {!isSubmitted ? (
          <>
            <div>
              <h2 className="mb-1 text-xl font-semibold">
                Forgot your password?
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter your email address to reset your password.
              </p>
            </div>

            <Card className="w-full">
              <CardBody className="space-y-layout !p-8">
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

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        className="col-span-12"
                        disabled={isLoading}
                      >
                        Continue
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardBody>
            </Card>

            <div className="flex justify-center">
              <Button variant="link">
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Go back to login
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <Card className="w-full text-center">
              <CardBody className="space-y-4 !p-8">
                <h2 className="text-xl font-semibold">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  We’ve sent a password reset link to{' '}
                  <strong>{submittedEmail}</strong>.
                </p>

                <div className="flex flex-col items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleResend}
                    disabled={isResending || timer > 0}
                  >
                    {isResending
                      ? 'Resending...'
                      : timer > 0
                        ? `Resend available in ${formatTime(timer)}`
                        : 'Resend reset link'}
                  </Button>
                </div>
              </CardBody>
            </Card>

            <div className="flex justify-center">
              <Button variant="link">
                <Link
                  to="/login"
                  className="text-primary font-medium hover:underline"
                >
                  Go back to login
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
