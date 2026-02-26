<?php

namespace App\Helpers;

use App\Models\Core\User;

class PermissionHelper {
    /**
     * Check if the given user has the specified permission.
     */
    public static function hasPermission($authUser, $permission, $allowAdmin = true): bool {
        // Automatically allow access if the user is an admin and admin bypass is enabled
        if ($allowAdmin && $authUser->is_admin) {
            return true;
        }

        // Iterate through the user's roles and permissions to check for a match
        foreach ($authUser->rbac_user_roles as $userRole) {
            $role = $userRole->rbac_role;
            foreach ($role->rbac_role_permissions as $rolePermission) {
                if ($rolePermission->rbac_permission->name === $permission) {
                    return true;
                }
            }
        }

        // Return false if no matching permission was found
        return false;
    }
}
