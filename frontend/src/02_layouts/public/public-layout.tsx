import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';

const PublicLayout = () => {
  const navigate = useNavigate();

  const { token } = useAuthUserStore();

  useEffect(() => {
    if (token) {
      navigate('/', { replace: true });
    }
  }, [token, navigate]);

  return <Outlet />;
};

export default PublicLayout;
