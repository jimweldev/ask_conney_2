import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FontSizeStoreProps {
  fontSize: string;
  setFontSize: (fontsize: string) => void;
}

const useFontSizeStore = create<FontSizeStoreProps>()(
  persist(
    set => ({
      fontSize: '1rem',
      setFontSize: fontSize => set({ fontSize }),
    }),
    {
      name: 'fontSize',
    },
  ),
);

export default useFontSizeStore;
