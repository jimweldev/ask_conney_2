import { useState } from 'react';
import { FaFingerprint } from 'react-icons/fa6';
import { toast } from 'sonner';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { mainInstance } from '@/07_instances/main-instance';
import PageSubHeader from '@/components/typography/page-sub-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import TwoFactorAuthDialog from './_dialogs/two-factor-auth-dialog';

const TwoFactorAuthenticationPanel = () => {
  const { user, setUser } = useAuthUserStore();

  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [qrCodeData, setQrCodeData] = useState('');
  const [secret, setSecret] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(user?.is_two_factor_enabled);

  // ✅ Enable 2FA
  const enable2fa = () => {
    toast.promise(mainInstance.post(`/2fa/enable`), {
      loading: 'Enabling 2FA...',
      success: res => {
        const { secret, qr_code } = res.data;
        setQrCodeData(qr_code);
        setSecret(secret);
        setIs2FAModalOpen(true);
        return 'Scan the QR code to finish setup.';
      },
      error: err => err.response?.data?.message || err.message || 'Error',
    });
  };

  // ✅ Disable 2FA
  const disable2fa = () => {
    toast.promise(mainInstance.post(`/2fa/disable`), {
      loading: 'Disabling 2FA...',
      success: () => {
        setIs2FAEnabled(false);
        setUser({ ...user, is_two_factor_enabled: false });
        return '2FA disabled successfully!';
      },
      error: err =>
        err.response?.data?.message || err.message || 'Error disabling 2FA',
    });
  };

  return (
    <>
      <PageSubHeader className="mb-3">Two-Factor Authentication</PageSubHeader>

      <Card className="max-w-md">
        <CardBody className="space-y-4">
          <div className="flex items-center gap-3">
            {is2FAEnabled ? (
              <FaFingerprint className="text-success text-2xl drop-shadow-xl" />
            ) : (
              <FaFingerprint className="text-muted-foreground text-2xl" />
            )}

            <div>
              <p className="text-sm font-medium">
                {is2FAEnabled
                  ? 'Two-Factor Authentication Enabled'
                  : 'Two-Factor Authentication Disabled'}
              </p>
              <p className="text-muted-foreground text-xs">
                {is2FAEnabled
                  ? 'Your account is protected with an additional layer of security.'
                  : 'Protect your account by enabling two-factor authentication.'}
              </p>
            </div>
          </div>

          {/* Subtle info */}
          {!is2FAEnabled && (
            <p className="text-muted-foreground text-xs">
              Once enabled, you’ll scan a QR code using Google Authenticator or
              any compatible app.
            </p>
          )}

          {/* Button below */}
          {is2FAEnabled ? (
            <Button
              variant="destructive"
              className="w-full"
              onClick={disable2fa}
            >
              Disable 2FA
            </Button>
          ) : (
            <Button className="w-full" onClick={enable2fa}>
              Enable 2FA
            </Button>
          )}
        </CardBody>
      </Card>

      {/* ✅ 2FA Modal Component */}
      <TwoFactorAuthDialog
        open={is2FAModalOpen}
        onOpenChange={setIs2FAModalOpen}
        secret={secret}
        qrCodeData={qrCodeData}
        onVerified={() => setIs2FAEnabled(true)}
      />
    </>
  );
};

export default TwoFactorAuthenticationPanel;
