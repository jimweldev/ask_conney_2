import useAuthUserStore from '@/05_stores/_common/auth-user-store';

export const hasPermission = (
  permission: string,
  allowAdmin: boolean = true,
) => {
  const { user } = useAuthUserStore.getState();

  if (!user) return false;

  if (user.is_admin && allowAdmin) return true;

  if (!user.rbac_user_roles) return false;

  for (const role of user.rbac_user_roles) {
    if (!role.rbac_role) continue;

    if (!role.rbac_role.rbac_role_permissions) continue;

    for (const rolePermission of role.rbac_role.rbac_role_permissions) {
      if (!rolePermission.rbac_permission) continue;

      if (rolePermission.rbac_permission.value === permission) return true;
    }
  }

  return false;
};
