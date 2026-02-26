import { Outlet } from 'react-router';
import PageTabList from '@/components/tabs/page-tab/page-tab-list';
import PageTabTrigger from '@/components/tabs/page-tab/page-tab-trigger';
import PageHeader from '@/components/typography/page-header';

// Main mails page component with tabbed interface
const MailsPage = () => {
  return (
    <>
      <div className="mb-3 flex flex-col justify-between gap-1 @sm/main:flex-row @sm/main:items-center">
        <PageHeader>Mails</PageHeader>

        <PageTabList>
          <PageTabTrigger to="logs">Logs</PageTabTrigger>
          <PageTabTrigger to="templates">Templates</PageTabTrigger>
        </PageTabList>
      </div>

      <Outlet />
    </>
  );
};

export default MailsPage;
