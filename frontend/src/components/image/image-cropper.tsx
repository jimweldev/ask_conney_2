import { useEffect, useState } from 'react';
import Cropper from 'react-easy-crop';
import { toast } from 'sonner';
import { Slider } from '../ui/slider';

interface ImageCropperProps {
  imageSource: string | null;
  onCropComplete: (croppedImage: string) => void;
  aspectRatio?: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

const ImageCropper = ({
  imageSource,
  onCropComplete,
  aspectRatio = 1 / 1,
}: ImageCropperProps) => {
  const MIN_ZOOM = 1;
  const MAX_ZOOM = 10;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!imageSource) {
      setZoom(1);
    }
  }, [imageSource]);

  const handleCropComplete = async (
    _: unknown,
    croppedAreaPixels: CroppedAreaPixels,
  ) => {
    try {
      const croppedResult = await generateCroppedImage(
        imageSource!,
        croppedAreaPixels,
      );
      onCropComplete(croppedResult);
    } catch (_e) {
      toast.error('Failed to crop image');
    }
  };

  const generateCroppedImage = (
    imageSource: string,
    cropArea: CroppedAreaPixels,
  ) => {
    return new Promise<string>((resolve, reject) => {
      const imageElement = new Image();
      imageElement.src = imageSource;
      imageElement.onload = () => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        if (!context) {
          return reject('Could not get canvas context');
        }

        canvas.width = cropArea.width;
        canvas.height = cropArea.height;

        context.drawImage(
          imageElement,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );

        resolve(canvas.toDataURL('image/png'));
      };

      imageElement.onerror = error => reject(error);
    });
  };

  return (
    <div>
      {imageSource ? (
        <div className="space-y-3">
          <div className="relative aspect-square border-4">
            <Cropper
              image={imageSource}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onCropComplete={handleCropComplete}
              onZoomChange={setZoom}
            />
          </div>

          <Slider
            value={[zoom * 10]}
            max={MAX_ZOOM * 10}
            min={MIN_ZOOM * 10}
            step={1}
            onValueChange={value => setZoom(value[0] / 10)}
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="bg-muted relative flex aspect-square items-center justify-center border-4">
            <p className="text-muted-foreground text-center">
              No image selected
            </p>
          </div>

          <Slider
            value={[0]}
            max={0}
            min={0}
            step={1}
            onValueChange={value => setZoom(value[0] / 10)}
          />
        </div>
      )}
    </div>
  );
};

export default ImageCropper;
