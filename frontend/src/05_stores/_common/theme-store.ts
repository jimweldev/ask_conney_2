import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'dark' | 'light';

interface ThemeStoreProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeStoreProps>()(
  persist(
    set => ({
      theme: 'light',
      setTheme: theme => set({ theme }),
    }),
    {
      name: 'theme',
    },
  ),
);

export default useThemeStore;
