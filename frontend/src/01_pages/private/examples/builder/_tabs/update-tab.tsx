import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  docco,
  monokaiSublime,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import useThemeStore from '@/05_stores/_common/theme-store';
import { Button } from '@/components/ui/button';
import convertNaming from '@/lib/naming/naming-helper';
import { type FormData } from '../crud-builder-page';
import FilenameInputGroup from './_components/filename-input-group';

const UpdateTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;

  const { group, table, route, table_fields } = formValues;

  // Convert table name to PascalCase for model and camelCase for store variable
  const modelName = convertNaming(table, 'PascalSingular');
  const kebabTable = convertNaming(table, 'KebabSingular');

  const generateDialog = () => {
    // Filter out blank fields
    const validFields =
      table_fields?.filter(f => f.name && f.name.trim() !== '') || [];

    // Generate JSX for each FormField with readable label
    const formFields = validFields
      .map(
        field => `                {/* ${convertNaming(field.name!, 'Readable')} Field */}
                <FormField
                  control={form.control}
                  name="${field.name}"
                  render={({ field }) => (
                    <FormItem className="col-span-12">
                      <FormLabel>${convertNaming(field.name!, 'Readable')}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />`,
      )
      .join('\n');

    return `import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import use${modelName}Store from '@/05_stores${group ? `/${convertNaming(group, 'KebabSingular')}` : ''}/${kebabTable}-store';
import { mainInstance } from '@/07_instances/main-instance';
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

// Form validation schema
const FormSchema = z.object({
${validFields.map(f => `  ${f.name}: z.string().min(1, { message: 'Required' })`).join(',\n')}
});

// Props
type Update${modelName}DialogProps = {
  open: boolean;                 // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void;           // Function to refetch the table data after update
};

const Update${modelName}Dialog = ({ open, setOpen, refetch }: Update${modelName}DialogProps) => {
  // Zustand store
  const { selected${modelName} } = use${modelName}Store();

  // Initialize react-hook-form with Zod resolver
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
${validFields.map(f => `      ${f.name}: ''`).join(',\n')}
    },
  });

  // Populate form with selected item's data
  useEffect(() => {
    if (selected${modelName}) {
      form.reset({
${validFields.map(f => `        ${f.name}: selected${modelName}.${f.name} || ''`).join(',\n')}
      });
    }
  }, [selected${modelName}, form]);

  // Loading state for submit button
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);

  // Handle form submission
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingUpdate(true);

    toast.promise(
      mainInstance.patch(\`${route}/\${selected${modelName}?.id}\`, data),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error => error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingUpdate(false), // Reset loading state
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Update ${convertNaming(table, 'ReadableSingular')}</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
${formFields}
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoadingUpdate}>Submit</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default Update${modelName}Dialog;`;
  };

  const code = generateDialog();

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      {/* Filename display */}
      <FilenameInputGroup
        tableName={`_dialogs/update-${kebabTable}-dialog.tsx`}
      />

      {/* Code preview with copy button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon-xs"
          className="absolute top-2 right-2 z-10"
          onClick={onCopy}
        >
          {isCopied ? <Check /> : <Copy />}
        </Button>
        <SyntaxHighlighter
          language="typescript"
          style={theme === 'dark' ? monokaiSublime : docco}
          showLineNumbers
          wrapLines
          customStyle={{
            maxHeight: '600px',
            overflow: 'auto',
            borderRadius: '10px',
            fontSize: '14px',
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </>
  );
};

export default UpdateTab;
