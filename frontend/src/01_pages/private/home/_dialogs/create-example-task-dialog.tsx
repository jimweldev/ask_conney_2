import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronDownIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from '@/components/ui/button-group';
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

// Form validation schema
const FormSchema = z.object({
  name: z.string().min(1, { message: 'Required' }),
  status: z.string().min(1, { message: 'Required' }),
});

// Props
type CreateExampleTaskDialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const CreateExampleTaskDialog = ({
  open,
  setOpen,
  refetch,
}: CreateExampleTaskDialogProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      status: '',
    },
  });

  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(`/examples/tasks`, data), {
      loading: 'Loading...',
      success: () => {
        refetch();
        if (!keepOpen) {
          form.reset();
          setOpen(false);
        }
        return 'Success!';
      },
      error: error =>
        error.response?.data?.message || error.message || 'An error occurred',
      finally: () => setIsLoadingCreateItem(false),
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(d => onSubmit(d))}
            autoComplete="off"
          >
            <DialogHeader>
              <DialogTitle>Create Example Task</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
                {/* Name Field */}
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
                {/* Status Field */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>Status</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <ButtonGroup>
                <Button type="submit" disabled={isLoadingCreateItem}>
                  Submit
                </Button>
                <ButtonGroupSeparator />
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
                          form.handleSubmit(data => onSubmit(data, false))()
                        }
                      >
                        Submit & Close
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          form.handleSubmit(data => onSubmit(data, true))()
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

export default CreateExampleTaskDialog;
