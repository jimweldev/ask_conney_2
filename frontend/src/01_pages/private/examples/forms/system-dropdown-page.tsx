import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodePreview from '@/components/code/code-preview';
import SystemDropdownSelect from '@/components/react-select/system-dropdown-select';
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
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

const FormSchemaSingle = z.object({
  color: createReactSelectSchema(),
});

const FormSchemaMultiple = z.object({
  colors: z.array(createReactSelectSchema()).min(1, {
    message: 'Required',
  }),
});

const SystemDropdownPage = () => {
  const formSingle = useForm<z.infer<typeof FormSchemaSingle>>({
    resolver: zodResolver(FormSchemaSingle),
    defaultValues: {
      color: undefined,
    },
  });

  const formMultiple = useForm<z.infer<typeof FormSchemaMultiple>>({
    resolver: zodResolver(FormSchemaMultiple),
    defaultValues: {
      colors: [],
    },
  });

  const onSubmitSingle = (_data: z.infer<typeof FormSchemaSingle>) => {
    toast.success('Success!');
  };

  const onSubmitMultiple = (_data: z.infer<typeof FormSchemaMultiple>) => {
    toast.success('Success!');
  };

  return (
    <div>
      <PageHeader className="mb-3">System Dropdown</PageHeader>

      <PageSubHeader>Single</PageSubHeader>
      <CodePreview
        className="mb-layout"
        code={codeStringSingle}
        lineNumbers={[
          19, 26, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
          56, 57, 58, 59, 60,
        ]}
      >
        <Form {...formSingle}>
          <form onSubmit={formSingle.handleSubmit(onSubmitSingle)}>
            <div className="grid grid-cols-12 gap-3">
              <FormField
                control={formSingle.control}
                name="color"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Color</FormLabel>
                    <FormControl>
                      <SystemDropdownSelect
                        className={`${fieldState.invalid ? 'invalid' : ''}`}
                        module="system"
                        type="color"
                        placeholder="Select color"
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

      <PageSubHeader>Multiple</PageSubHeader>
      <CodePreview
        code={codeStringMultiple}
        lineNumbers={[
          19, 20, 21, 28, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
          56, 57, 58, 59, 60, 61, 62, 63,
        ]}
      >
        <Form {...formMultiple}>
          <form onSubmit={formMultiple.handleSubmit(onSubmitMultiple)}>
            <div className="grid grid-cols-12 gap-3">
              <FormField
                control={formMultiple.control}
                name="colors"
                render={({ field, fieldState }) => (
                  <FormItem className="col-span-12">
                    <FormLabel>Colors</FormLabel>
                    <FormControl>
                      <SystemDropdownSelect
                        className={`${fieldState.invalid ? 'invalid' : ''}`}
                        module="system"
                        type="color"
                        placeholder="Select colors"
                        value={field.value}
                        onChange={field.onChange}
                        isMulti
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

export default SystemDropdownPage;

const codeStringSingle = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SystemDropdownSelect from '@/components/react-select/system-dropdown-select';
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
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

const FormSchema = z.object({
  color: createReactSelectSchema(),
});

const SystemDropdownPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      color: undefined,
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  return (
    <div>
      <PageHeader className="mb-3">System Dropdown</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-3">
            <FormField
              control={form.control}
              name="color"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <SystemDropdownSelect
                      className={\`\${fieldState.invalid ? 'invalid' : ''}\`}
                      module="system"
                      type="color"
                      placeholder="Select color"
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

export default SystemDropdownPage;
`.trim();

const codeStringMultiple = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import SystemDropdownSelect from '@/components/react-select/system-dropdown-select';
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
import { createReactSelectSchema } from '@/lib/zod/zod-helpers';

const FormSchema = z.object({
  colors: z.array(createReactSelectSchema()).min(1, {
    message: 'Required',
  }),
});

const SystemDropdownPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      colors: [],
    },
  });

  const onSubmit = (_data: z.infer<typeof FormSchema>) => {
    toast.success('Success!');
  };

  return (
    <div>
      <PageHeader className="mb-3">System Dropdown</PageHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-12 gap-3">
            <FormField
              control={form.control}
              name="colors"
              render={({ field, fieldState }) => (
                <FormItem className="col-span-12">
                  <FormLabel>Colors</FormLabel>
                  <FormControl>
                    <SystemDropdownSelect
                      isMulti
                      className={\`\${fieldState.invalid ? 'invalid' : ''}\`}
                      module="system"
                      type="colors"
                      placeholder="Select colors"
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

export default SystemDropdownPage;
`.trim();
