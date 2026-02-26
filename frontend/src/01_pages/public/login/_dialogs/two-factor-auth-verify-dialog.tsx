import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { publicInstance } from '@/07_instances/public-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
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
} from '@/components/ui/form';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

const TwoFAVerifySchema = z.object({
  otp: z.string().length(6, { message: 'Must be 6 digits' }),
});

interface TwoFactorAuthVerifyDialogProps {
  open: boolean;
  email: string;
  onClose: () => void;
}

const TwoFactorAuthVerifyDialog = ({
  open,
  email,
  onClose,
}: TwoFactorAuthVerifyDialogProps) => {
  const { setAuthUser } = useAuthUserStore();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<z.infer<typeof TwoFAVerifySchema>>({
    resolver: zodResolver(TwoFAVerifySchema),
    defaultValues: { otp: '' },
  });

  const onSubmit = (data: z.infer<typeof TwoFAVerifySchema>) => {
    setIsVerifying(true);

    toast.promise(
      publicInstance.post('/2fa/login', { email, code: data.otp }),
      {
        loading: 'Verifying...',
        success: res => {
          setAuthUser(res.data.user, res.data.access_token);
          onClose();
          form.reset();
          return 'Login successful!';
        },
        error: err =>
          err.response?.data?.message || err.message || 'Invalid code',
        finally: () => setIsVerifying(false),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Enter the 6-digit code from your Authenticator app.
              </DialogDescription>
              <DialogDescription>
                Lost access to your Authenticator? Send an email to{' '}
                <strong>support@connextglobal.com</strong>
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="block text-center">
                      Enter 6-digit Code
                    </FormLabel>
                    <FormControl>
                      <InputOTP
                        containerClassName="justify-center"
                        maxLength={6}
                        {...field}
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={1} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={4} />
                        </InputOTPGroup>
                        <InputOTPGroup>
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                  </FormItem>
                )}
              />
            </DialogBody>
            <DialogFooter className="flex justify-end">
              <Button type="submit" disabled={isVerifying}>
                Verify
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthVerifyDialog;
