import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
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
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { cn } from '@/lib/utils';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

const FormSchema = z.object({
  frontend: createReactSelectSchema(false),
});

const ReactSelectPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      frontend: undefined,
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  const codeString = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import ReactSelect from 'react-select';
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
import { convertToSelectOptions } from '@/lib/react-select/convert-to-select-options';
import { cn } from '@/lib/utils';
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

const FormSchema = z.object({
  frontend: createReactSelectSchema(false),
});

const ReactSelectPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      frontend: undefined,
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  return (
    <div>
      <PageHeader className="mb-3">React Select</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-3">
            <FormField
              control={form.control}
              name="frontend"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Frontend</FormLabel>
                  <FormControl>
                    <ReactSelect
                      className={cn(
                        'react-select-container',
                        fieldState.invalid ? 'invalid' : '',
                      )}
                      classNamePrefix="react-select"
                      options={convertToSelectOptions([
                        'React JS',
                        'Angular',
                        'Vue JS',
                      ])}
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
    </div>
  );
};

export default ReactSelectPage;
  `.trim();

  return (
    <div>
      <PageHeader className="mb-3">React Select</PageHeader>

      <CodePreview
        className="mb-6"
        code={codeString}
        lineNumbers={[
          21, 28, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
          58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68,
        ]}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid grid-cols-12 gap-3">
              <FormField
                control={form.control}
                name="frontend"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Frontend</FormLabel>
                    <FormControl>
                      <ReactSelect
                        className={cn(
                          'react-select-container',
                          fieldState.invalid ? 'invalid' : '',
                        )}
                        classNamePrefix="react-select"
                        options={convertToSelectOptions([
                          'React JS',
                          'Angular',
                          'Vue JS',
                        ])}
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
    </div>
  );
};

export default ReactSelectPage;
