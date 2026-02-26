import { type RbacPermission } from './rbac-permission';

export type RbacRolePermission = {
  id?: number;
  rbac_role_id?: number;
  rbac_permission_id?: number;
  rbac_permission?: RbacPermission;
  created_at?: string;
  updated_at?: string;
};
