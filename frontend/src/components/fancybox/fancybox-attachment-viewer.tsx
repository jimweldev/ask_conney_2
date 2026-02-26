import { useEffect, useState } from 'react';
import { Img } from 'react-image';
import fallbackImage from '/images/image-not-found.png';

type FancyboxAttachmentViewerProps = {
  className?: string;
  src: string;
  alt?: string;
  unloaderSrc?: string;
};

const FancyboxAttachmentViewer = ({
  className = '',
  src,
  alt = 'Image not found',
  unloaderSrc = fallbackImage,
}: FancyboxAttachmentViewerProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <Img
      className={className}
      src={src}
      alt={alt}
      loader={<div className="bg-primary h-full w-full animate-pulse" />}
      unloader={<img src={unloaderSrc} alt={alt} />}
    />
  );
};

export default FancyboxAttachmentViewer;
