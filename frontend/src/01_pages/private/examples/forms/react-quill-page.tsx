import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodePreview from '@/components/code/code-preview';
import ReactQuillEditor from '@/components/editor/react-quill-editor';
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

const FormSchema = z.object({
  text: z.string().refine(val => val.trim() !== '<p><br></p>', {
    message: 'Required',
  }),
});

const FormSchemaSimple = z.object({
  text: z.string().refine(val => val.trim() !== '<p><br></p>', {
    message: 'Required',
  }),
});

const ReactQuillPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  const formSimple = useForm<z.infer<typeof FormSchemaSimple>>({
    resolver: zodResolver(FormSchemaSimple),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  const onSubmitSimple = (_data: z.infer<typeof FormSchemaSimple>) => {
    toast.success('Success!');
  };

  return (
    <>
      <PageHeader className="mb-3">Input</PageHeader>

      <PageSubHeader>Full</PageSubHeader>
      <CodePreview
        className="mb-layout"
        code={codeString}
        lineNumbers={[
          18, 19, 20, 27, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
          55, 56, 57, 58,
        ]}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={form.control}
                name="text"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <ReactQuillEditor
                        className={fieldState.invalid ? 'invalid' : ''}
                        value={field.value}
                        onChange={field.onChange}
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

      <PageSubHeader>Simple</PageSubHeader>
      <CodePreview
        className="mb-layout"
        code={codeStringSimple}
        lineNumbers={[
          18, 19, 20, 27, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
          55, 56, 57, 58, 59,
        ]}
      >
        <Form {...formSimple}>
          <form onSubmit={formSimple.handleSubmit(onSubmitSimple)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={formSimple.control}
                name="text"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <ReactQuillEditor
                        type="simple"
                        className={fieldState.invalid ? 'invalid' : ''}
                        value={field.value}
                        onChange={field.onChange}
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

export default ReactQuillPage;

const codeString = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ReactQuillEditor from '@/components/editor/react-quill-editor';
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

const FormSchema = z.object({
  text: z.string().refine(val => val.trim() !== '<p><br></p>', {
    message: 'Required',
  }),
});

const ReactQuillPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  function onSubmit(_data: z.infer<typeof FormSchema>) {
    toast.success('Success!');
  }

  return (
    <>
      <PageHeader className="mb-layout">Input</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-layout grid grid-cols-12">
            <FormField
              control={form.control}
              name="text"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <ReactQuillEditor
                      className={fieldState.invalid ? 'invalid' : ''}
                      value={field.value}
                      onChange={field.onChange}
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

export default ReactQuillPage;
`.trim();

const codeStringSimple = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import ReactQuillEditor from '@/components/editor/react-quill-editor';
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

const FormSchema = z.object({
  text: z.string().refine(val => val.trim() !== '<p><br></p>', {
    message: 'Required',
  }),
});

const ReactQuillPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  function onSubmit(_data: z.infer<typeof FormSchema>) {
    toast.success('Success!');
  }

  return (
    <>
      <PageHeader className="mb-layout">Input</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-layout grid grid-cols-12">
            <FormField
              control={form.control}
              name="text"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <ReactQuillEditor
                      type="simple"
                      className={fieldState.invalid ? 'invalid' : ''}
                      value={field.value}
                      onChange={field.onChange}
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

export default ReactQuillPage;
`.trim();
