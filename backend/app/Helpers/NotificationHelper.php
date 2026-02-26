<?php

namespace App\Helpers;

use App\Models\User\UserNotification;

class NotificationHelper {
    /**
     * Check if the given user has the specified permission.
     */
    public static function createNotification($userId, $content) {
        // add user_id to content
        $content['user_id'] = $userId;

        UserNotification::create($content);
    }
}
