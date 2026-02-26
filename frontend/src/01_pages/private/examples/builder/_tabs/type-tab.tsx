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

type TableField = {
  name?: string;
  type?: string;
};

const TypeTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;

  const { group, table, table_fields, soft_delete } = formValues;
  const modelName = convertNaming(table, 'PascalSingular');

  const mapTsType = (type: string): string => {
    switch (type) {
      case 'integer':
      case 'decimal':
      case 'foreignId':
        return 'number';
      case 'boolean':
        return 'boolean';
      default:
        return 'string';
    }
  };

  const isValidField = (
    field: TableField,
  ): field is { name: string; type: string } => {
    return typeof field.name === 'string' && typeof field.type === 'string';
  };

  const generateMigration = () => {
    let template = '';
    const validFields = table_fields?.filter(isValidField) ?? [];

    const relationFields: string[] = [];
    const normalFields: string[] = [];

    // ---------- IMPORTS ----------
    validFields.forEach(field => {
      if (field.type === 'foreignId') {
        const related = field.name.replace(/_id$/, '');
        const relatedType = convertNaming(related, 'PascalSingular');

        template += `import { type ${relatedType} } from './${convertNaming(
          related,
          'KebabSingular',
        )}';\n`;
      }
    });

    if (template) template += '\n';

    // ---------- FIELD COLLECTION ----------
    validFields.forEach(field => {
      if (field.type === 'foreignId') {
        const related = field.name.replace(/_id$/, '');
        const relatedType = convertNaming(related, 'PascalSingular');

        normalFields.push(`  ${field.name}?: number;`);
        relationFields.push(`  ${related}?: ${relatedType};`);
      } else {
        normalFields.push(`  ${field.name}?: ${mapTsType(field.type)};`);
      }
    });

    // ---------- FINAL STRUCTURE ----------
    template += `export type ${modelName} = {\n`;
    template += `  id?: number;\n`;

    // normal scalar fields first
    template += normalFields.join('\n') + '\n';

    // relations always before timestamps
    if (relationFields.length) {
      template += relationFields.join('\n') + '\n';
    }

    if (soft_delete) {
      template += `  deleted_at?: string;\n`;
    }

    template += `  created_at?: string;\n`;
    template += `  updated_at?: string;\n`;
    template += `};\n`;

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
        tableName={`${group ? `${convertNaming(group, 'KebabSingular')}/` : ''}${convertNaming(table, 'KebabSingular')}.ts`}
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

export default TypeTab;
