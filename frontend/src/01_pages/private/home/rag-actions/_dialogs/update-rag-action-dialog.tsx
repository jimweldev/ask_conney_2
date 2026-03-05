import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { RagActionField } from '@/04_types/rag/rag-action-field';
import useRagActionStore from '@/05_stores/rag/rag-action-store';
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

// Schema for dropdown options - updated to match the array of strings format
const DropdownOptionSchema = z.string().min(1, 'Option required');

// Schema for individual action fields
const ActionFieldSchema = z.object({
  id: z.number().optional(), // For existing fields
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

type UpdateRagActionDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

/* ===============================
   Component
================================ */

const UpdateRagActionDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateRagActionDialogProps) => {
  // Zustand store
  const { selectedRagAction } = useRagActionStore();

  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

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

  // Helper function to parse dropdown options with proper typing
  const parseDropdownOptions = (dropdownOptions: unknown): string[] => {
    if (!dropdownOptions) return [];

    // If it's already an array, check if it's a string array
    if (Array.isArray(dropdownOptions)) {
      return dropdownOptions.filter(
        (item): item is string => typeof item === 'string',
      );
    }

    // If it's a string, try to parse it
    if (typeof dropdownOptions === 'string') {
      try {
        const parsed = JSON.parse(dropdownOptions);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (item): item is string => typeof item === 'string',
          );
        }
      } catch (e) {
        console.error('Failed to parse dropdown options:', e);
      }
    }

    return [];
  };

  // Populate form with selected item's data
  useEffect(() => {
    if (selectedRagAction && open) {
      // Parse fields
      const parsedFields =
        selectedRagAction.fields?.map((field: RagActionField) => {
          // Parse dropdown options if they exist
          const dropdownOptions =
            field.type === 'dropdown'
              ? parseDropdownOptions(field.dropdown_options)
              : [];

          return {
            id: field.id,
            order: field.order || 0,
            name: field.name || '',
            type: (field.type === 'dropdown' ? 'dropdown' : 'string') as
              | 'string'
              | 'dropdown',
            default_value: field.default_value || '',
            dropdown_options: dropdownOptions,
            is_required: field.is_required || false,
          };
        }) || [];

      form.reset({
        name: selectedRagAction.name || '',
        description: selectedRagAction.description || '',
        endpoint: selectedRagAction.endpoint || '',
        notes: selectedRagAction.notes || '',
        fields: parsedFields,
      });
    }
  }, [selectedRagAction, open, form]);

  /* ===============================
     Submit
  ================================ */

  const onSubmit = (data: FormType) => {
    setIsLoadingUpdate(true);

    toast.promise(
      mainInstance.patch(`/rag/actions/${selectedRagAction?.id}`, data),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error =>
          error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingUpdate(false),
      },
    );
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
              <DialogTitle>Update Rag Action</DialogTitle>
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

              <Button type="submit" disabled={isLoadingUpdate}>
                Update
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateRagActionDialog;
