import { type RbacUserRole } from '../rbac/rbac-user-role';
import { type UserSetting } from './user-setting';

export type User = {
  id?: number;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  suffix?: string;
  avatar_path?: string;
  email?: string;
  is_admin?: boolean;
  account_type?: string;
  is_two_factor_enabled?: boolean;
  has_password?: boolean;
  rbac_user_roles?: RbacUserRole[];
  user_setting?: UserSetting;
  deleted_at?: string;
  created_at?: string;
  updated_at?: string;
};
