import axios from 'axios';
import { toast } from 'sonner';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';

const mainInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

mainInstance.interceptors.request.use(
  config => {
    const { token } = useAuthUserStore.getState();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  error => Promise.reject(error),
);

mainInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const { token } = useAuthUserStore.getState();

      if (token) {
        useAuthUserStore.getState().clearAuthUser();
        toast.error('Session expired. Login again to continue.');
      }

      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      toast.error('You do not have permission to access this resource.');
    }

    return Promise.reject(error);
  },
);

export { mainInstance };
