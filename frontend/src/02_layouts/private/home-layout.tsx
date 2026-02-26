import { FaHouse } from 'react-icons/fa6';
import { Outlet } from 'react-router';
import type { SidebarGroup } from '@/03_templates/_components/main-template-sidebar';
import MainTemplate from '@/03_templates/main-template';

const HomeLayout = () => {
  const sidebarGroups: SidebarGroup[] = [
    {
      // group: 'Home',
      links: [
        {
          name: 'Chat',
          url: '/',
          icon: FaHouse,
        },
        {
          name: 'Rag Files',
          url: '/rag-files',
          icon: FaHouse,
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

export default HomeLayout;
