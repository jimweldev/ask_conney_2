import { type RbacRole } from './rbac-role';

export type RbacUserRole = {
  id?: number;
  user_id?: number;
  rbac_role_id?: number;
  rbac_role?: RbacRole;
  created_at?: string;
  updated_at?: string;
};
