import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import InputGroup from '@/components/input-group/input-group';
import InputGroupText from '@/components/input-group/input-group-text';
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

/* ===============================
   Schema
================================ */

const FormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  type: z.string().min(1, { message: 'Required' }),
  target_table: z.string().min(1, { message: 'Required' }),
  description: z.string().min(1, { message: 'Required' }),
  default_values: z.array(
    z.object({
      key: z.string().min(1, 'Key required'),
      value: z.string().min(1, 'Value required'),
    }),
  ),
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
      type: '',
      target_table: '',
      description: '',
      default_values: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'default_values',
  });

  /* ===============================
     Submit
  ================================ */

  const onSubmit = (data: FormType) => {
    // Convert array → JSON object
    const formattedDefaultValues = Object.fromEntries(
      data.default_values.map(item => [item.key, item.value]),
    );

    const payload = {
      ...data,
      default_values: formattedDefaultValues,
    };

    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/rag/actions`, payload), {
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
      <DialogContent autoFocus>
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

                {/* Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Type</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Target Table */}
                <FormField
                  control={form.control}
                  name="target_table"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Target Table</FormLabel>
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

                {/* Default Values */}
                <div className="col-span-12">
                  <FormLabel>Default Values</FormLabel>

                  {fields.map((item, index) => (
                    <div key={item.id} className="mb-2 flex items-center gap-2">
                      <InputGroup>
                        <Input
                          placeholder="Key"
                          {...form.register(`default_values.${index}.key`)}
                        />
                        <InputGroupText>=</InputGroupText>
                        <Input
                          placeholder="Value"
                          {...form.register(`default_values.${index}.value`)}
                        />
                      </InputGroup>

                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}

                  <Button
                    className="col-span-12"
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => append({ key: '', value: '' })}
                  >
                    Add Default Value
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
