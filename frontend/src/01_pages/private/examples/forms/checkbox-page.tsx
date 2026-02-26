import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import CodePreview from '@/components/code/code-preview';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const FormSchema = z.object({
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Required',
  }),
});

const CheckboxPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
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
          72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88,
          89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104,
          105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118,
          119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131,
        ]}
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="gap-layout grid grid-cols-12">
              <FormField
                control={form.control}
                name="items"
                render={() => (
                  <FormItem className="col-span-12">
                    <FormLabel>Frontend</FormLabel>
                    <div className="flex flex-col gap-1">
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes('react')}
                                  onCheckedChange={checked => {
                                    const item = 'react';
                                    if (checked) {
                                      field.onChange([...field.value, item]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          value => value !== item,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="mb-0 text-sm font-normal">
                                React JS
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes('angular')}
                                  onCheckedChange={checked => {
                                    const item = 'angular';
                                    if (checked) {
                                      field.onChange([...field.value, item]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          value => value !== item,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="mb-0 text-sm font-normal">
                                Angular
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => {
                          return (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value.includes('vue')}
                                  onCheckedChange={checked => {
                                    const item = 'vue';
                                    if (checked) {
                                      field.onChange([...field.value, item]);
                                    } else {
                                      field.onChange(
                                        field.value.filter(
                                          value => value !== item,
                                        ),
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="mb-0 text-sm font-normal">
                                Vue JS
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    </div>
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

export default CheckboxPage;

const codeString = `
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const FormSchema = z.object({
  items: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Required',
  }),
});

const CheckboxPage = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      items: [],
    },
  });

  function onSubmit(_data: z.infer<typeof FormSchema>) {
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
              name="items"
              render={() => (
                <FormItem className="col-span-12">
                  <FormLabel>Frontend</FormLabel>
                  <div className="flex flex-col gap-1">
                    <FormField
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes('react')}
                                onCheckedChange={checked => {
                                  const item = 'react';
                                  if (checked) {
                                    field.onChange([...field.value, item]);
                                  } else {
                                    field.onChange(field.value.filter(value => value !== item));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="mb-0 text-sm font-normal">
                              React JS
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes('angular')}
                                onCheckedChange={checked => {
                                  const item = 'angular';
                                  if (checked) {
                                    field.onChange([...field.value, item]);
                                  } else {
                                    field.onChange(field.value.filter(value => value !== item));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="mb-0 text-sm font-normal">
                              Angular
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem className="flex items-center gap-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value.includes('vue')}
                                onCheckedChange={checked => {
                                  const item = 'vue';
                                  if (checked) {
                                    field.onChange([...field.value, item]);
                                  } else {
                                    field.onChange(field.value.filter(value => value !== item));
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="mb-0 text-sm font-normal">
                              Vue JS
                            </FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  </div>
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

export default CheckboxPage;
`.trim();
