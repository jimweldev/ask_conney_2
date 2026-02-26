import { FaLock, FaSliders, FaUser } from 'react-icons/fa6';
import { Outlet } from 'react-router';
import type { SidebarGroup } from '@/03_templates/_components/main-template-sidebar';
import MainTemplate from '@/03_templates/main-template';

const SettingsLayout = () => {
  const sidebarGroups: SidebarGroup[] = [
    {
      group: 'Settings',
      links: [
        {
          name: 'Profile',
          url: '/settings/profile',
          icon: FaUser,
        },
        {
          name: 'Password',
          url: '/settings/password',
          icon: FaLock,
        },
        {
          name: 'General',
          url: '/settings/general',
          icon: FaSliders,
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

export default SettingsLayout;
