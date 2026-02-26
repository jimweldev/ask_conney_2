import { FaBarsStaggered, FaCode, FaHouse, FaUserGear } from 'react-icons/fa6';
import { NavLink, useLocation } from 'react-router';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MainTemplateHeaderDropdown from './_components/main-template-header-dropdown';

const activeHeader =
  'flex gap-0.5 p-2 flex-col justify-center items-center h-13 min-w-18 bg-primary text-primary-foreground transition-colors duration-200';

const inactiveHeader =
  'flex gap-0.5 p-2 flex-col justify-center items-center h-13 min-w-18 text-card-foreground hover:text-primary transition-colors duration-200';

type MainTemplateHeaderProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const MainTemplateHeader = ({ open, setOpen }: MainTemplateHeaderProps) => {
  const { user } = useAuthUserStore();
  const location = useLocation();

  const excludedMainMenuPaths = ['/admin', '/examples', '/settings'];
  const isExcluded = excludedMainMenuPaths.some(path =>
    location.pathname.startsWith(path),
  );

  const mainMenuPaths = [
    {
      path: '/admin',
      icon: <FaUserGear className="text-inherit" />,
      label: 'Admin',
    },
    {
      path: '/',
      icon: <FaHouse className="text-inherit" />,
      label: 'Home',
    },
    {
      path: '/examples',
      icon: <FaCode className="text-inherit" />,
      label: 'Examples',
    },
  ];

  return (
    <header className="bg-card sticky top-0 z-50 flex h-13 shrink-0 items-center justify-between gap-2 border-b p-2">
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" onClick={() => setOpen(!open)}>
          <FaBarsStaggered />
        </Button>

        <Separator className="h-8 w-2" orientation="vertical" />

        <nav>
          <ul className="flex">
            {mainMenuPaths.map(item => {
              // hide admin link if user is not admin
              if (item.path === '/admin' && !user?.is_admin) return null;

              if (item.path === '/') {
                const active = !isExcluded;
                return (
                  <li key={item.path}>
                    <NavLink
                      to={item.path}
                      className={`${active ? activeHeader : inactiveHeader}`}
                    >
                      {item.icon}
                      <span className="text-[12px] font-semibold">
                        {item.label}
                      </span>
                    </NavLink>
                  </li>
                );
              }

              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      isActive ? activeHeader : inactiveHeader
                    }
                  >
                    {item.icon}
                    <span className="text-[12px] font-semibold">
                      {item.label}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <MainTemplateHeaderDropdown />
    </header>
  );
};

export default MainTemplateHeader;
