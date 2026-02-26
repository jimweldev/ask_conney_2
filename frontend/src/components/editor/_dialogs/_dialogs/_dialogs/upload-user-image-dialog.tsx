import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import FileDropzone from '@/components/dropzone/file-dropzone';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { handleRejectedFiles } from '@/lib/react-dropzone/handle-rejected-files';
import { mergeUniqueFiles } from '@/lib/react-dropzone/merge-unique-files';

// Zod schema to validate the form input
const FormSchema = z.object({
  user_images: z.array(
    z.file().refine(
      file => {
        // Check if file has a name
        if (!file.name || file.name.trim() === '') {
          return false;
        }

        const nameWithoutExt = file.name.split('.').slice(0, -1).join('.');

        // Check if file filename and not extension only
        if (nameWithoutExt === '') {
          return false;
        }

        return true;
      },
      {
        message: 'Invalid filename',
      },
    ),
  ),
});

// Component Props
type UploadUserImageDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch: () => void;
};

const UploadUserImageDialog = ({
  open,
  setOpen,
  refetch,
}: UploadUserImageDialogProps) => {
  // Access store values

  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      user_images: [],
    },
  });

  // Track loading state for submit button
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingCreateItem(true);

    const formData = new FormData();

    // Add files as attachments
    data.user_images.forEach((userImage, index) => {
      formData.append(`user_images[${index}]`, userImage);
    });

    // Send POST request and show toast notifications
    toast.promise(mainInstance.post(`/user-images`, formData), {
      loading: 'Loading...',
      success: () => {
        form.reset();
        refetch();
        setOpen(false);
        return 'Success!';
      },
      error: error => {
        // Display error message from response or fallback
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => {
        setIsLoadingCreateItem(false); // Reset loading state
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus={true}>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Upload User Image</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Name field */}
                <FormField
                  control={form.control}
                  name="user_images"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Files</FormLabel>
                      <FormControl>
                        <FileDropzone
                          isInvalid={fieldState.invalid}
                          setFiles={field.onChange}
                          files={field.value}
                          onDrop={(acceptedFiles, rejectedFiles) => {
                            const mergedFiles = mergeUniqueFiles(
                              field.value,
                              acceptedFiles,
                            );

                            field.onChange(mergedFiles);
                            handleRejectedFiles(rejectedFiles);
                          }}
                          onRemove={(fileToRemove: File) => {
                            field.onChange(
                              field.value.filter(file => file !== fileToRemove),
                            );
                          }}
                          accept={{ 'image/*': [] }}
                          isMultiple
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            {/* Dialog footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoadingCreateItem}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UploadUserImageDialog;
