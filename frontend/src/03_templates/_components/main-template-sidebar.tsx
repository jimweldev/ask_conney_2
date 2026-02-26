import { Link, NavLink } from 'react-router';
import ReactImage from '@/components/image/react-image';

const activeSidebar =
  'flex gap-2 font-semibold items-center px-3 py-2 rounded-lg bg-secondary text-secondary-foreground transition-colors duration-200';

const inactiveSidebar =
  'flex gap-2 font-semibold items-center px-3 py-2 rounded-lg text-card-foreground hover:text-secondary transition-colors duration-200';

type SidebarLink = {
  name: string;
  url: string;
  icon: React.ComponentType;
  end?: boolean;
};

export type SidebarGroup = {
  group?: string;
  links: SidebarLink[];
};

type MainTemplateSidebarProps = {
  open: boolean;
  sidebarGroups: SidebarGroup[];
};

const MainTemplateSidebar = ({
  open,
  sidebarGroups,
}: MainTemplateSidebarProps) => {
  return (
    <div
      className={`bg-card w-[280px] shrink-0 border-r transition-all duration-300 ${
        open ? '-ml-[280px] lg:ml-0' : 'ml-0 lg:-ml-[280px]'
      }`}
    >
      <div className="p-layout flex flex-col items-center justify-between">
        <Link className="w-full max-w-[80px] overflow-hidden rounded-md" to="/">
          <ReactImage src="asd" fallback="/logos/logo.svg" />
        </Link>
        <h1 className="mt-2 text-center font-semibold transition-[margin,opacity,hidden] group-data-[collapsible=icon]:hidden group-data-[collapsible=icon]:opacity-0">
          {import.meta.env.VITE_APP_NAME}
        </h1>
      </div>
      <div className="p-4 pt-0">
        <nav>
          <ul>
            {sidebarGroups.map((group, index) => (
              <li key={`${group.group}-${index}`}>
                <h4 className="text-muted-foreground mt-layout mb-1 px-2 text-xs font-medium">
                  {group.group}
                </h4>
                <ul className="mb-4 space-y-1">
                  {group.links.map((link, index) => (
                    <li key={index}>
                      <NavLink
                        to={link.url}
                        end={link.end}
                        className={({ isActive }) =>
                          isActive ? activeSidebar : inactiveSidebar
                        }
                      >
                        <link.icon />
                        <span className="text-sm">{link.name}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
};

export default MainTemplateSidebar;
