import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import ReactSelect from 'react-select';
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

const CreateTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);
  const [submitType, setSubmitType] = useState<
    'submitAndClose' | 'submitAndKeepOpen'
  >('submitAndClose');

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;

  const { table, route, table_fields } = formValues;
  const modelName = convertNaming(table, 'PascalSingular');
  const kebabTable = convertNaming(table, 'KebabSingular');

  const generateDialog = () => {
    const validFields =
      table_fields?.filter(f => f.name && f.name.trim() !== '') || [];

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

    const isKeepOpen = submitType === 'submitAndKeepOpen';

    // FOOTER
    const footer = isKeepOpen
      ? `              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
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
                      <DropdownMenuItem onClick={() => form.handleSubmit(data => onSubmit(data, false))()}>
                        Submit & Close
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => form.handleSubmit(data => onSubmit(data, true))()}>
                        Submit & Keep Open
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ButtonGroup>`
      : `              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={isLoadingCreateItem}>Submit</Button>`;

    // onSubmit function
    const onSubmitFn = isKeepOpen
      ? `
  const onSubmit = (data: z.infer<typeof FormSchema>, keepOpen = false) => {
    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(\`${route}\`, data), {
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
  };`
      : `
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    setIsLoadingCreateItem(true);

    toast.promise(mainInstance.post(\`${route}\`, data), {
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
  };`;

    // IMPORTS: array + filter(Boolean) ensures no blank lines
    const importsArr = [
      `import { useState } from 'react';`,
      `import { zodResolver } from '@hookform/resolvers/zod';`,
      isKeepOpen ? `import { ChevronDownIcon } from 'lucide-react';` : null,
      `import { useForm } from 'react-hook-form';`,
      `import { toast } from 'sonner';`,
      `import { z } from 'zod';`,
      `import { mainInstance } from '@/07_instances/main-instance';`,
      `import { Button } from '@/components/ui/button';`,
      isKeepOpen
        ? `import { ButtonGroup, ButtonGroupSeparator } from '@/components/ui/button-group';`
        : null,
      `import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';`,
      isKeepOpen
        ? `import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';`
        : null,
      `import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';`,
      `import { Input } from '@/components/ui/input';`,
    ];

    const imports = importsArr.filter(Boolean).join('\n');

    return `${imports}

// Form validation schema
const FormSchema = z.object({
${validFields.map(f => `  ${f.name}: z.string().min(1, { message: 'Required' })`).join(',\n')}
});

// Props
type Create${modelName}DialogProps = {
  open: boolean;
  setOpen: (value: boolean) => void;
  refetch: () => void;
};

const Create${modelName}Dialog = ({ open, setOpen, refetch }: Create${modelName}DialogProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
${validFields.map(f => `      ${f.name}: ''`).join(',\n')}
    },
  });

  const [isLoadingCreateItem, setIsLoadingCreateItem] = useState(false);

  ${onSubmitFn}

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent autoFocus>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(d => onSubmit(d))} autoComplete="off">
            <DialogHeader>
              <DialogTitle>Create ${convertNaming(table, 'ReadableSingular')}</DialogTitle>
            </DialogHeader>

            <DialogBody>
              <div className="grid grid-cols-12 gap-3">
${formFields}
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2">
${footer}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default Create${modelName}Dialog;`;
  };

  const code = generateDialog();

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <FilenameInputGroup
        tableName={`_dialogs/create-${kebabTable}-dialog.tsx`}
      />

      <div className="relative z-50 mb-2 flex justify-end">
        <ReactSelect
          className="react-select-container-sm w-[250px]"
          classNamePrefix="react-select-sm"
          options={[
            { label: 'Submit & Close', value: 'submitAndClose' },
            { label: 'Submit & Keep Open', value: 'submitAndKeepOpen' },
          ]}
          value={{
            label:
              submitType === 'submitAndClose'
                ? 'Submit & Close'
                : 'Submit & Keep Open',
            value: submitType,
          }}
          onChange={option =>
            setSubmitType(
              option?.value as 'submitAndClose' | 'submitAndKeepOpen',
            )
          }
        />
      </div>

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

export default CreateTab;
