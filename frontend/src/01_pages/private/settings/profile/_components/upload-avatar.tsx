import { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { toast } from 'sonner';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { mainInstance } from '@/07_instances/main-instance';
import ImageCropper from '@/components/image/image-cropper';
import InputGroup from '@/components/input-group/input-group';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { dataURLtoFile } from '@/lib/image/data-url-to-file';
import { resizeImage } from '@/lib/image/resize-image';

// Define props for the UploadAvatar component
type UploadAvatarProps = {
  open: boolean; // Dialog open state
  setOpen: React.Dispatch<React.SetStateAction<boolean>>; // Setter to toggle open state
};

const UploadAvatar = ({ open, setOpen }: UploadAvatarProps) => {
  // Access user data and user state setter from the store
  const { user, setUser } = useAuthUserStore();

  // Ref for file input to reset it when needed
  const fileImageRef = useRef<HTMLInputElement>(null);

  // Local state for image source and cropped image
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  // Loading state for upload button
  const [isLoadingUploadAvatar, setIsLoadingUploadAvatar] = useState(false);

  // Handle form submission to upload the avatar
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!croppedImage) {
      toast.error('No image selected');
      return;
    }

    setIsLoadingUploadAvatar(true);

    // Resize image and prepare FormData
    const formData = new FormData();
    const resizedImage = await resizeImage(croppedImage, 128, 128);
    formData.append('avatar', dataURLtoFile(resizedImage, 'avatar.jpg'));

    // Show toast notifications for upload process
    toast.promise(
      mainInstance.post(`/settings/profile/avatar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      {
        loading: 'Loading...',
        success: response => {
          // Update user avatar on success
          setUser({ ...user!, avatar_path: response.data.avatar_path });
          setImageSource(null);
          setCroppedImage(null);
          setOpen(false);
          return 'Success!';
        },
        error: error => {
          // Show appropriate error message
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsLoadingUploadAvatar(false);
        },
      },
    );
  };

  // Handle file input change
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    // Validate file type
    if (file && !file.type.match('image/jpeg|image/png')) {
      toast.error('Only jpg and png images are allowed');
      return;
    }

    if (file) {
      // Create object URL for selected image
      setImageSource(URL.createObjectURL(file));
    }
  };

  // Remove selected image and reset states
  const onRemoveImage = () => {
    setImageSource(null);
    setCroppedImage(null);
    if (fileImageRef.current) {
      fileImageRef.current.value = '';
    }
  };

  // Render modal dialog with form
  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        setOpen(false);
        onRemoveImage(); // Reset image data on close
      }}
    >
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Upload Avatar</DialogTitle>
          </DialogHeader>

          <DialogBody className="space-y-3">
            {/* Image cropper component */}
            <ImageCropper
              imageSource={imageSource}
              onCropComplete={setCroppedImage}
              aspectRatio={1 / 1}
            />

            {/* File input and remove button */}
            <InputGroup>
              <Input
                ref={fileImageRef}
                id="image-cropper"
                type="file"
                accept=".jpg, .png"
                inputSize="sm"
                onChange={onFileChange}
              />

              <Button
                variant="destructive"
                size="icon-sm"
                onClick={onRemoveImage}
              >
                <FaTimes />
              </Button>
            </InputGroup>
          </DialogBody>

          {/* Footer buttons */}
          <DialogFooter className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setOpen(false);
                onRemoveImage();
              }}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isLoadingUploadAvatar}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadAvatar;
