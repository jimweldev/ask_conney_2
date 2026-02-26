<?php

use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Common\AuthController;
use App\Http\Controllers\Example\ExampleTaskController;
use App\Http\Controllers\Mail\MailLogController;
use App\Http\Controllers\Mail\MailTemplateController;
use App\Http\Controllers\Rag\RagFileController;
use App\Http\Controllers\Rbac\RbacPermissionController;
use App\Http\Controllers\Rbac\RbacRoleController;
use App\Http\Controllers\Select\SelectController;
use App\Http\Controllers\System\SystemDropdownController;
use App\Http\Controllers\System\SystemDropdownModuleController;
use App\Http\Controllers\System\SystemSettingController;
use App\Http\Controllers\User\UserController;
use App\Http\Controllers\User\UserImageController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [AuthController::class, 'loginWithEmail']);
Route::post('/2fa/login', [AuthController::class, 'verify2faLogin']);
Route::post('auth/send-reset-password-email', [AuthController::class, 'sendResetPasswordEmail']);
Route::post('auth/reset-password', [AuthController::class, 'resetPassword']);

// Google
Route::post('/auth/google-login', [AuthController::class, 'loginWithGoogle']);

// Example Tasks
Route::resource('/examples/tasks', ExampleTaskController::class);

// COMMON
Route::middleware('auth.middleware')->group(function () {});

// ADMIN
Route::middleware('auth.middleware')->group(function () {
    // ============================
    // === DASHBOARD
    // ============================
    Route::get('/dashboard/statistics', [DashboardController::class, 'getDashboardStatistics']);
    Route::get('/dashboard/user-registration-stats', [DashboardController::class, 'getUserRegistrationStats']);
    Route::get('/dashboard/account-types', [DashboardController::class, 'getDashboardAccountTypes']);

    // ============================
    // === USERS
    // ============================
    // user roles
    Route::get('/users/{id}/user-roles', [UserController::class, 'getUserRoles']);
    Route::patch('/users/{id}/user-roles', [UserController::class, 'updateUserRoles']);

    // archived users
    Route::get('/users/archived', [UserController::class, 'getAllArchivedUsers']);
    Route::get('/users/{id}/archived', [UserController::class, 'getArchivedUser']);
    Route::post('/users/{id}/archived/restore', [UserController::class, 'restoreArchivedUser']);
    Route::delete('/users/{id}/2fa', [UserController::class, 'disable2FA']);

    // active users
    Route::post('/users/filter', [UserController::class, 'index']);
    Route::resource('/users', UserController::class);

    // ============================
    // === RBAC
    // ============================
    // roles
    Route::get('/rbac/roles/{id}/permissions/{permissionId}', [RbacRoleController::class, 'getPermission']);
    Route::post('/rbac/roles/{id}/permissions', [RbacRoleController::class, 'addPermission']);
    Route::delete('/rbac/roles/{id}/permissions/{permissionId}', [RbacRoleController::class, 'removePermission']);
    Route::resource('/rbac/roles', RbacRoleController::class);

    // permissions
    Route::resource('/rbac/permissions', RbacPermissionController::class);

    // ============================
    // === MAILS
    // ============================
    // mail templates
    Route::resource('/mails/templates', MailTemplateController::class);

    // mail logs
    Route::resource('/mails/logs', MailLogController::class);

    // ============================
    // === SYSTEM
    // ============================
    Route::resource('/system/settings', SystemSettingController::class);

    // System Dropdown Modules
    Route::resource('/system/system-dropdowns/modules', SystemDropdownModuleController::class);

    // system dropdowns
    Route::put('/system/system-dropdowns/order', [SystemDropdownController::class, 'updateSystemDropdownOrders']);
    Route::resource('/system/system-dropdowns', SystemDropdownController::class);
    Route::get('/system/system-dropdowns/{module}/{type}', [SystemDropdownController::class, 'getBySystemDropdownsModuleAndType']);

    // system logs
    Route::resource('/system/logs', SystemLogController::class);
});

// SELECTS
Route::middleware('auth.middleware')->group(function () {
    // ============================
    // === SELECT
    // ============================
    Route::get('/select/users', [SelectController::class, 'getSelectUsers']);
    Route::get('/select/roles', [SelectController::class, 'getSelectRoles']);
    Route::get('/select/permissions', [SelectController::class, 'getSelectPermissions']);
    Route::get('/select/system-dropdowns', [SelectController::class, 'getSelectSystemDropdowns']);
    Route::get('/select/system-dropdown-modules', [SelectController::class, 'getSelectSystemDropdownModules']);
    Route::get('/select/system-dropdown-module-types', [SelectController::class, 'getSelectSystemDropdownModuleTypes']);
});

// AUTHENTICATED USER
Route::middleware('auth.middleware')->group(function () {
    // ============================
    // === SETTINGS
    // ============================
    // general
    Route::patch('/settings', [UserController::class, 'updateUserSettings']);
    Route::patch('/settings/profile', [UserController::class, 'updateProfile']);
    Route::post('/settings/profile/avatar', [UserController::class, 'updateProfileAvatar']);
    Route::patch('/settings/change-password', [UserController::class, 'changePassword']);
    Route::patch('/settings/set-password', [UserController::class, 'setPassword']);

    // notifications
    Route::get('/notifications', [UserController::class, 'getAllNotifications']);
    Route::patch('/notifications/{id}', [UserController::class, 'viewNotification'])->whereNumber('id');
    Route::patch('/notifications/mark-all-as-read', [UserController::class, 'markAllAsReadNotifications']);

    // unread notifications count
    Route::get('/notifications/unread-count', [UserController::class, 'getUnreadNotificationsCount']);

    // Two-Factor Authentication
    Route::post('/2fa/enable', [AuthController::class, 'enable2fa']);
    Route::post('/2fa/verify', [AuthController::class, 'verify2fa']);
    Route::post('/2fa/disable', [AuthController::class, 'disable2fa']);

    // ============================
    // === USER IMAGES
    // ============================
    Route::resource('/user-images', UserImageController::class);

    // Rag Files
    Route::post('/rag/query', [RagFileController::class, 'query']);
    Route::resource('/rag/files', RagFileController::class);
});
