<?php

namespace App\Http\Controllers\User;

use App\Helpers\QueryHelper;
use App\Helpers\StorageHelper;
use App\Helpers\UserHelper;
use App\Http\Controllers\Controller;
use App\Models\Mail\MailLog;
use App\Models\Mail\MailTemplate;
use App\Models\User\User;
use App\Models\User\UserNotification;
use App\Models\User\UserSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserController extends Controller {
    /**
     * Display a listing of users based on filters.
     */
    public function index(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        $queryParams = $request->all();

        try {
            $query = User::with(['rbac_user_roles' => function ($query) {
                $query->select('id', 'user_id', 'rbac_role_id')
                    ->with(['rbac_role' => function ($query) {
                        $query->select('id', 'label');
                    }]);
            }]);

            $type = 'paginate';
            QueryHelper::apply($query, $queryParams, $type);

            if (isset($queryParams['has'])) {
                foreach (explode(',', $queryParams['has']) as $h) {
                    $query->whereHas($h);
                }
            }

            if (isset($queryParams['with'])) {
                if (in_array('rbac_user_roles', explode(',', $queryParams['with']))) {
                    $query->with(['rbac_user_roles' => function ($query) {
                        $query->select('id', 'user_id', 'rbac_role_id')
                            ->with(['rbac_role' => function ($query) {
                                $query->select('id', 'label');
                            }]);
                    }]);
                }
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('email', 'LIKE', "%$search%")
                        ->orWhere('full_name', 'LIKE', "%$search%")
                        ->orWhereHas('rbac_user_roles.rbac_role', function ($query) use ($search) {
                            $query->where('label', 'LIKE', "%$search%");
                        });
                });
            }

            $total = $query->count();
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            QueryHelper::applyLimitAndOffset($query, $limit, $page);
            $records = $query->get();

            return response()->json([
                'records' => $records,
                'meta' => [
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred. Kindly check all the parameters provided. '.$e->getMessage(),
            ], 400);
        }
    }

    public function getAllUsersWithFilter(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        $queryParams = $request->all();

        try {
            $query = User::with(['rbac_user_roles' => function ($query) {
                $query->select('id', 'user_id', 'rbac_role_id')
                    ->with(['rbac_role' => function ($query) {
                        $query->select('id', 'label');
                    }]);
            }]);

            $type = 'paginate';
            QueryHelper::apply($query, $queryParams, $type);

            if (isset($queryParams['has'])) {
                foreach (explode(',', $queryParams['has']) as $h) {
                    $query->whereHas($h);
                }
            }

            if (isset($queryParams['with'])) {
                if (in_array('rbac_user_roles', explode(',', $queryParams['with']))) {
                    $query->with(['rbac_user_roles' => function ($query) {
                        $query->select('id', 'user_id', 'rbac_role_id')
                            ->with(['rbac_role' => function ($query) {
                                $query->select('id', 'label');
                            }]);
                    }]);
                }
            }

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('email', 'LIKE', "%$search%")
                        ->orWhere('full_name', 'LIKE', "%$search%")
                        ->orWhereHas('rbac_user_roles.rbac_role', function ($query) use ($search) {
                            $query->where('label', 'LIKE', "%$search%");
                        });
                });
            }

            $total = $query->count();
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            QueryHelper::applyLimitAndOffset($query, $limit, $page);
            $records = $query->get();

            return response()->json([
                'records' => $records,
                'meta' => [
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred. Kindly check all the parameters provided. '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Display the specified user by ID with roles.
     */
    public function show($id) {
        $record = User::where('id', $id)
            ->with(['rbac_user_roles' => function ($query) {
                $query->select('id', 'user_id', 'rbac_role_id')
                    ->with(['rbac_role' => function ($query) {
                        $query->select('id', 'label');
                    }]);
            }])
            ->first();

        if (!$record) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json($record, 200);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $userExists = User::where('email', $request->input('email'))->exists();

            if ($userExists) {
                return response()->json([
                    'message' => 'User already exists.',
                ], 400);
            }

            $defaultPassword = env('DEFAULT_PASSWORD', 'P@ssword123!');

            $request['password'] = Hash::make($defaultPassword);
            $record = User::create($request->all());

            return response()->json($record, 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update the specified user by ID.
     */
    public function update(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'User not found.',
                ], 404);
            }

            $user->update($request->all());

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json([
                    'message' => 'User not found.',
                ], 404);
            }

            if ($user->id == $authUser->id) {
                return response()->json([
                    'message' => 'You cannot delete your own account.',
                ], 400);
            }

            $user->delete();

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Remove user's 2FA.
     */
    public function disable2FA(Request $request, $id) {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        }

        if (!$user->is_two_factor_enabled) {
            return response()->json([
                'message' => '2FA is not enabled for this user.',
            ], 400);
        }

        $mailTemplateId = MailTemplate::where('label', 'Disable Two-Factor Authentication Template')->first()->id;

        if (!$mailTemplateId) {
            return response()->json([
                'message' => 'Mail template not found',
            ], 404);
        }

        $user->two_factor_secret = null;
        $user->is_two_factor_enabled = false;
        $user->save();

        $name = UserHelper::formatName($user, 'semifull');

        MailLog::create([
            'user_id' => $user->id,
            'mail_template_id' => $mailTemplateId,
            'subject' => 'Disable Two-Factor Authentication',
            'recipient_email' => $user->email,
            'content_data' => json_encode([
                'name' => $name,
            ]),
        ]);

        return response()->json($user);
    }

    /**
     * Import a list of users from a dataset.
     */
    public function import(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $info = ['new' => 0, 'skipped' => 0];
            $data = $request->input('data');

            foreach ($data as $user) {
                $email = $user['Email'] ?? null;

                if (!$email) {
                    return response()->json(['message' => 'Email is required'], 400);
                }

                $defaultPassword = env('DEFAULT_PASSWORD', 'P@ssword123!');

                if (!User::where('email', $email)->exists()) {
                    $info['new']++;
                    User::create([
                        'email' => strtolower($email),
                        'first_name' => $user['First Name'] ?? null,
                        'middle_name' => $user['Middle Name'] ?? null,
                        'last_name' => $user['Last Name'] ?? null,
                        'suffix' => $user['Suffix'] ?? null,
                        'password' => Hash::make($defaultPassword),
                    ]);
                } else {
                    $info['skipped']++;
                }
            }

            return response()->json([
                'message' => 'Users imported successfully',
                'info' => $info,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    // getAllArchivedUsers
    public function getAllArchivedUsers(Request $request) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        $queryParams = $request->all();

        try {
            $query = User::onlyTrashed()->with(['rbac_user_roles' => function ($query) {
                $query->select('id', 'user_id', 'rbac_role_id')
                    ->with(['rbac_role' => function ($query) {
                        $query->select('id', 'label');
                    }]);
            }]);

            QueryHelper::apply($query, $queryParams, 'paginate');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($query) use ($search) {
                    $query->where('email', 'LIKE', "%$search%")
                        ->orWhere('full_name', 'LIKE', "%$search%");
                });
            }

            $total = $query->count();
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            QueryHelper::applyLimitAndOffset($query, $limit, $page);

            return response()->json([
                'records' => $query->get(),
                'meta' => [
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred. Kindly check all the parameters provided. '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * Retrieve an archived (soft-deleted) user.
     */
    public function getArchivedUser(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        $record = User::onlyTrashed()->find($id);

        return response()->json($record, 200);
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restoreArchivedUser(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $record = User::onlyTrashed()->find($id);

            if (!$record) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            $record->restore();

            return response()->json($record, 200);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Get user roles by user ID.
     */
    public function getUserRoles(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        $record = User::where('id', $id)
            ->with(['rbac_user_roles' => function ($query) {
                $query->select('id', 'user_id', 'rbac_role_id')
                    ->with(['rbac_role' => function ($query) {
                        $query->select('id', 'label', 'value');
                    }]);
            }])
            ->first();

        if (!$record) {
            return response()->json(['message' => 'Record not found.'], 404);
        }

        return response()->json($record, 200);
    }

    /**
     * Update roles for a user.
     */
    public function updateUserRoles(Request $request, $id) {
        $authUser = $request->user();

        // check if user is an admin
        if (!$authUser->is_admin) {
            return response()->json([
                'message' => 'Access denied.',
            ], 403);
        }

        try {
            $user = User::find($id);

            if (!$user) {
                return response()->json(['message' => 'User not found.'], 404);
            }

            $user->rbac_roles()->sync($request->input('role_ids', []));

            return response()->json([
                'message' => 'User roles updated successfully.',
                'roles' => $user->rbac_roles,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error updating user roles',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Change the user's password.
     */
    public function changePassword(Request $request) {
        $authUser = $request->user();

        try {
            $currentPassword = $request->input('current_password');
            $newPassword = $request->input('new_password');
            $confirmNewPassword = $request->input('confirm_new_password');

            if (!$currentPassword || !$newPassword || !$confirmNewPassword) {
                return response()->json(['message' => 'All fields are required.'], 400);
            }

            if ($newPassword !== $confirmNewPassword) {
                return response()->json(['message' => 'New passwords do not match.'], 400);
            }

            if (!Hash::check($currentPassword, $authUser->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 400);
            }

            $authUser->password = Hash::make($newPassword);
            $authUser->save();

            return response()->json(['message' => 'Password changed successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Set the user's password.
     */
    public function setPassword(Request $request) {
        $authUser = $request->user();

        try {
            $newPassword = $request->input('new_password');
            $confirmNewPassword = $request->input('confirm_new_password');

            if (!$newPassword || !$confirmNewPassword) {
                return response()->json(['message' => 'All fields are required.'], 400);
            }

            if ($newPassword !== $confirmNewPassword) {
                return response()->json(['message' => 'New passwords do not match.'], 400);
            }

            $authUser->password = Hash::make($newPassword);
            $authUser->save();

            return response()->json(['message' => 'Password set successfully.'], 200);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update a user's profile.
     */
    public function updateProfile(Request $request) {
        $authUser = $request->user();

        try {
            $authUser->update($request->all());
            $authUser = UserHelper::getUser($authUser->email);

            return response()->json($authUser);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Update user's avatar.
     */
    public function updateProfileAvatar(Request $request) {
        $authUser = $request->user();

        try {
            // Make sure a file is actually uploaded
            if ($request->hasFile('avatar')) {
                $avatar = $request->file('avatar');

                $extension = $avatar->getClientOriginalExtension();
                $uniqueName = Str::uuid().'.'.$extension;

                // Upload the file
                $filePath = StorageHelper::uploadFileAs($avatar, 'avatars', $uniqueName);

                if (!$filePath) {
                    return response()->json([
                        'message' => "Failed to upload {$avatar->getClientOriginalName()}. File size too large.",
                    ], 400);
                }

                // Delete old avatar if it exists
                if ($authUser->avatar_path) {
                    StorageHelper::deleteFile($authUser->avatar_path);
                }

                // Save new avatar path
                $authUser->avatar_path = $filePath;
                $authUser->save();

                return response()->json([
                    'message' => 'Avatar updated successfully.',
                    'avatar_path' => $filePath,
                ]);
            }

            return response()->json(['message' => 'No avatar file provided.'], 400);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred.',
                'error' => $e->getMessage(),
            ], 400);
        }
    }

    /**
     * Update authenticated user's settings.
     */
    public function updateUserSettings(Request $request) {
        $authUser = $request->user();

        try {
            $userSetting = UserSetting::firstOrCreate(
                ['user_id' => $authUser->id],
                $request->all()
            );

            $userSetting->update($request->all());
            $authUser = UserHelper::getUser($authUser->email);

            return response()->json($authUser);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Get unread notifications count for the authenticated user.
     */
    public function getUnreadNotificationsCount(Request $request) {
        $authUser = $request->user();

        return response()->json([
            'unreadNotificationsCount' => UserNotification::where('user_id', $authUser->id)->where('is_read', false)->count(),
        ]);
    }

    /**
     * Get notifications for the authenticated user.
     */
    public function getAllNotifications(Request $request) {
        $authUser = $request->user();

        $queryParams = $request->all();

        try {
            $query = UserNotification::query();

            $type = 'paginate';
            QueryHelper::apply($query, $queryParams, $type);

            // sort by id desc
            $query->orderBy('id', 'desc');

            $total = $query->count();
            $limit = $request->input('limit', 10);
            $page = $request->input('page', 1);
            QueryHelper::applyLimitAndOffset($query, $limit, $page);
            $records = $query->get();

            return response()->json([
                'records' => $records,
                'meta' => [
                    'total_records' => $total,
                    'total_pages' => ceil($total / $limit),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred. Kindly check all the parameters provided. '.$e->getMessage(),
            ], 400);
        }
    }

    /**
     * View a specific notification.
     */
    public function viewNotification(Request $request, $id) {
        $authUser = $request->user();

        try {
            $notification = UserNotification::find($id);

            if (!$notification) {
                return response()->json(['message' => 'Notification not found'], 404);
            }

            $notification->is_read = true;
            $notification->save();

            return response()->json($notification);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsReadNotifications(Request $request) {
        $authUser = $request->user();

        try {
            UserNotification::where('user_id', $authUser->id)
                ->update(['is_read' => true]);

            return response()->json(['message' => 'Notifications marked as read']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred.', 'error' => $e->getMessage()], 400);
        }
    }
}
