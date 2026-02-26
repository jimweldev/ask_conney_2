<?php

namespace App\Helpers;

use App\Models\User\User;

class UserHelper {
    /**
     * Retrieve a user by email with all related roles, permissions, and settings.
     *
     * Eager loads:
     * - rbac_user_roles.rbac_role.rbac_role_permissions.rbac_permission
     * - user_setting
     */
    public static function getUser(string $email) {
        return User::where('email', $email)
            ->with([
                'rbac_user_roles:id,user_id,rbac_role_id',
                'rbac_user_roles.rbac_role:id,label,value',
                'rbac_user_roles.rbac_role.rbac_role_permissions:id,rbac_role_id,rbac_permission_id',
                'rbac_user_roles.rbac_role.rbac_role_permissions.rbac_permission:id,label,value',
                'user_setting',
            ])
            ->first();
    }

    public static function formatName(?object $user, string $format = 'default'): string {
        if (!$user) {
            return '';
        }

        $firstName = $user->first_name ?? '';
        $middleName = $user->middle_name ?? '';
        $lastName = $user->last_name ?? '';
        $suffix = $user->suffix ?? '';

        switch ($format) {
            case 'semifull':
                $middleInitial = $middleName ? ' '.strtoupper(substr($middleName, 0, 1)).'.' : '';

                return trim(implode(' ', array_filter([
                    $firstName.$middleInitial,
                    $lastName,
                    $suffix,
                ])));

            case 'formal':
                $middleInitial = $middleName ? ' '.strtoupper(substr($middleName, 0, 1)).'.' : '';
                $suffixPart = $suffix ? ' '.$suffix : '';

                return trim(
                    $lastName.', '.$firstName.$middleInitial.$suffixPart
                );

            case 'full':
                return trim(implode(' ', array_filter([
                    $firstName,
                    $middleName,
                    $lastName,
                    $suffix,
                ])));

            default: // 'default'
                return trim(implode(' ', array_filter([
                    $firstName,
                    $lastName,
                ])));
        }
    }
}
