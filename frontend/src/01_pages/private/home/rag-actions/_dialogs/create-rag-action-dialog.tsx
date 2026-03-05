import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

/* ===============================
   Schema
================================ */

// Schema for dropdown options - simple string array
const DropdownOptionSchema = z.string().min(1, 'Option required');

// Schema for individual action fields
const ActionFieldSchema = z.object({
  order: z.number(),
  name: z.string().min(1, 'Field name required'),
  type: z.enum(['string', 'dropdown']),
  default_value: z.string().optional(),
  dropdown_options: z.array(DropdownOptionSchema).optional(),
  is_required: z.boolean(),
});

const FormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  description: z.string().optional(),
  endpoint: z.string().optional(),
  notes: z.string().optional(),
  fields: z.array(ActionFieldSchema),
});

type FormType = z.infer<typeof FormSchema>;

/* ===============================
   Props
================================ */

type CreateRagActionDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

/* ===============================
   Component
================================ */

const CreateRagActionDialog = ({
  open,
  setOpen,
  refetch,
}: CreateRagActionDialogProps) => {
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  const form = useForm<FormType>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      description: '',
      endpoint: '',
      notes: '',
      fields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  /* ===============================
     Submit
  ================================ */

  const onSubmit = (data: FormType) => {
    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/rag/actions`, data), {
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

  /* ===============================
     Render
  ================================ */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="xl" autoFocus>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Create Rag Action</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Endpoint */}
                <FormField
                  control={form.control}
                  name="endpoint"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Endpoint</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Fields */}
                <div className="col-span-12">
                  <FormLabel>Fields</FormLabel>

                  {fields.map((item, index) => (
                    <div key={item.id} className="mb-4 rounded-lg border p-4">
                      <div className="mb-2 flex justify-end">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          Remove Field
                        </Button>
                      </div>

                      <div className="grid grid-cols-12 gap-3">
                        {/* Field Name */}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="col-span-6">
                              <FormLabel>Field Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Field Type */}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.type`}
                          render={({ field }) => (
                            <FormItem className="col-span-6">
                              <FormLabel>Type</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="string">String</SelectItem>
                                  <SelectItem value="dropdown">
                                    Dropdown
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Default Value */}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.default_value`}
                          render={({ field }) => (
                            <FormItem className="col-span-6">
                              <FormLabel>Default Value</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Is Required */}
                        <FormField
                          control={form.control}
                          name={`fields.${index}.is_required`}
                          render={({ field }) => (
                            <FormItem className="col-span-6 flex flex-row items-center gap-2 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="!mt-0 font-normal">
                                Is Required
                              </FormLabel>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Dropdown Options */}
                        {form.watch(`fields.${index}.type`) === 'dropdown' && (
                          <div className="col-span-12">
                            <FormLabel>Dropdown Options</FormLabel>

                            {(
                              form.watch(`fields.${index}.dropdown_options`) ||
                              []
                            ).map((_, optIndex) => (
                              <div
                                key={optIndex}
                                className="mb-2 flex items-center gap-2"
                              >
                                <Input
                                  placeholder={`Option ${optIndex + 1}`}
                                  {...form.register(
                                    `fields.${index}.dropdown_options.${optIndex}`,
                                  )}
                                  className="flex-1"
                                  inputSize="sm"
                                />

                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => {
                                    const currentOptions =
                                      form.getValues(
                                        `fields.${index}.dropdown_options`,
                                      ) || [];
                                    const newOptions = currentOptions.filter(
                                      (_, i) => i !== optIndex,
                                    );
                                    form.setValue(
                                      `fields.${index}.dropdown_options`,
                                      newOptions,
                                    );
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            ))}

                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const currentOptions =
                                  form.getValues(
                                    `fields.${index}.dropdown_options`,
                                  ) || [];
                                form.setValue(
                                  `fields.${index}.dropdown_options`,
                                  [...currentOptions, ''],
                                );
                              }}
                            >
                              Add Option
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button
                    className="w-full border-dashed"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: '',
                        type: 'string',
                        order: fields.length,
                        is_required: false,
                      })
                    }
                  >
                    Add Field
                  </Button>

                  <FormMessage />
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
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

export default CreateRagActionDialog;
