import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { UserImage } from '@/04_types/user/user-image';
import { mainInstance } from '@/07_instances/main-instance';
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
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  file_name: z.string().min(1, {
    message: 'Required',
  }),
  file_extension: z.string().min(1, {
    message: 'Required',
  }),
});

type RenameUserImageDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  refetch: () => void;
  selectedItem: UserImage;
};

const RenameUserImageDialog = ({
  open,
  setOpen,
  refetch,
  selectedItem,
}: RenameUserImageDialogProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      file_name: '',
      file_extension: '',
    },
  });

  useEffect(() => {
    if (selectedItem) {
      const [name, extension] = (selectedItem?.file_name || '').split(
        /\.(?=[^.]+$)/,
      );

      form.reset({
        file_name: name || '',
        file_extension: extension || '',
      });
    }
  }, [selectedItem, form]);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);

    toast.promise(
      mainInstance.patch(`/user-images/${selectedItem?.id}`, {
        file_name: `${data.file_name}.${data.file_extension}`,
      }),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error => {
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsLoading(false);
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <Form {...form}>
          <form
            onSubmit={e => {
              e.stopPropagation();
              form.handleSubmit(onSubmit)(e);
            }}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Rename User Image</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                <FormField
                  control={form.control}
                  name="file_name"
                  render={({ field }) => (
                    <FormItem className="col-span-9">
                      <FormLabel>File Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="example" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="file_extension"
                  render={({ field }) => (
                    <FormItem className="col-span-3">
                      <FormLabel>Extension</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="jpg" readOnly />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                Rename
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RenameUserImageDialog;
