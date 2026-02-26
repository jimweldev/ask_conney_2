import type { SystemLog } from '@/04_types/system/system-log';
import DataTable, {
  type DataTableColumn,
} from '@/components/data-table/data-table';
import { Card, CardBody } from '@/components/ui/card';
import { TableCell, TableRow } from '@/components/ui/table';
import useTanstackPaginateQuery from '@/hooks/tanstack/use-tanstack-paginate-query';
import { getDateTimezone } from '@/lib/date/get-date-timezone';

const SystemLogsTab = () => {
  // Tanstack query hook for pagination
  const systemLogsPagination = useTanstackPaginateQuery<SystemLog>({
    endpoint: '/system/logs',
    defaultSort: '-id',
  });

  // Define table columns
  const columns: DataTableColumn[] = [
    { label: 'ID', column: 'id', className: 'w-[80px]' },
    { label: 'Label', column: 'label' },
    { label: 'Start Time', column: 'start_time' },
    { label: 'End Time', column: 'end_time' },
    { label: 'Remarks', column: 'remarks' },
    { label: 'Created At', column: 'created_at', className: 'w-[200px]' },
  ];

  return (
    <>
      {/* Card */}
      <Card>
        <CardBody>
          {/* Data Table */}
          <DataTable pagination={systemLogsPagination} columns={columns}>
            {/* Render rows only if data is present */}
            {systemLogsPagination.data?.records
              ? systemLogsPagination.data.records.map(systemSetting => (
                  <TableRow key={systemSetting.id}>
                    <TableCell>{systemSetting.id}</TableCell>
                    <TableCell>{systemSetting.label}</TableCell>
                    <TableCell>
                      {getDateTimezone(systemSetting.start_time, 'date_time')}
                    </TableCell>
                    <TableCell>
                      {getDateTimezone(systemSetting.end_time, 'date_time')}
                    </TableCell>
                    <TableCell>{systemSetting.remarks}</TableCell>
                    <TableCell>
                      {getDateTimezone(systemSetting.created_at, 'date_time')}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </DataTable>
        </CardBody>
      </Card>
    </>
  );
};

export default SystemLogsTab;
