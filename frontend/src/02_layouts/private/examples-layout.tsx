import {
  FaCircleDot,
  FaFileArrowUp,
  FaKeyboard,
  FaList,
  FaQuoteRight,
  FaRectangleList,
  FaRegKeyboard,
  FaSquareCheck,
  FaTableCellsLarge,
  FaTableList,
} from 'react-icons/fa6';
import { Outlet } from 'react-router';
import type { SidebarGroup } from '@/03_templates/_components/main-template-sidebar';
import MainTemplate from '@/03_templates/main-template';

const ExamplesLayout = () => {
  const sidebarGroups: SidebarGroup[] = [
    {
      group: 'Forms',
      links: [
        {
          name: 'Input',
          url: '/examples/forms',
          icon: FaKeyboard,
          end: true,
        },
        {
          name: 'Textarea',
          url: '/examples/forms/textarea',
          icon: FaRegKeyboard,
        },
        {
          name: 'Checkbox',
          url: '/examples/forms/checkbox',
          icon: FaSquareCheck,
        },
        {
          name: 'Radio Group',
          url: '/examples/forms/radio-group',
          icon: FaCircleDot,
        },
        {
          name: 'React Dropzone',
          url: '/examples/forms/react-dropzone',
          icon: FaFileArrowUp,
        },
        {
          name: 'React Quill',
          url: '/examples/forms/react-quill',
          icon: FaQuoteRight,
        },
        {
          name: 'System Dropdown',
          url: '/examples/forms/system-dropdown',
          icon: FaRectangleList,
        },
        {
          name: 'React Select',
          url: '/examples/forms/react-select',
          icon: FaRectangleList,
        },
      ],
    },
    {
      group: 'Data Table',
      links: [
        {
          name: 'List',
          url: '/examples/data-table',
          icon: FaList,
          end: true,
        },
        {
          name: 'Grid',
          url: '/examples/data-table/grid',
          icon: FaTableCellsLarge,
        },
        {
          name: 'List/Grid',
          url: '/examples/data-table/list-grid',
          icon: FaTableList,
        },
      ],
    },
    {
      group: 'Kanban',
      links: [
        {
          name: 'Kanban',
          url: '/examples/kanban',
          icon: FaList,
          end: true,
        },
      ],
    },
    {
      group: 'Builder',
      links: [
        {
          name: 'CRUD',
          url: '/examples/builder',
          icon: FaList,
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

export default ExamplesLayout;
