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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const FormSchema = z.object({
  item: z.string().min(1, {
    message: 'Required',
  }),
});

const RadioGroupPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      item: '',
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  return (
    <>
      <PageHeader className="mb-3">Checkbox</PageHeader>

      <CodePreview
        code={codeString}
        lineNumbers={[
          18, 19, 20, 27, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54,
          55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
          72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
        ]}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={form.control}
                name="item"
                render={({ field }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Frontend</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex flex-col gap-1"
                      >
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="react" />
                          </FormControl>
                          <FormLabel className="mb-0 text-sm font-normal">
                            React JS
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="angular" />
                          </FormControl>
                          <FormLabel className="mb-0 text-sm font-normal">
                            Angular
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center gap-2">
                          <FormControl>
                            <RadioGroupItem value="vue" />
                          </FormControl>
                          <FormLabel className="mb-0 text-sm font-normal">
                            Vue JS
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
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

export default RadioGroupPage;

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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const FormSchema = z.object({
  item: z.string().min(1, {
    message: 'Required',
  }),
});

const RadioGroupPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      item: '',
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    toast.success('Success!');
  }

  return (
    <>
      <PageHeader className="mb-layout">Checkbox</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gap-layout grid grid-cols-12">
            <FormField
              control={form.control}
              name="item"
              render={({ field }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Frontend</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-1"
                    >
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <RadioGroupItem value="react" />
                        </FormControl>
                        <FormLabel className="mb-0 text-sm font-normal">
                          React JS
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <RadioGroupItem value="angular" />
                        </FormControl>
                        <FormLabel className="mb-0 text-sm font-normal">
                          Angular
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <RadioGroupItem value="vue" />
                        </FormControl>
                        <FormLabel className="mb-0 text-sm font-normal">
                          Vue JS
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
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

export default RadioGroupPage;
`.trim();
