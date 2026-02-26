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

const PageTab = () => {
  const { theme } = useThemeStore();
  const [isCopied, setIsCopied] = useState(false);

  const [pageViewType, setPageViewType] = useState<
    'list' | 'grid' | 'list/grid'
  >('list');

  const { control } = useFormContext<FormData>();
  const formValues = useWatch<FormData>({ control });

  if (!formValues.table) return null;

  const { group, table, route, table_fields } = formValues;
  const modelName = convertNaming(table, 'PascalSingular');
  const pascalPlural = convertNaming(table, 'PascalPlural');
  const camelSingular = convertNaming(table, 'CamelSingular');
  const camelPlural = convertNaming(table, 'CamelPlural');
  const kebabTable = convertNaming(table, 'KebabSingular');
  const readablePlural = convertNaming(table, 'ReadablePlural');
  const groupPath = group ? `/${convertNaming(group, 'KebabSingular')}` : '';

  const validFields =
    table_fields?.filter(f => f.name && f.name.trim() !== '') || [];
  const firstField = validFields.length > 0 ? validFields[0].name : 'name';

  // -------------------------
  // LIST PAGE TEMPLATE
  // -------------------------
  const generateListPage = () => {
    return `import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type ${modelName} } from '@/04_types${groupPath}/${kebabTable}';
import use${modelName}Store from '@/05_stores${groupPath}/${kebabTable}-store';
import DataTable, { type DataTableColumn } from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import Create${modelName}Dialog from './_dialogs/create-${kebabTable}-dialog';
import Delete${modelName}Dialog from './_dialogs/delete-${kebabTable}-dialog';
import Update${modelName}Dialog from './_dialogs/update-${kebabTable}-dialog';

const ${pascalPlural}Page = () => {
  const { setSelected${modelName} } = use${modelName}Store();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const ${camelPlural}Pagination = useTanstackPaginateQuery<${modelName}>({
    endpoint: '${route}',
    defaultSort: '-id',
  });

  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    ${validFields.map(field => `{ label: '${convertNaming(field.name!, 'Readable')}', column: '${field.name}' }`).join(',\n    ')},
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
    { label: 'Actions', className: 'w-[100px]' },
  ];

  const actions = (
    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
      Create
    </Button>
  );

  return (
    <>
      <PageHeader className="mb-3">${readablePlural}</PageHeader>

      <Card>
        <CardBody>
          <DataTable
            pagination={${camelPlural}Pagination}
            columns={columns}
            actions={actions}
          >
            {${camelPlural}Pagination.data?.records
              ? ${camelPlural}Pagination.data.records.map(${camelSingular} => (
                  <TableRow key={${camelSingular}.id}>
                    <TableCell>{${camelSingular}.id}</TableCell>
                    ${validFields.map(field => `<TableCell>{${camelSingular}.${field.name}}</TableCell>`).join('\n                    ')}
                    <TableCell>{getDateTimezone(${camelSingular}.created_at, 'date_time')}</TableCell>
                    <TableCell>
                      <InputGroup size="sm">
                        <Tooltip content="Update">
                          <Button variant="info" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenUpdateDialog(true); }}>
                            <FaPenToSquare />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button variant="destructive" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenDeleteDialog(true); }}>
                            <FaTrash />
                          </Button>
                        </Tooltip>
                      </InputGroup>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </DataTable>
        </CardBody>
      </Card>

      <Create${modelName}Dialog open={openCreateDialog} setOpen={setOpenCreateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Update${modelName}Dialog open={openUpdateDialog} setOpen={setOpenUpdateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Delete${modelName}Dialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} refetch={${camelPlural}Pagination.refetch} />
    </>
  );
};

export default ${pascalPlural}Page;`;
  };

  // -------------------------
  // GRID PAGE TEMPLATE
  // -------------------------
  const generateGridPage = () => {
    return `import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type ${modelName} } from '@/04_types${groupPath}/${kebabTable}';
import use${modelName}Store from '@/05_stores${groupPath}/${kebabTable}-store';
import DataTable from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import DataTableGridSkeleton from '@/components/skeleton/data-table-grid-skeleton';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import Create${modelName}Dialog from './_dialogs/create-${kebabTable}-dialog';
import Delete${modelName}Dialog from './_dialogs/delete-${kebabTable}-dialog';
import Update${modelName}Dialog from './_dialogs/update-${kebabTable}-dialog';

const ${pascalPlural}Page = () => {
  const { setSelected${modelName} } = use${modelName}Store();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const ${camelPlural}Pagination = useTanstackPaginateQuery<${modelName}>({
    endpoint: '${route}',
    defaultSort: 'id',
  });

  const actions = (
    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
      Create
    </Button>
  );

  return (
    <>
      <PageHeader className="mb-3">${readablePlural}</PageHeader>

      <Card>
        <CardBody>
          <DataTable
            pagination={${camelPlural}Pagination}
            actions={actions}
            defaultView="grid"
            gridSkeleton={
              <DataTableGridSkeleton count={${camelPlural}Pagination.limit} />
            }
          >
            {${camelPlural}Pagination.data?.records ? (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
                {${camelPlural}Pagination.data.records.map(${camelSingular} => (
                  <div className="p-layout rounded border" key={${camelSingular}.id}>
                    <h4 className="mb-layout">{${camelSingular}.${firstField}}</h4>

                    <div className="flex justify-end">
                      <InputGroup size="sm">
                        <Tooltip content="Update">
                          <Button
                            variant="info"
                            size="icon-xs"
                            onClick={() => {
                              setSelected${modelName}(${camelSingular});
                              setOpenUpdateDialog(true);
                            }}
                          >
                            <FaPenToSquare />
                          </Button>
                        </Tooltip>
                        <Tooltip content="Delete">
                          <Button
                            variant="destructive"
                            size="icon-xs"
                            onClick={() => {
                              setSelected${modelName}(${camelSingular});
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </Tooltip>
                      </InputGroup>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </DataTable>
        </CardBody>
      </Card>

      <Create${modelName}Dialog open={openCreateDialog} setOpen={setOpenCreateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Update${modelName}Dialog open={openUpdateDialog} setOpen={setOpenUpdateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Delete${modelName}Dialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} refetch={${camelPlural}Pagination.refetch} />
    </>
  );
};

export default ${pascalPlural}Page;`;
  };

  // -------------------------
  // COMBINED LIST + GRID TEMPLATE
  // -------------------------
  const generateListGridPage = () => {
    // Generate columns from validFields
    const columns = [
      `{ label: 'ID', column: 'id', className: 'w-[80px]' },`,
      ...validFields.map(
        field =>
          `{ label: '${convertNaming(field.name!, 'Readable')}', column: '${field.name}' },`,
      ),
      `{ label: 'Created At', column: 'created_at', className: 'w-[200px]' },`,
      `{ label: 'Actions', className: 'w-[100px]' },`,
    ].join('\n    ');

    // Generate table cells from validFields
    const listCells = [
      `<TableCell>{${camelSingular}.id}</TableCell>`,
      ...validFields.map(
        field => `<TableCell>{${camelSingular}.${field.name}}</TableCell>`,
      ),
      `<TableCell>{getDateTimezone(${camelSingular}.created_at, 'date_time')}</TableCell>`,
      `<TableCell>
  <InputGroup size="sm">
    <Tooltip content="Update">
      <Button variant="info" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenUpdateDialog(true); }}>
        <FaPenToSquare />
      </Button>
    </Tooltip>
    <Tooltip content="Delete">
      <Button variant="destructive" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenDeleteDialog(true); }}>
        <FaTrash />
      </Button>
    </Tooltip>
  </InputGroup>
</TableCell>`,
    ].join('\n              ');

    return `import { useState } from 'react';
import { FaPenToSquare, FaTrash } from 'react-icons/fa6';
import { type ${modelName} } from '@/04_types${groupPath}/${kebabTable}';
import use${modelName}Store from '@/05_stores${groupPath}/${kebabTable}-store';
import DataTable, { type DataTableColumn } from '@/components/data-table/data-table';
import InputGroup from '@/components/input-group/input-group';
import DataTableGridSkeleton from '@/components/skeleton/data-table-grid-skeleton';
import Tooltip from '@/components/tooltip/tooltip';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';
import Create${modelName}Dialog from './_dialogs/create-${kebabTable}-dialog';
import Delete${modelName}Dialog from './_dialogs/delete-${kebabTable}-dialog';
import Update${modelName}Dialog from './_dialogs/update-${kebabTable}-dialog';

const ${pascalPlural}Page = () => {
  const { setSelected${modelName} } = use${modelName}Store();

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const ${camelPlural}Pagination = useTanstackPaginateQuery<${modelName}>({
    endpoint: '${route}',
    defaultSort: 'id',
  });

  const columns: DataTableColumn[] = [
    ${columns}
  ];

  const actions = (
    <Button size="sm" onClick={() => setOpenCreateDialog(true)}>
      Create
    </Button>
  );

  const list = (
    <>
      {${camelPlural}Pagination.data?.records
        ? ${camelPlural}Pagination.data.records.map(${camelSingular} => (
            <TableRow key={${camelSingular}.id}>
              ${listCells}
            </TableRow>
          ))
        : null}
    </>
  );

  const grid = (
    <>
      {${camelPlural}Pagination.data?.records ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2">
          {${camelPlural}Pagination.data?.records.map(${camelSingular} => (
            <div className="p-layout rounded border" key={${camelSingular}.id}>
              <h4 className="mb-layout">{${camelSingular}.${firstField}}</h4>

              <div className="flex justify-end">
                <InputGroup size="sm">
                  <Tooltip content="Update">
                    <Button variant="info" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenUpdateDialog(true); }}>
                      <FaPenToSquare />
                    </Button>
                  </Tooltip>
                  <Tooltip content="Delete">
                    <Button variant="destructive" size="icon-xs" onClick={() => { setSelected${modelName}(${camelSingular}); setOpenDeleteDialog(true); }}>
                      <FaTrash />
                    </Button>
                  </Tooltip>
                </InputGroup>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </>
  );

  return (
    <>
      <PageHeader className="mb-3">${readablePlural}</PageHeader>

      <Card>
        <CardBody>
          <DataTable
            pagination={${camelPlural}Pagination}
            columns={columns}
            actions={actions}
            showViewToggle
            list={list}
            grid={grid}
            gridSkeleton={<DataTableGridSkeleton />}
          ></DataTable>
        </CardBody>
      </Card>

      <Create${modelName}Dialog open={openCreateDialog} setOpen={setOpenCreateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Update${modelName}Dialog open={openUpdateDialog} setOpen={setOpenUpdateDialog} refetch={${camelPlural}Pagination.refetch} />
      <Delete${modelName}Dialog open={openDeleteDialog} setOpen={setOpenDeleteDialog} refetch={${camelPlural}Pagination.refetch} />
    </>
  );
};

export default ${pascalPlural}Page;`;
  };

  // -------------------------
  // MAIN GENERATOR SWITCH
  // -------------------------
  const generatePage = () => {
    if (pageViewType === 'list') return generateListPage();
    if (pageViewType === 'grid') return generateGridPage();
    return generateListGridPage();
  };

  const code = generatePage();

  const onCopy = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <FilenameInputGroup
        tableName={`${convertNaming(table, 'KebabPlural')}-page.tsx`}
      />

      <div className="relative z-50 mb-2 flex justify-end">
        <ReactSelect
          className="react-select-container-sm w-[250px]"
          classNamePrefix="react-select-sm"
          options={[
            { label: 'List', value: 'list' },
            { label: 'Grid', value: 'grid' },
            { label: 'List/Grid', value: 'list/grid' },
          ]}
          value={{
            label:
              pageViewType === 'list'
                ? 'List'
                : pageViewType === 'grid'
                  ? 'Grid'
                  : 'List/Grid',
            value: pageViewType,
          }}
          onChange={option =>
            setPageViewType(option?.value as 'list' | 'grid' | 'list/grid')
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

export default PageTab;
