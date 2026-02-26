import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import useSystemDropdownStore from '@/05_stores/system/system-dropdown-store';
import { mainInstance } from '@/07_instances/main-instance';
import SystemDropdownModuleSelect from '@/components/react-select/system-dropdown-module-select';
import SystemDropdownModuleTypeSelect from '@/components/react-select/system-dropdown-module-type-select';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import {
  createInputJsonSchema,
  createReactSelectSchema,
} from '@/lib/zod/zod-helpers';

// Zod schema to validate the form input
const FormSchema = z.object({
  system_dropdown_module: createReactSelectSchema(true),
  system_dropdown_module_type: createReactSelectSchema(true),
  label: z.string().min(1, {
    message: 'Required',
  }),
  properties: createInputJsonSchema(false),
});

// Component Props
type UpdateSystemDropdownDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const UpdateSystemDropdownDialog = ({
  open,
  setOpen,
  refetch,
}: UpdateSystemDropdownDialogProps) => {
  // Access store values
  const { selectedSystemDropdown } = useSystemDropdownStore();

  // Initialize form with Zod resolver and default values
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      system_dropdown_module: null,
      system_dropdown_module_type: null,
      label: '',
      properties: undefined,
    },
  });

  // Populate form with selected items's data
  useEffect(() => {
    if (selectedSystemDropdown) {
      form.reset({
        system_dropdown_module: selectedSystemDropdown
          ? {
              label: selectedSystemDropdown.module || '',
              value: selectedSystemDropdown.module || '',
            }
          : null,
        system_dropdown_module_type: selectedSystemDropdown
          ? {
              label: selectedSystemDropdown.type || '',
              value: selectedSystemDropdown.type || '',
            }
          : null,
        label: selectedSystemDropdown.label || '',
        properties: selectedSystemDropdown.properties
          ? JSON.stringify(selectedSystemDropdown.properties, null, 2)
          : undefined,
      });
    }
  }, [selectedSystemDropdown, form]);

  const selectedModule = form.watch('system_dropdown_module');

  // Track loading state for submit button
  const [isLoadingUpdateItem, setIsLoadingUpdateItem] =
    useState<boolean>(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdateItem(true);

    const newData = {
      ...data,
      module: data.system_dropdown_module.label,
      type: data.system_dropdown_module_type.label,
      properties: data.properties ? JSON.parse(data.properties) : null,
    };

    delete newData.system_dropdown_module;
    delete newData.system_dropdown_module_type;

    // Send PATCH request and show toast notifications
    toast.promise(
      mainInstance.patch(
        `/system/system-dropdowns/${selectedSystemDropdown?.id}`,
        newData,
      ),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error => {
          // Display error message from response or fallback
          return (
            error.response?.data?.message ||
            error.message ||
            'An error occurred'
          );
        },
        finally: () => {
          setIsLoadingUpdateItem(false); // Reset loading state
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            {/* Dialog header */}
            <DialogHeader>
              <DialogTitle>Update System Dropdown</DialogTitle>
            </DialogHeader>

            {/* Dialog body */}
            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Module field */}
                <FormField
                  control={form.control}
                  name="system_dropdown_module"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Module</FormLabel>
                      <FormControl>
                        <SystemDropdownModuleSelect
                          className={`${fieldState.invalid ? 'invalid' : ''}`}
                          placeholder="Select module"
                          value={field.value}
                          onChange={(value: ReactSelectOption) => {
                            field.onChange(value);
                            form.setValue('system_dropdown_module_type', null);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Type field */}
                <FormField
                  control={form.control}
                  name="system_dropdown_module_type"
                  render={({ field, fieldState }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <SystemDropdownModuleTypeSelect
                          className={`${fieldState.invalid ? 'invalid' : ''}`}
                          placeholder="Select type"
                          system_dropdown_module={selectedModule?.label}
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Label field */}
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Properties field */}
                <FormField
                  control={form.control}
                  name="properties"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <div className="mb-1 flex items-end justify-between">
                        <FormLabel className="mb-0">Properties</FormLabel>
                        <Button
                          type="button"
                          size="xs"
                          onClick={() => {
                            const defaultValue = {
                              type: '',
                              color: '',
                              isDisabled: false,
                            };

                            form.setValue(
                              'properties',
                              JSON.stringify(defaultValue, null, 2),
                              { shouldDirty: true, shouldTouch: true },
                            );
                          }}
                        >
                          Populate
                        </Button>
                      </div>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder={`{
  "type": "", // circle | triangle
  "color": "", // #000000
  "isDisabled": false
}`}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            {/* Dialog footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoadingUpdateItem}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateSystemDropdownDialog;
