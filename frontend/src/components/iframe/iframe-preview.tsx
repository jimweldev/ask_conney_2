import { useEffect, useRef, useState } from 'react';

type IframePreviewProps = {
  htmlContent: string;
};

const IframePreview = ({ htmlContent }: IframePreviewProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(300);

  useEffect(() => {
    const iframe = iframeRef.current;

    if (iframe) {
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.writeln(htmlContent);
        doc.close();

        const updateHeight = () => {
          if (iframe.contentDocument?.body) {
            const newHeight = iframe.contentDocument.body.scrollHeight;
            setHeight(newHeight);
          }
        };

        setTimeout(updateHeight, 50);
      }
    }
  }, [htmlContent]);

  return (
    <iframe
      ref={iframeRef}
      style={{ height: `${height}px` }}
      className="w-full rounded"
      title="HTML Preview"
    />
  );
};

export default IframePreview;
