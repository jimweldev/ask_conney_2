import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import type { ReactSelectOption } from '@/04_types/_common/react-select-option';
import { mainInstance } from '@/07_instances/main-instance';
import SystemDropdownModuleSelect from '@/components/react-select/system-dropdown-module-select';
import SystemDropdownModuleTypeSelect from '@/components/react-select/system-dropdown-module-type-select';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

const FormSchema = z.object({
  system_dropdown_module: createReactSelectSchema(true),
  system_dropdown_module_type: createReactSelectSchema(true),
  label: z.string().min(1, { message: 'Required' }),
  properties: createInputJsonSchema(false),
});

type CreateSystemDropdownDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateSystemDropdownDialog = ({
  open,
  setOpen,
  refetch,
}: CreateSystemDropdownDialogProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      system_dropdown_module: null,
      system_dropdown_module_type: null,
      label: '',
      properties: '',
    },
  });

  const selectedModule = form.watch('system_dropdown_module');
  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    setIsLoadingCreateItem(true);

    const newData = {
      ...data,
      module: data.system_dropdown_module.label,
      type: data.system_dropdown_module_type.label,
      properties: data.properties ? JSON.parse(data.properties) : null,
    };

    delete newData.system_dropdown_module;
    delete newData.system_dropdown_module_type;

    toast.promise(mainInstance.post(`/system/system-dropdowns`, newData), {
      loading: 'Loading...',
      success: () => {
        refetch();
        if (!keepOpen) {
          form.reset();
          setOpen(false);
        }
        return 'Success!';
      },
      error: error => {
        return (
          error.response?.data?.message || error.message || 'An error occurred'
        );
      },
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d, false))}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Create System Dropdown</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
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

            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>

              <ButtonGroup>
                {/* Main submit */}
                <Button type="submit" disabled={isLoadingCreateItem}>
                  Submit
                </Button>

                {/* Dropdown actions */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button disabled={isLoadingCreateItem}>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(d => onSubmit(d, false))()
                        }
                      >
                        Submit & Close
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(d => onSubmit(d, true))()
                        }
                      >
                        Submit & Keep Open
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSystemDropdownDialog;
