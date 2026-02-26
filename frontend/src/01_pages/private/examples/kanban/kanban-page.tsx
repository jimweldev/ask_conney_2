import { useState } from 'react';
import SearchInput from '@/components/input/search-input';
import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import KanbanCompletedColumn from './_columns/kanban-completed-column';
import KanbanInProgressColumn from './_columns/kanban-in-progress-column';
import KanbanToDoColumn from './_columns/kanban-to-do-column';

const KanbanPage = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <>
      <PageHeader className="mb-3">Example Tasks</PageHeader>

      <Card>
        <CardBody className="flex h-[calc(100vh-150px)] flex-col">
          <div className="mb-2 flex justify-between">
            <Button size="sm">Create</Button>
            <SearchInput
              inputSize="sm"
              placeholder="Search..."
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                if (e.key === 'Enter') {
                  setSearchTerm(e.currentTarget.value);
                }
              }}
            />
          </div>

          <div className="grid auto-cols-[320px] grid-flow-col gap-4 overflow-x-auto">
            <KanbanToDoColumn searchTerm={searchTerm} />
            <KanbanInProgressColumn searchTerm={searchTerm} />
            <KanbanCompletedColumn searchTerm={searchTerm} />
          </div>
        </CardBody>
      </Card>
    </>
  );
};

export default KanbanPage;
