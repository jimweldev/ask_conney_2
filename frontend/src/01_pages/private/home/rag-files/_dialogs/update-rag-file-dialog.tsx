import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import useRagFileStore from '@/05_stores/rag/rag-file-store';
import { mainInstance } from '@/07_instances/main-instance';
import FileDropzone from '@/components/dropzone/file-dropzone';
import SystemDropdownSelect from '@/components/react-select/system-dropdown-select';
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
import { handleRejectedFiles } from '@/lib/react-dropzone/handle-rejected-files';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

// Form validation schema
const FormSchema = z.object({
  title: z.string().min(1, { message: 'Required' }),
  allowed_locations: z.array(createReactSelectSchema()).optional(),
  allowed_positions: z.array(createReactSelectSchema()).optional(),
  allowed_websites: z.array(createReactSelectSchema()).optional(),
  file: z.file().optional(),
});

// Props
type UpdateRagFileDialogProps = {
  open: boolean; // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void; // Function to refetch the table data after update
};

const UpdateRagFileDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateRagFileDialogProps) => {
  // Zustand store
  const { selectedRagFile } = useRagFileStore();

  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      title: '',
      allowed_locations: [],
      allowed_positions: [],
      allowed_websites: [],
      file: undefined,
    },
  });

  // Populate form with selected item's data
  useEffect(() => {
    if (selectedRagFile) {
      form.reset({
        title: selectedRagFile.title || '',
        allowed_locations: selectedRagFile.allowed_locations?.map(l => ({
          label: l,
          value: l,
        })),
        allowed_positions: selectedRagFile.allowed_positions?.map(p => ({
          label: p,
          value: p,
        })),
        allowed_websites: selectedRagFile.allowed_websites?.map(w => ({
          label: w,
          value: w,
        })),
      });
    }
  }, [selectedRagFile, form]);

  // Loading state for submit button
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const formData = new FormData();

    const allowedLocations =
      data.allowed_locations?.map((l: ReactSelectOption) => l.label) || [];
    const allowedPositions =
      data.allowed_positions?.map((p: ReactSelectOption) => p.label) || [];
    const allowedWebsites =
      data.allowed_websites?.map((w: ReactSelectOption) => w.label) || [];

    formData.append('title', data.title);
    formData.append('allowed_locations', JSON.stringify(allowedLocations));
    formData.append('allowed_positions', JSON.stringify(allowedPositions));
    formData.append('allowed_websites', JSON.stringify(allowedWebsites));
    formData.append('file', data.file || '');

    setIsLoadingUpdate(true);

    toast.promise(
      mainInstance.patch(`/rag/files/${selectedRagFile?.id}`, formData),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error =>
          error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingUpdate(false), // Reset loading state
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Update Rag File</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Title Field */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Allowed Locations Field */}
                <FormField
                  control={form.control}
                  name="allowed_locations"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Locations</FormLabel>
                      <FormControl>
                        <SystemDropdownSelect
                          isMulti
                          className={`${fieldState.invalid ? 'invalid' : ''}`}
                          module="Company"
                          type="Location"
                          placeholder="Select locations"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Allowed Positions Field */}
                <FormField
                  control={form.control}
                  name="allowed_positions"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Positions</FormLabel>
                      <FormControl>
                        <SystemDropdownSelect
                          isMulti
                          className={`${fieldState.invalid ? 'invalid' : ''}`}
                          module="Company"
                          type="Position"
                          placeholder="Select positions"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Allowed Websites Field */}
                <FormField
                  control={form.control}
                  name="allowed_websites"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Websites</FormLabel>
                      <FormControl>
                        <SystemDropdownSelect
                          isMulti
                          className={`${fieldState.invalid ? 'invalid' : ''}`}
                          module="Company"
                          type="Website"
                          placeholder="Select websites"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* File Path Field */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>File</FormLabel>
                      <FormControl>
                        <FileDropzone
                          isInvalid={fieldState.invalid}
                          files={field.value}
                          onDrop={(acceptedFiles, rejectedFiles) => {
                            const file = acceptedFiles[0];
                            if (!file) return;

                            // Set file field
                            field.onChange(file);

                            // If title is empty, set it to file name (without extension)
                            const currentTitle = form.getValues('title');
                            if (!currentTitle) {
                              const fileNameWithoutExtension =
                                file.name.replace(/\.[^/.]+$/, '');
                              form.setValue('title', fileNameWithoutExtension, {
                                shouldValidate: true,
                                shouldDirty: true,
                              });
                            }

                            handleRejectedFiles(rejectedFiles);
                          }}
                          onRemove={() => {
                            field.onChange(undefined);
                          }}
                        />
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
              <Button type="submit" disabled={isLoadingUpdate}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRagFileDialog;
