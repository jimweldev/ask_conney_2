import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import DashboardPage from './01_pages/private/admin/dashboard/dashboard-page';
import MailLogsTab from './01_pages/private/admin/mails/_tabs/mail-logs/mail-logs-tab';
import MailTemplatesTab from './01_pages/private/admin/mails/_tabs/mail-templates/mail-templates-tab';
import MailsPage from './01_pages/private/admin/mails/mails-page';
import DropdownsTab from './01_pages/private/admin/systems/_tabs/system-dropdowns/_tabs/dropdowns/dropdowns-tab';
import ModulesTab from './01_pages/private/admin/systems/_tabs/system-dropdowns/_tabs/modules/modules-tab';
import SystemDropdownsPage from './01_pages/private/admin/systems/_tabs/system-dropdowns/system-dropdowns-tab';
import SystemLogsTab from './01_pages/private/admin/systems/_tabs/system-logs-tab';
import SystemSettingsTab from './01_pages/private/admin/systems/_tabs/system-settings/system-settings-tab';
import SystemsPage from './01_pages/private/admin/systems/systems-page';
import ActiveUsersTab from './01_pages/private/admin/users/_tabs/active-users/active-users-tab';
import ArchivedUsersTab from './01_pages/private/admin/users/_tabs/archived-users/archived-users-tab';
import PermissionsTab from './01_pages/private/admin/users/_tabs/rbac/_tabs/permissions/permissions-tab';
import RolesTab from './01_pages/private/admin/users/_tabs/rbac/_tabs/roles/roles-tab';
import RbacTab from './01_pages/private/admin/users/_tabs/rbac/rbac-tab';
import UsersPage from './01_pages/private/admin/users/users-page';
import CrudBuilderPage from './01_pages/private/examples/builder/crud-builder-page';
import DataTableGridPage from './01_pages/private/examples/data-table/data-table-grid-page';
import DataTableListGridPage from './01_pages/private/examples/data-table/data-table-list-grid-page';
import DataTableListPage from './01_pages/private/examples/data-table/data-table-list-page';
import CheckboxPage from './01_pages/private/examples/forms/checkbox-page';
import InputPage from './01_pages/private/examples/forms/input-page';
import RadioGroupPage from './01_pages/private/examples/forms/radio-group-page';
import ReactDropzonePage from './01_pages/private/examples/forms/react-dropzone-page';
import ReactQuillPage from './01_pages/private/examples/forms/react-quill-page';
import ReactSelectPage from './01_pages/private/examples/forms/react-select-page';
import SystemDropdownPage from './01_pages/private/examples/forms/system-dropdown-page';
import TextareaPage from './01_pages/private/examples/forms/textarea-page';
import DataTableKanbanPage from './01_pages/private/examples/kanban/kanban-page';
import ChatBotPage from './01_pages/private/home/chat-bot/chat-bot-page';
import RagFilesPage from './01_pages/private/home/rag-files/rag-files-page';
import GeneralPage from './01_pages/private/settings/general-page';
import PasswordPage from './01_pages/private/settings/password/password-page';
import ProfilePage from './01_pages/private/settings/profile/profile-page';
import ForgotPasswordPage from './01_pages/public/forgot-password-page';
import LoginPage from './01_pages/public/login/login-page';
import ResetPasswordPage from './01_pages/public/reset-password-page';
import AdminLayout from './02_layouts/private/admin-layout';
import ExamplesLayout from './02_layouts/private/examples-layout';
import HomeLayout from './02_layouts/private/home-layout';
import PrivateLayout from './02_layouts/private/private-layout';
import SettingsLayout from './02_layouts/private/settings-layout';
import PublicLayout from './02_layouts/public/public-layout';
import useAuthUserStore from './05_stores/_common/auth-user-store';

