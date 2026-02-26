import PageHeader from '@/components/typography/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { hasPermission } from '@/lib/user/has-permission';

const HomePage = () => {
  return (
    <>
      <PageHeader className="mb-3">Home</PageHeader>

      <div className="grid grid-cols-12 gap-3">
        <Card className="col-span-12 md:col-span-6">
          <CardBody>
            <h4 className="text-muted-foreground mb-2 text-sm font-bold">
              Implicit Admin
            </h4>

            <div className="flex flex-wrap gap-3">
              {hasPermission('create-user') ? (
                <Button>Create User</Button>
              ) : null}
              {hasPermission('update-user') ? (
                <Button>Update User</Button>
              ) : null}
              {hasPermission('delete-user') ? (
                <Button>Delete User</Button>
              ) : null}
            </div>
          </CardBody>
        </Card>

        <Card className="col-span-12 md:col-span-6">
          <CardBody>
            <h4 className="text-muted-foreground mb-2 text-sm font-bold">
              Explicit‑Check Admin
            </h4>

            <div className="flex flex-wrap gap-3">
              {hasPermission('create-user', false) ? (
                <Button>Create User</Button>
              ) : null}
              {hasPermission('update-user', false) ? (
                <Button>Update User</Button>
              ) : null}
              {hasPermission('delete-user', false) ? (
                <Button>Delete User</Button>
              ) : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
};

export default HomePage;
