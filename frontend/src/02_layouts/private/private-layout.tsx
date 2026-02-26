import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';

const PrivateLayout = () => {
  const navigate = useNavigate();

  const { token, appName, clearAuthUser } = useAuthUserStore();

  useEffect(() => {
    if (!token) {
      navigate('/', { replace: true });
    } else if (appName !== import.meta.env.VITE_APP_NAME) {
      clearAuthUser();
      navigate('/', { replace: true });
    }
  }, [token, appName, clearAuthUser, navigate]);

  return <Outlet />;
};

export default PrivateLayout;
