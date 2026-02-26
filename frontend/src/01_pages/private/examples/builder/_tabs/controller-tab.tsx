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

const ControllerTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;
  const { table, group } = formValues;

  const generateMigration = () => {
    const className = `${convertNaming(table, 'PascalSingular')}Controller`;
    const modelName = convertNaming(table, 'PascalSingular');

    let template = `<?php\n\n`;

    template += `namespace App\\Http\\Controllers${group ? `\\${convertNaming(group, 'PascalSingular')}` : ''};\n\n`;
    template += `use App\\Http\\Controllers\\Controller;\n`;
    template += `use Illuminate\\Http\\Request;\n`;
    template += `use App\\Helpers\\QueryHelper;\n`;
    template += `use App\\Helpers\\DynamicLogger;\n`;
    template += `use App\\Models${group ? `\\${convertNaming(group, 'PascalSingular')}` : ''}\\${modelName};\n\n`;

    template += `class ${className} extends Controller {\n`;
    template += `    private $logger;\n\n`;
    template += `    public function __construct() {\n`;
    template += `        $this->logger = DynamicLogger::create('laravel.log', 'local');\n`;
    template += `    }\n\n`;

    template += `    /**\n`;
    template += `     * Display a paginated list of records with optional filtering and search.\n`;
    template += `     */\n`;
    template += `    public function index(Request $request) {\n`;
    template += `        $queryParams = $request->all();\n\n`;
    template += `        try {\n`;
    template += `            $query = ${modelName}::query();\n`;
    template += `            $type = 'paginate';\n`;
    template += `            QueryHelper::apply($query, $queryParams, $type);\n\n`;
    template += `            if ($request->has('search')) {\n`;
    template += `                $search = $request->input('search');\n`;
    template += `                $query->where(function ($query) use ($search) {\n`;
    template += `                    $query->where('id', 'LIKE', '%'.$search.'%');\n`;
    template += `                });\n`;
    template += `            }\n\n`;
    template += `            $totalRecords = $query->count();\n`;
    template += `            $limit = $request->input('limit', 10);\n`;
    template += `            $page = $request->input('page', 1);\n`;
    template += `            QueryHelper::applyLimitAndOffset($query, $limit, $page);\n\n`;
    template += `            $records = $query->get();\n\n`;
    template += `            return response()->json([\n`;
    template += `                'records' => $records,\n`;
    template += `                'meta' => [\n`;
    template += `                    'total_records' => $totalRecords,\n`;
    template += `                    'total_pages' => ceil($totalRecords / $limit),\n`;
    template += `                ],\n`;
    template += `            ], 200);\n`;
    template += `        } catch (\\Exception $e) {\n`;
    template += `            return response()->json([\n`;
    template += `                'message' => 'An error occurred',\n`;
    template += `                'error' => $e->getMessage(),\n`;
    template += `            ], 400);\n`;
    template += `        }\n`;
    template += `    }\n\n`;

    template += `    /**\n`;
    template += `     * Display the specified record.\n`;
    template += `     */\n`;
    template += `    public function show($id) {\n`;
    template += `        $record = ${modelName}::where('id', $id)->first();\n\n`;
    template += `        if (!$record) {\n`;
    template += `            return response()->json([\n`;
    template += `                'message' => 'Record not found.',\n`;
    template += `            ], 404);\n`;
    template += `        }\n\n`;
    template += `        return response()->json($record, 200);\n`;
    template += `    }\n\n`;

    template += `    /**\n`;
    template += `     * Store a newly created record in storage.\n`;
    template += `     */\n`;
    template += `    public function store(Request $request) {\n`;
    template += `        try {\n`;
    template += `            $record = ${modelName}::create($request->all());\n`;
    template += `            return response()->json($record, 201);\n`;
    template += `        } catch (\\Exception $e) {\n`;
    template += `            return response()->json([\n`;
    template += `                'message' => 'An error occurred',\n`;
    template += `                'error' => $e->getMessage(),\n`;
    template += `            ], 400);\n`;
    template += `        }\n`;
    template += `    }\n\n`;

    template += `    /**\n`;
    template += `     * Update the specified record in storage.\n`;
    template += `     */\n`;
    template += `    public function update(Request $request, $id) {\n`;
    template += `        try {\n`;
    template += `            $record = ${modelName}::find($id);\n\n`;
    template += `            if (!$record) {\n`;
    template += `                return response()->json([\n`;
    template += `                    'message' => 'Record not found.',\n`;
    template += `                ], 404);\n`;
    template += `            }\n\n`;
    template += `            $record->update($request->all());\n`;
    template += `            return response()->json($record, 200);\n`;
    template += `        } catch (\\Exception $e) {\n`;
    template += `            return response()->json([\n`;
    template += `                'message' => 'An error occurred',\n`;
    template += `                'error' => $e->getMessage(),\n`;
    template += `            ], 400);\n`;
    template += `        }\n`;
    template += `    }\n\n`;

    template += `    /**\n`;
    template += `     * Remove the specified record from storage.\n`;
    template += `     */\n`;
    template += `    public function destroy($id) {\n`;
    template += `        try {\n`;
    template += `            $record = ${modelName}::find($id);\n\n`;
    template += `            if (!$record) {\n`;
    template += `                return response()->json([\n`;
    template += `                    'message' => 'Record not found.',\n`;
    template += `                ], 404);\n`;
    template += `            }\n\n`;

    template += `            // Delete the record\n`;
    template += `            $record->delete();\n`;

    template += `            return response()->json($record, 200);\n`;
    template += `        } catch (\\Exception $e) {\n`;
    template += `            return response()->json([\n`;
    template += `                'message' => 'An error occurred',\n`;
    template += `                'error' => $e->getMessage(),\n`;
    template += `            ], 400);\n`;
    template += `        }\n`;
    template += `    }\n`;
    template += `}\n`;

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
        tableName={`${group ? `${convertNaming(group, 'PascalSingular')}/` : ''}${convertNaming(formValues.table, 'PascalSingular')}Controller.php`}
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

export default ControllerTab;