const App = () => {
  const { token, user } = useAuthUserStore();

  const privateRoutes = [
    {
      element: <PrivateLayout />,
      children: [
        // ACCOUNT TYPE | MAIN
        ...(user?.account_type === 'Main'
          ? [
              // MAIN LAYOUT
              {
                element: <HomeLayout />,
                children: [
                  {
                    path: '',
                    element: <ChatBotPage />,
                  },
                  {
                    path: 'rag-files',
                    element: <RagFilesPage />,
                  },
                ],
              },

              // ADMIN LAYOUT
              ...(user?.is_admin
                ? [
                    {
                      path: 'admin',
                      element: <AdminLayout />,
                      children: [
                        {
                          index: true,
                          element: <DashboardPage />,
                        },
                        {
                          path: 'users',
                          element: <UsersPage />,
                          children: [
                            {
                              index: true,
                              element: <Navigate to="active-users" replace />,
                            },
                            {
                              path: 'active-users',
                              element: <ActiveUsersTab />,
                            },
                            {
                              path: 'archived-users',
                              element: <ArchivedUsersTab />,
                            },
                            {
                              path: 'rbac',
                              element: <RbacTab />,
                              children: [
                                {
                                  index: true,
                                  element: <Navigate to="roles" replace />,
                                },
                                {
                                  path: 'roles',
                                  element: <RolesTab />,
                                },
                                {
                                  path: 'permissions',
                                  element: <PermissionsTab />,
                                },
                              ],
                            },
                          ],
                        },
                        {
                          path: 'systems',
                          element: <SystemsPage />,
                          children: [
                            {
                              index: true,
                              element: (
                                <Navigate to="system-settings" replace />
                              ),
                            },
                            {
                              path: 'system-settings',
                              element: <SystemSettingsTab />,
                            },
                            {
                              path: 'system-dropdowns',
                              element: <SystemDropdownsPage />,
                              children: [
                                {
                                  index: true,
                                  element: <Navigate to="dropdowns" replace />,
                                },
                                {
                                  path: 'dropdowns',
                                  element: <DropdownsTab />,
                                },
                                {
                                  path: 'modules',
                                  element: <ModulesTab />,
                                },
                              ],
                            },
                            {
                              path: 'system-logs',
                              element: <SystemLogsTab />,
                            },
                          ],
                        },
                        {
                          path: 'mails',
                          element: <MailsPage />,
                          children: [
                            {
                              index: true,
                              element: <Navigate to="logs" replace />,
                            },
                            {
                              path: 'logs',
                              element: <MailLogsTab />,
                            },
                            {
                              path: 'templates',
                              element: <MailTemplatesTab />,
                            },
                          ],
                        },
                      ],
                    },
                  ]
                : []),

              // SETTINGS LAYOUT
              {
                path: 'settings',
                element: <SettingsLayout />,
                children: [
                  {
                    index: true,
                    element: <Navigate to="profile" replace />,
                  },
                  {
                    path: 'profile',
                    element: <ProfilePage />,
                  },
                  {
                    path: 'password',
                    element: <PasswordPage />,
                  },
                  {
                    path: 'general',
                    element: <GeneralPage />,
                  },
                ],
              },

              // EXAMPLES LAYOUT
              ...(import.meta.env.VITE_ENV === 'development'
                ? [
                    {
                      path: 'examples',
                      element: <ExamplesLayout />,
                      children: [
                        {
                          index: true,
                          element: <Navigate to="/examples/forms" />,
                        },
                        {
                          path: 'forms',
                          children: [
                            {
                              index: true,
                              element: <InputPage />,
                            },
                            {
                              path: 'textarea',
                              element: <TextareaPage />,
                            },
                            {
                              path: 'checkbox',
                              element: <CheckboxPage />,
                            },
                            {
                              path: 'radio-group',
                              element: <RadioGroupPage />,
                            },
                            {
                              path: 'react-dropzone',
                              element: <ReactDropzonePage />,
                            },
                            {
                              path: 'react-quill',
                              element: <ReactQuillPage />,
                            },
                            {
                              path: 'system-dropdown',
                              element: <SystemDropdownPage />,
                            },
                            {
                              path: 'react-select',
                              element: <ReactSelectPage />,
                            },
                          ],
                        },
                        {
                          path: 'data-table',
                          children: [
                            {
                              index: true,
                              element: <DataTableListPage />,
                            },
                            {
                              path: 'grid',
                              element: <DataTableGridPage />,
                            },
                            {
                              path: 'list-grid',
                              element: <DataTableListGridPage />,
                            },
                          ],
                        },
                        {
                          path: 'kanban',
                          children: [
                            {
                              index: true,
                              element: <DataTableKanbanPage />,
                            },
                          ],
                        },
                        {
                          path: 'builder',
                          children: [
                            {
                              index: true,
                              element: <CrudBuilderPage />,
                            },
                          ],
                        },
                      ],
                    },
                  ]
                : []),
            ]
          : []),
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ];

  const publicRoutes = [
    {
      element: <PublicLayout />,
      children: [
        {
          index: true,
          element: <LoginPage />,
        },
        {
          path: '/reset-password',
          element: <ResetPasswordPage />,
        },
        {
          path: '/forgot-password',
          children: [
            {
              path: '',
              element: <ForgotPasswordPage />,
            },
          ],
        },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/" replace />,
    },
  ];

  const router = createBrowserRouter(!token ? publicRoutes : privateRoutes);

  return <RouterProvider router={router} />;
};

export default App;
