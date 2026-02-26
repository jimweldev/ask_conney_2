import { useEffect, useState } from 'react';
import { Fancybox, type FancyboxOptions } from '@fancyapps/ui/dist/fancybox/';
import '@fancyapps/ui/dist/fancybox/fancybox.css';
import { toast } from 'sonner';

export default function useFancybox(
  options: Partial<FancyboxOptions> = {
    Carousel: {
      Toolbar: {
        items: {
          dl: {
            tpl: `<button class="f-button" title="Download"><svg tabindex="-1" width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"></path></svg></button>`,
            click: async fancybox => {
              const link = fancybox.getPage().slides[0].src;

              if (link) {
                try {
                  const response = await fetch(link);
                  const blob = await response.blob();
                  const blobUrl = URL.createObjectURL(blob);

                  const a = document.createElement('a');
                  a.href = blobUrl;
                  a.download = link.split('/').pop() || 'download';
                  document.body.appendChild(a);
                  a.click();

                  // Clean up
                  document.body.removeChild(a);
                  URL.revokeObjectURL(blobUrl);
                } catch (_error) {
                  toast.error('Failed to download image');
                }
              }
            },
          },
        },
        display: {
          left: [
            'zoomIn',
            'zoomOut',
            'rotateCCW',
            'rotateCW',
            'flipX',
            'flipY',
            'reset',
          ],
          middle: ['counter'],
          right: ['autoplay', 'thumbs', 'fullscreen', 'dl', 'close'],
        },
      },
    },
  },
) {
  const [root, setRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (root) {
      Fancybox.bind(root, '[data-fancybox]', options);
      return () => Fancybox.unbind(root);
    }
  }, [root, options]);

  return [setRoot];
}
