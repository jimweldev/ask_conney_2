import { createRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { FaTimes } from 'react-icons/fa';
import { FaPlus, FaTable } from 'react-icons/fa6';
import z from 'zod';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ApiTab from './_tabs/api-tab';
import ControllerTab from './_tabs/controller-tab';
import CreateTab from './_tabs/create-tab';
import DeleteTab from './_tabs/delete-tab';
import MigrationTab from './_tabs/migration-tab';
import ModelTab from './_tabs/model-tab';
import PageTab from './_tabs/page-tab';
import StoreTab from './_tabs/store-tab';
import TypeTab from './_tabs/type-tab';
import UpdateTab from './_tabs/update-tab';

const DATA_TYPES = [
  'string',
  'integer',
  'boolean',
  'text',
  'decimal',
  'date',
  'datetime',
  'timestamp',
  'json',
  'foreignId',
];

// Zod schema
const FormSchema = z.object({
  group: z.string().min(1, { message: 'Required' }),
  table: z.string().min(1, { message: 'Required' }),
  route: z.string().min(1, { message: 'Required' }),
  soft_delete: z.boolean().optional(),
  table_fields: z
    .array(
      z.object({
        name: z.string().min(1, { message: 'Field name is required' }),
        type: z.string().min(1, { message: 'Field type is required' }),
      }),
    )
    .min(1, { message: 'At least one field is required' }),
});

export type FormData = z.infer<typeof FormSchema>;

const CrudBuilderPage = () => {
  const form = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      group: '',
      table: '',
      route: '',
      soft_delete: false,
      table_fields: [{ name: '', type: 'string' }],
    },
  });

  // UseFieldArray for table_fields
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'table_fields',
  });

  return (
    <div>
      <PageHeader className="mb-3">CRUD Builder</PageHeader>

      <FormProvider {...form}>
        <div className="gap-layout flex flex-col md:flex-row md:items-start">
          <div className="shrink-0 basis-[350px] md:shrink">
            <Card>
              <CardBody>
                <CardTitle className="mb-2">Table Details</CardTitle>

                <Form {...form}>
                  <div className="grid grid-cols-12 gap-3">
                    {/* Group */}
                    <FormField
                      control={form.control}
                      name="group"
                      render={({ field }) => (
                        <FormItem className="col-span-12">
                          <FormLabel>Group</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="example" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Table */}
                    <FormField
                      control={form.control}
                      name="table"
                      render={({ field }) => (
                        <FormItem className="col-span-12">
                          <FormLabel>Table</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="example_tasks" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Route */}
                    <FormField
                      control={form.control}
                      name="route"
                      render={({ field }) => (
                        <FormItem className="col-span-12">
                          <FormLabel>Route</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="/example/tasks" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Soft Delete */}
                    <FormField
                      control={form.control}
                      name="soft_delete"
                      render={({ field }) => (
                        <FormItem className="col-span-12 flex items-center justify-between gap-2">
                          <FormLabel className="mb-0 cursor-pointer">
                            Enable Soft Deletes
                          </FormLabel>

                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Table Fields */}
                    <div className="p-layout col-span-12 rounded-md border">
                      <div className="mb-2 text-sm font-medium">
                        Table Fields
                      </div>

                      <div className="space-y-2">
                        {fields.map((field, index) => {
                          // Create a ref for each input
                          const inputRef = createRef<HTMLInputElement>();

                          return (
                            <div
                              key={field.id}
                              className="flex items-center space-x-2"
                            >
                              {/* Field Name */}
                              <FormField
                                control={form.control}
                                name={`table_fields.${index}.name`}
                                render={({ field }) => (
                                  <FormItem className="flex-1">
                                    <FormControl>
                                      <Input
                                        {...field}
                                        placeholder="Field name"
                                        inputSize="sm"
                                        ref={inputRef}
                                        onKeyDown={e => {
                                          if (e.key === 'Enter') {
                                            e.preventDefault();
                                            append({
                                              name: '',
                                              type: 'string',
                                            }); // append new field
                                            setTimeout(() => {
                                              const lastInput =
                                                document.querySelector<HTMLInputElement>(
                                                  `input[name="table_fields.${fields.length}.name"]`,
                                                );
                                              lastInput?.focus(); // focus newly added input
                                            }, 0);
                                          }
                                        }}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Field Type */}
                              <FormField
                                control={form.control}
                                name={`table_fields.${index}.type`}
                                render={({ field }) => (
                                  <FormItem className="w-[120px]">
                                    <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                    >
                                      <FormControl>
                                        <SelectTrigger size="sm">
                                          <SelectValue placeholder="Data type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {DATA_TYPES.map(dt => (
                                          <SelectItem key={dt} value={dt}>
                                            {dt}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {/* Remove Button */}
                              <Button
                                variant="outline"
                                size="icon-sm"
                                type="button"
                                onClick={() => remove(index)}
                              >
                                <FaTimes />
                              </Button>
                            </div>
                          );
                        })}

                        {/* Add Field Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 w-full"
                          type="button"
                          onClick={() => append({ name: '', type: 'string' })}
                        >
                          <FaPlus /> Add Field
                        </Button>
                      </div>
                    </div>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </div>

          <Card className="min-w-0 flex-1">
            {
              // If no table is selected
              !form.watch().table ? (
                <div className="text-muted-foreground p-layout flex flex-col items-center justify-center">
                  <div className="p-layout">
                    <FaTable className="size-12" />
                  </div>
                  <p className="text-center text-sm">Table name is required</p>
                </div>
              ) : (
                <Tabs defaultValue="migration">
                  <TabsList variant="outline">
                    <TabsTrigger value="migration">Migration</TabsTrigger>
                    <TabsTrigger value="model">Model</TabsTrigger>
                    <TabsTrigger value="controller">Controller</TabsTrigger>
                    <TabsTrigger value="api">Api</TabsTrigger>
                    <TabsTrigger value="type">Type</TabsTrigger>
                    <TabsTrigger value="store">Store</TabsTrigger>
                    <TabsTrigger value="page">Page</TabsTrigger>
                    <TabsTrigger value="create">Create</TabsTrigger>
                    <TabsTrigger value="update">Update</TabsTrigger>
                    <TabsTrigger value="delete">Delete</TabsTrigger>
                  </TabsList>
                  <CardBody>
                    <TabsContent value="migration">
                      <MigrationTab />
                    </TabsContent>
                    <TabsContent value="model">
                      <ModelTab />
                    </TabsContent>
                    <TabsContent value="controller">
                      <ControllerTab />
                    </TabsContent>
                    <TabsContent value="api">
                      <ApiTab />
                    </TabsContent>
                    <TabsContent value="type">
                      <TypeTab />
                    </TabsContent>
                    <TabsContent value="store">
                      <StoreTab />
                    </TabsContent>
                    <TabsContent value="page">
                      <PageTab />
                    </TabsContent>
                    <TabsContent value="create">
                      <CreateTab />
                    </TabsContent>
                    <TabsContent value="update">
                      <UpdateTab />
                    </TabsContent>
                    <TabsContent value="delete">
                      <DeleteTab />
                    </TabsContent>
                  </CardBody>
                </Tabs>
              )
            }
          </Card>
        </div>
      </FormProvider>
    </div>
  );
};

export default CrudBuilderPage;
