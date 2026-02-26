import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { mainInstance } from '@/07_instances/main-instance';
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

interface TwoFactorAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  secret: string;
  qrCodeData: string;
  onVerified: () => void;
}

const TwoFAVerifySchema = z.object({
  otp: z.string().length(6, { message: 'Must be 6 digits' }),
});

const TwoFactorAuthDialog = ({
  open,
  onOpenChange,
  secret,
  qrCodeData,
  onVerified,
}: TwoFactorAuthDialogProps) => {
  const { user, setUser } = useAuthUserStore();
  const [isVerifying, setIsVerifying] = useState(false);

  const form = useForm<z.infer<typeof TwoFAVerifySchema>>({
    resolver: zodResolver(TwoFAVerifySchema),
    defaultValues: { otp: '' },
  });

  const renderQRCode = () => {
    if (!qrCodeData) return null;

    if (qrCodeData.includes('<svg')) {
      return (
        <div
          className="flex justify-center"
          dangerouslySetInnerHTML={{ __html: qrCodeData }}
        />
      );
    }

    if (qrCodeData.startsWith('data:image/')) {
      return (
        <div className="flex justify-center">
          <img src={qrCodeData} alt="QR Code" className="h-48 w-48" />
        </div>
      );
    }

    return (
      <div
        className="flex justify-center"
        dangerouslySetInnerHTML={{ __html: qrCodeData }}
      />
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Secret copied!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const verify2fa = (data: z.infer<typeof TwoFAVerifySchema>) => {
    setIsVerifying(true);
    toast.promise(mainInstance.post(`/2fa/verify`, { otp: data.otp }), {
      loading: 'Verifying...',
      success: () => {
        form.reset();
        onVerified();
        onOpenChange(false);
        setUser({ ...user, is_two_factor_enabled: true });
        return '2FA successfully enabled!';
      },
      error: err =>
        err.response?.data?.message || err.message || 'Error verifying code',
      finally: () => setIsVerifying(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(verify2fa)}>
            <DialogHeader>
              <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
              <DialogDescription>
                Scan the QR code or enter the secret manually, then verify it
                with your authenticator app.
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              <div className="space-y-4">
                {renderQRCode()}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Secret Key:</label>
                  <div className="flex items-center space-x-2">
                    <code className="bg-muted flex-1 rounded-md px-3 py-2 font-mono text-sm">
                      {secret}
                    </code>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => copyToClipboard(secret)}
                      tabIndex={-1}
                    >
                      Copy
                    </Button>
                  </div>
                </div>

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
              </div>
            </DialogBody>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isVerifying}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthDialog;
