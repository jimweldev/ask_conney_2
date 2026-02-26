// authUserStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/04_types/user/user';

interface AuthUserStoreProps {
  user: User | null;
  token: string | null;
  appName: string | null;
  setUser: (user: User) => void;
  setToken: (token: string, navigate?: (path: string) => void) => void;
  setAuthUser: (
    user: User,
    token: string,
    navigate?: (path: string) => void,
  ) => void;
  clearAuthUser: (navigate?: (path: string) => void) => void;
}

const useAuthUserStore = create<AuthUserStoreProps>()(
  persist(
    set => ({
      user: null,
      token: null,
      appName: null,
      setUser: user => set({ user }),
      setToken: token => {
        set({ token });
      },
      setAuthUser: (user, token) => {
        set({ user, token, appName: import.meta.env.VITE_APP_NAME });
      },
      clearAuthUser: () => {
        set({ user: null, token: null, appName: null });
      },
    }),
    {
      name: 'auth-user',
    },
  ),
);

export default useAuthUserStore;
