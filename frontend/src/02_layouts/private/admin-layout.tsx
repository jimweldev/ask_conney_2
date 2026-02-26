import { FaChartArea, FaEnvelope, FaGears, FaUsers } from 'react-icons/fa6';
import { Outlet } from 'react-router';
import type { SidebarGroup } from '@/03_templates/_components/main-template-sidebar';
import MainTemplate from '@/03_templates/main-template';

const AdminLayout = () => {
  const sidebarGroups: SidebarGroup[] = [
    {
      group: 'Admin',
      links: [
        {
          name: 'Dashboard',
          url: '/admin',
          icon: FaChartArea,
          end: true,
        },
        {
          name: 'Users',
          url: '/admin/users',
          icon: FaUsers,
        },
        {
          name: 'Systems',
          url: '/admin/systems',
          icon: FaGears,
        },
        {
          name: 'Mails',
          url: '/admin/mails',
          icon: FaEnvelope,
        },
      ],
    },
  ];

  return (
    <MainTemplate sidebarGroups={sidebarGroups}>
      <Outlet />
    </MainTemplate>
  );
};

export default AdminLayout;
