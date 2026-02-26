import { useEffect, useState } from 'react';
import { Img } from 'react-image';
import { cn } from '@/lib/utils';
import fallbackImage from '/images/image-not-found.png';

type ReactImageProps = {
  className?: string;
  src: string | undefined;
  alt?: string;
  fallback?: string;
};

const ReactImage = ({
  className = '',
  src,
  alt = 'Image not found',
  fallback = fallbackImage,
}: ReactImageProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Img
      className={className}
      src={src || fallback}
      alt={alt}
      loader={
        <div
          className={cn('bg-primary h-full w-full animate-pulse', className)}
        />
      }
      unloader={<img className={className} src={fallback} alt={alt} />}
    />
  );
};

export default ReactImage;
