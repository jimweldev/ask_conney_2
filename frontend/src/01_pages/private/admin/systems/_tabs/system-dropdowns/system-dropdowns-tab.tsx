import { Outlet } from 'react-router';
import CardTabList from '@/components/tabs/card-tab/card-tab-list';
import CardTabTrigger from '@/components/tabs/card-tab/card-tab-trigger';
import { Card, CardBody } from '@/components/ui/card';

// Main systems page component with tabbed interface
const SystemDropdownsPage = () => {
  return (
    <>
      <Card>
        <CardTabList>
          <CardTabTrigger to="dropdowns">Dropdowns</CardTabTrigger>
          <CardTabTrigger to="modules">Modules</CardTabTrigger>
        </CardTabList>
        <CardBody>
          <Outlet />
        </CardBody>
      </Card>
    </>
  );
};

export default SystemDropdownsPage;
