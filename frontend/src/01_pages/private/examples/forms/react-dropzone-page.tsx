import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodePreview from '@/components/code/code-preview';
import FileDropzone from '@/components/dropzone/file-dropzone';
import PageHeader from '@/components/typography/page-header';
import PageSubHeader from '@/components/typography/page-sub-header';
import { Button } from '@/components/ui/button';
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
import { createReactDropzoneSchema } from '@/lib/zod/zod-helpers';

const FormSchemaMultiple = z.object({
  files: z.array(createReactDropzoneSchema()).min(1, {
    message: 'Required',
  }),
});

const FormSchemaSingle = z.object({
  file: createReactDropzoneSchema(),
});

const ReactDropzonePage = () => {
  const formMultiple = useForm<z.infer<typeof FormSchemaMultiple>>({
    resolver: zodResolver(FormSchemaMultiple),
    defaultValues: {
      files: [],
    },
  });

  const formSingle = useForm<z.infer<typeof FormSchemaSingle>>({
    resolver: zodResolver(FormSchemaSingle),
    defaultValues: {
      file: undefined,
    },
  });

  const onSubmitMultiple = (_data: z.infer<typeof FormSchemaMultiple>) => {
    toast.success('Success!');
  };

  const onSubmitSingle = (_data: z.infer<typeof FormSchemaSingle>) => {
    toast.success('Success!');
  };

  return (
    <>
      <PageHeader className="mb-3">React Dropzone</PageHeader>

      <PageSubHeader>Single</PageSubHeader>
      <CodePreview
        className="mb-layout"
        code={codeStringSingle}
        lineNumbers={[
          20, 21, 22, 29, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
          57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67,
        ]}
      >
        <Form {...formSingle}>
          <form onSubmit={formSingle.handleSubmit(onSubmitSingle)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={formSingle.control}
                name="file"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Files</FormLabel>
                    <FormControl>
                      <FileDropzone
                        isInvalid={fieldState.invalid}
                        // setFiles={files => field.onChange(files[0])}
                        files={field.value}
                        onDrop={(acceptedFiles, rejectedFiles) => {
                          field.onChange(acceptedFiles[0]);
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

              <div className="col-span-12 flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </Form>
      </CodePreview>

      <PageSubHeader>Multiple</PageSubHeader>
      <CodePreview
        code={codeStringMultiple}
        lineNumbers={[
          20, 21, 22, 29, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
          57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73,
          74, 75,
        ]}
      >
        <Form {...formMultiple}>
          <form onSubmit={formMultiple.handleSubmit(onSubmitMultiple)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={formMultiple.control}
                name="files"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Files</FormLabel>
                    <FormControl>
                      <FileDropzone
                        isInvalid={fieldState.invalid}
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
                        isMultiple
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="col-span-12 flex justify-end">
                <Button type="submit">Submit</Button>
              </div>
            </div>
          </form>
        </Form>
      </CodePreview>
    </>
  );
};

export default ReactDropzonePage;

const codeStringMultiple = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import FileDropzone from '@/components/dropzone/file-dropzone';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
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

const FormSchema = z.object({
  files: z.array(z.file()).min(1, {
    message: 'Required',
  }),
});

const ReactDropzonePage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      files: [],
    },
  });

  function onSubmit(_data: z.infer<typeof FormSchema>) {
    toast.success('Success!');
  }

  return (
    <>
      <PageHeader className="mb-layout">React Dropzone</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-layout grid grid-cols-12">
            <FormField
              control={form.control}
              name="files"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <FileDropzone
                      isInvalid={fieldState.invalid}
                      // setFiles={field.onChange}
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
                      isMultiple
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="col-span-12 flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ReactDropzonePage;
`.trim();

const codeStringSingle = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import FileDropzone from '@/components/dropzone/file-dropzone';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
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

const FormSchema = z.object({
  file: z.file({
    message: 'Required',
  }),
});

const ReactDropzonePage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      file: undefined,
    },
  });

  function onSubmit(_data: z.infer<typeof FormSchema>) {
    toast.success('Success!');
  }

  return (
    <>
      <PageHeader className="mb-layout">React Dropzone</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-layout grid grid-cols-12">
            <FormField
              control={formSingle.control}
              name="file"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Files</FormLabel>
                  <FormControl>
                    <FileDropzone
                      isInvalid={fieldState.invalid}
                      // setFiles={files => field.onChange(files[0])}
                      files={field.value}
                      onDrop={(acceptedFiles, rejectedFiles) => {
                        field.onChange(acceptedFiles[0]);
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

            <div className="col-span-12 flex justify-end">
              <Button type="submit">Submit</Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default ReactDropzonePage;
`.trim();
