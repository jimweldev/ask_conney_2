import { useEffect } from 'react';
import useThemeStore from '@/05_stores/_common/theme-store';

const ThemeProvider = () => {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('light', 'dark');

    root.classList.add(theme);
  }, [theme, setTheme]);

  return null;
};

export default ThemeProvider;
