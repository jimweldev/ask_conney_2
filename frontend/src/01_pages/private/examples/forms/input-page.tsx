import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodePreview from '@/components/code/code-preview';
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
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  text: z.string().min(1, {
    message: 'Required',
  }),
});

const InputPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  return (
    <>
      <PageHeader className="mb-3">Input</PageHeader>

      <CodePreview
        code={codeString}
        lineNumbers={[
          18, 19, 20, 27, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
        ]}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Text</FormLabel>
                    <FormControl>
                      <Input {...field} />
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

export default InputPage;

const codeString = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  text: z.string().min(1, {
    message: 'Required',
  }),
});

const InputPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      text: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
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
              render={({ field }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Text</FormLabel>
                  <FormControl>
                    <Input {...field} />
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

export default InputPage;
`.trim();
