import { Outlet } from 'react-router';
import CardTabList from '@/components/tabs/card-tab/card-tab-list';
import CardTabTrigger from '@/components/tabs/card-tab/card-tab-trigger';
import { Card, CardBody } from '@/components/ui/card';

// RBAC (Role-Based Access Control) management tab component
const RbacTab = () => {
  return (
    <Card>
      {/* Tab navigation controls for RBAC sections */}
      <CardTabList>
        <CardTabTrigger to="roles">Roles</CardTabTrigger>
        <CardTabTrigger to="permissions">Permissions</CardTabTrigger>
      </CardTabList>

      {/* Main content area */}
      <CardBody>
        <Outlet />
      </CardBody>
    </Card>
  );
};

export default RbacTab;
