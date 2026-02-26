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

const DeleteTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;

  const { group, table, route } = formValues;

  // Convert table name to PascalCase for model and camelCase for store variable
  const modelName = convertNaming(table, 'PascalSingular');
  const kebabTable = convertNaming(table, 'KebabSingular');

  const generateDialog = () => {
    return `import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { toast } from 'sonner';
import use${modelName}Store from '@/05_stores${group ? `/${convertNaming(group, 'KebabSingular')}` : ''}/${kebabTable}-store';
import { mainInstance } from '@/07_instances/main-instance';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

// Props
type Delete${modelName}DialogProps = {
  open: boolean;                 // Dialog open state
  setOpen: (value: boolean) => void; // Function to open/close dialog
  refetch: () => void;           // Function to refetch the table data after deletion
};

const Delete${modelName}Dialog = ({ open, setOpen, refetch }: Delete${modelName}DialogProps) => {
  // Zustand store
  const { selected${modelName} } = use${modelName}Store();

  // Loading state for delete button
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);

  // Handle form submission
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoadingDelete(true);

    toast.promise(
      mainInstance.delete(\`${route}/\${selected${modelName}?.id}\`),
      {
        loading: 'Loading...',
        success: () => {
          refetch();
          setOpen(false);
          return 'Success!';
        },
        error: error => error.response?.data?.message || error.message || 'An error occurred',
        finally: () => setIsLoadingDelete(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogBody>
            {/* Warning icon */}
            <CircleAlert className="text-destructive mx-auto mb-4" size={64} />

            {/* Modal title */}
            <h3 className="text-center text-xl">Delete ${convertNaming(table, 'ReadableSingular')}</h3>
            <p className="text-muted-foreground mb-2 text-center">
              Are you sure you want to delete this record?
            </p>

            {/* Display item name */}
            <h2 className="text-center text-2xl font-semibold">
              {selected${modelName}?.name}
            </h2>
          </DialogBody>

          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              type="submit"
              disabled={isLoadingDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Delete${modelName}Dialog;`;
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
        tableName={`_dialogs/delete-${kebabTable}-dialog.tsx`}
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

export default DeleteTab;
