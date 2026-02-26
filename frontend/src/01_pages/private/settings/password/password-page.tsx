import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import PageHeader from '@/components/typography/page-header';
import ChangePasswordPanel from './_panels/change-password-panel';
import SetPasswordPanel from './_panels/set-password-panel';
import TwoFactorAuthenticationPanel from './_panels/two-factor-authentication/two-factor-authentication-panel';

const PasswordPage = () => {
  const { user } = useAuthUserStore();

  return (
    <>
      <PageHeader className="mb-3">Password & 2FA</PageHeader>

      {user?.has_password ? (
        <>
          <ChangePasswordPanel />
          <TwoFactorAuthenticationPanel />
        </>
      ) : (
        <SetPasswordPanel />
      )}
    </>
  );
};

export default PasswordPage;
