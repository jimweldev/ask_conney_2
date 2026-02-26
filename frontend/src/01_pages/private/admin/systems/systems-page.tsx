import { Outlet } from 'react-router';
import PageTabList from '@/components/tabs/page-tab/page-tab-list';
import PageTabTrigger from '@/components/tabs/page-tab/page-tab-trigger';
import PageHeader from '@/components/typography/page-header';

// Main systems page component with tabbed interface
const SystemsPage = () => {
  return (
    <>
      <div className="mb-3 flex flex-col justify-between gap-1 @sm/main:flex-row @sm/main:items-center">
        <PageHeader>Systems</PageHeader>

        <PageTabList>
          <PageTabTrigger to="system-settings">System Settings</PageTabTrigger>
          <PageTabTrigger to="system-dropdowns">
            System Dropdowns
          </PageTabTrigger>
          <PageTabTrigger to="system-logs">System Logs</PageTabTrigger>
        </PageTabList>
      </div>

      <Outlet />
    </>
  );
};

export default SystemsPage;
