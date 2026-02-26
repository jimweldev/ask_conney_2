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
import { type FormData } from '../crud-builder-page';
import FilenameInputGroup from './_components/filename-input-group';

const MigrationTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;
  const { table, table_fields, soft_delete } = formValues;

  const generateMigration = () => {
    let template = `Schema::create('${table}', function (Blueprint $table) {\n`;
    template += `    $table->id();\n`;

    if (table_fields && table_fields.length > 0) {
      table_fields
        .filter(
          (field): field is { name: string; type: string } =>
            !!field.name && !!field.type,
        )
        .forEach(field => {
          switch (field.type) {
            case 'string':
              template += `    $table->string('${field.name}')`;
              break;
            case 'integer':
              template += `    $table->integer('${field.name}')`;
              break;
            case 'decimal':
              template += `    $table->decimal('${field.name}', 8, 2)`;
              break;
            case 'boolean':
              template += `    $table->boolean('${field.name}')`;
              break;
            case 'text':
              template += `    $table->text('${field.name}')`;
              break;
            case 'foreignId': {
              const referencedTable = field.name.replace(/_id$/, '') + 's';
              template += `    $table->foreignId('${field.name}')->constrained('${referencedTable}')->onDelete('cascade')`;
              break;
            }
            case 'date':
              template += `    $table->date('${field.name}')`;
              break;
            case 'datetime':
              template += `    $table->datetime('${field.name}')`;
              break;
            case 'timestamp':
              template += `    $table->timestamp('${field.name}')`;
              break;
            case 'json':
              template += `    $table->json('${field.name}')`;
              break;
            default:
              template += `    $table->string('${field.name}')`;
          }
          template += ';\n';
        });
    }

    if (soft_delete) {
      template += `    $table->softDeletes();\n`;
    }

    template += `    $table->timestamp('created_at')->useCurrent();\n`;
    template += `    $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();\n`;
    template += `});`;

    return template;
  };

  const code = generateMigration();

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <FilenameInputGroup
        tableName={`php artisan make:migration create_${formValues.table}_table`}
      />

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
          language="php"
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

export default MigrationTab;
