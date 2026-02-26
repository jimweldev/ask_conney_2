import { useEffect } from 'react';
import useFontSizeStore from '@/05_stores/_common/font-size-store';

const FontSizeProvider = () => {
  const { fontSize } = useFontSizeStore();

  useEffect(() => {
    document.documentElement.style.setProperty('--font-size', fontSize);
  }, [fontSize]);

  return null;
};

export default FontSizeProvider;
