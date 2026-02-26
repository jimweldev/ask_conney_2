import { FaGear, FaRightFromBracket } from 'react-icons/fa6';
import { Link } from 'react-router';
import useAuthUserStore from '@/05_stores/_common/auth-user-store';
import ReactImage from '@/components/image/react-image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatName } from '@/lib/user/format-name';

const MainTemplateHeaderDropdown = () => {
  const { user, clearAuthUser } = useAuthUserStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="shrink-0">
          <ReactImage
            className="outline-primary border-card flex size-7 items-center justify-center overflow-hidden rounded-full border outline-2"
            src={`${import.meta.env.VITE_STORAGE_BASE_URL}${user?.avatar_path}`}
            fallback="/images/default-avatar.png"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="font-medium">{formatName(user)}</span>
            <span className="text-muted-foreground text-xs">{user?.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link to="/settings">
          <DropdownMenuItem>
            <FaGear />
            Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => clearAuthUser()}>
          <FaRightFromBracket />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MainTemplateHeaderDropdown;
