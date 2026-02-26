import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
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
  file: z.file({
    message: 'Required',
  }),
});

// Props
type CreateRagFileDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateRagFileDialog = ({
  open,
  setOpen,
  refetch,
}: CreateRagFileDialogProps) => {
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

  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

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
    formData.append('file', data.file);

    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/rag/files`, formData), {
      loading: 'Loading...',
      success: () => {
        form.reset();
        refetch();
        setOpen(false);
        return 'Success!';
      },
      error: error =>
        error.response?.data?.message || error.message || 'An error occurred',
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d))}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Create Rag File</DialogTitle>
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

export default CreateRagFileDialog;
