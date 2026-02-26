import { FaUsers, FaUsersGear, FaUsersSlash, FaUserTie } from 'react-icons/fa6';
import AnimatedNumber from '@/components/motion/animated-number';
import { Card, CardBody } from '@/components/ui/card';
import useTanstackQuery from '@/hooks/tanstack/use-tanstack-query';
import type { Statistic } from '../_types/statistic';

const DashboardStatisticsPanel = () => {
  const { data } = useTanstackQuery<Statistic>({
    endpoint: '/dashboard/statistics',
  });

  return (
    <div className="gap-layout grid grid-cols-12">
      {/* Users */}
      <Card className="relative col-span-12 @lg/main:col-span-6 @3xl/main:col-span-3">
        <CardBody>
          <h6 className="text-muted-foreground mb-3 text-lg font-semibold">
            Users
          </h6>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data?.users ?? 0} />
          </p>
          <FaUsers className="text-muted-foreground/50 absolute top-3 right-3 size-8" />
        </CardBody>
      </Card>

      {/* Deleted Users */}
      <Card className="relative col-span-12 @lg/main:col-span-6 @3xl/main:col-span-3">
        <CardBody>
          <h6 className="text-muted-foreground mb-3 text-lg font-semibold">
            Deleted Users
          </h6>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data?.deleted_users ?? 0} />
          </p>
          <FaUsersSlash className="text-muted-foreground/50 absolute top-3 right-3 size-8" />
        </CardBody>
      </Card>

      {/* Admins */}
      <Card className="relative col-span-12 @lg/main:col-span-6 @3xl/main:col-span-3">
        <CardBody>
          <h6 className="text-muted-foreground mb-3 text-lg font-semibold">
            Admins
          </h6>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data?.admins ?? 0} />
          </p>
          <FaUsersGear className="text-muted-foreground/50 absolute top-3 right-3 size-8" />
        </CardBody>
      </Card>

      {/* Account Types */}
      <Card className="relative col-span-12 @lg/main:col-span-6 @3xl/main:col-span-3">
        <CardBody>
          <h6 className="text-muted-foreground mb-3 text-lg font-semibold">
            Account Types
          </h6>
          <p className="text-3xl font-bold">
            <AnimatedNumber value={data?.account_types ?? 0} />
          </p>
          <FaUserTie className="text-muted-foreground/50 absolute top-3 right-3 size-8" />
        </CardBody>
      </Card>
    </div>
  );
};

export default DashboardStatisticsPanel;
