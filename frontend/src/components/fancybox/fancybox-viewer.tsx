import { useEffect, useState } from 'react';
import fallbackImage from '/images/image-not-found.png';

type FancyboxViewerProps = {
  baseUrl: string;
  filePath?: string;
  fallback?: string;
  children: React.ReactNode;
};

const FancyboxViewer = ({
  baseUrl,
  filePath,
  fallback = fallbackImage,
  children,
  ...props
}: FancyboxViewerProps) => {
  const [url, setUrl] = useState('');
  const [type, setType] = useState('');

  useEffect(() => {
    if (!filePath) {
      setUrl(fallback);
      return;
    }

    const extension = filePath.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'doc':
      case 'docx':
      case 'ppt':
      case 'pptx':
      case 'xls':
      case 'xlsx':
        setUrl(
          `https://docs.google.com/gview?url=${encodeURIComponent(`${baseUrl}${filePath}`)}&embedded=true`,
        );
        setType('iframe');
        break;
      case 'pdf':
        setUrl(`${baseUrl}${filePath}`);
        setType('pdf');
        break;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'svg':
        setUrl(`${baseUrl}${filePath}`);
        setType('image');
        break;
      default: // not viewable files (e.g. .txt, .zip)
        setUrl(fallback);
        setType('image');
        break;
    }
  }, [baseUrl, filePath, fallback]);

  if (!url) return null; // Prevent rendering until URL is set

  return (
    <a href={url} data-type={type} {...props}>
      {children}
    </a>
  );
};

export default FancyboxViewer;
