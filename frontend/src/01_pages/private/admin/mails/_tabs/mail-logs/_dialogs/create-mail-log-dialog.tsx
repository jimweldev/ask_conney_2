import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import FileDropzone from '@/components/dropzone/file-dropzone';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { handleRejectedFiles } from '@/lib/react-dropzone/handle-rejected-files';
import { mergeUniqueFiles } from '@/lib/react-dropzone/merge-unique-files';
import { createInputJsonSchema } from '@/lib/zod/zod-helpers';

// Zod schema to validate the form input
const FormSchema = z.object({
  mail_template_id: z.string().min(1, { message: 'Required' }),
  user_id: z.string(),
  subject: z.string().min(1, { message: 'Required' }),
  recipient_email: z.email({ message: 'Invalid email address' }),
  cc: z.string().refine(
    data => {
      try {
        return data === '' || !!JSON.parse(data);
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON' },
  ),
  bcc: z.string().refine(
    data => {
      try {
        return data === '' || !!JSON.parse(data);
      } catch {
        return false;
      }
    },
    { message: 'Invalid JSON' },
  ),
  content_data: createInputJsonSchema(true),
  attachments: z.array(
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
type CreateMailLogDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateMailLogDialog = ({
  open,
  setOpen,
  refetch,
}: CreateMailLogDialogProps) => {
  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      mail_template_id: '',
      user_id: '',
      subject: '',
      recipient_email: '',
      cc: '',
      bcc: '',
      content_data: '',
      attachments: [],
    },
  });

  // Track loading state for submit button
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    const formData = new FormData();
    formData.append('mail_template_id', data.mail_template_id);
    formData.append('user_id', data.user_id);
    formData.append('subject', data.subject);
    formData.append('recipient_email', data.recipient_email);
    formData.append('cc', data.cc);
    formData.append('bcc', data.bcc);
    formData.append('content_data', data.content_data || '');

    data.attachments.forEach((file, index) => {
      formData.append(`attachments[${index}]`, file);
    });

    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/mails/logs`, formData), {
      loading: 'Loading...',
      success: () => {
        refetch();
        if (!keepOpen) {
          form.reset();
          setOpen(false);
        }
        return 'Success!';
      },
      error: error =>
        error.response?.data?.message || error.message || 'An error occurred',
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="5xl" autoFocus={true}>
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d, false))}
            autoComplete="off"
          >
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Create Mail Log</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="gap-layout grid grid-cols-12 items-start">
                <div className="gap-layout col-span-6 grid grid-cols-12">
                  {/* Mail template ID field */}
                  <FormField
                    control={form.control}
                    name="mail_template_id"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Mail Template ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* User ID field */}
                  <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>User ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Recipient email field */}
                  <FormField
                    control={form.control}
                    name="recipient_email"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Recipient Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cc field */}
                  <FormField
                    control={form.control}
                    name="cc"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Cc</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Bcc field */}
                  <FormField
                    control={form.control}
                    name="bcc"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Bcc</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="gap-layout col-span-6 grid grid-cols-12">
                  {/* Subject field */}
                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Content data field */}
                  <FormField
                    control={form.control}
                    name="content_data"
                    render={({ field }) => (
                      <FormItem className="col-span-12">
                        <FormLabel>Content Data</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder={`{\n  "name": "John Doe",\n  "avatar": "https://example.com/avatar.jpg"\n}`}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Attachments field */}
                  <FormField
                    control={form.control}
                    name="attachments"
                    render={({ field, fieldState }) => {
                      return (
                        <FormItem className="col-span-12">
                          <FormLabel>Attachments</FormLabel>
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
                                  field.value.filter(
                                    file => file !== fileToRemove,
                                  ),
                                );
                              }}
                              isMultiple
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                </div>
              </div>
            </DialogBody>

            {/* Dialog footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>

              <ButtonGroup>
                {/* Main submit */}
                <Button type="submit" disabled={isLoadingCreateItem}>
                  Submit
                </Button>

                {/* Dropdown actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isLoadingCreateItem}>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(data => onSubmit(data, false))()
                        }
                      >
                        Submit & Close
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(data => onSubmit(data, true))()
                        }
                      >
                        Submit & Keep Open
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateMailLogDialog;
