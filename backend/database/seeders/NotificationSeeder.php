<?php

namespace Database\Seeders;

use App\Helpers\NotificationHelper;
use Illuminate\Database\Seeder;

class NotificationSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        try {
            NotificationHelper::createNotification(1, [
                'type' => 'notification',
                'title' => 'Notification link',
                'message' => 'This is a notification will redirect to a link',
                'link' => '/examples/forms',
            ]);
            NotificationHelper::createNotification(1, [
                'type' => 'notification',
                'title' => 'Notification link that will open a dialog',
                'message' => 'This is a notification will redirect to a link that will open a dialog',
                'link' => '/examples/data-table/list-grid?dialog=create',
            ]);
        } catch (\Throwable $th) {
            // throw $th;
        }
    }
}
