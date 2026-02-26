<?php

namespace Database\Seeders;

use App\Models\User\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    /**
     * Seed the application's database.
     */
    public function run(): void {
        $defaultPassword = env('DEFAULT_PASSWORD', 'P@ssword123!');

        User::factory()->create([
            'first_name' => 'Connext',
            'middle_name' => null,
            'last_name' => 'Admin',
            'suffix' => null,
            'email' => 'admin@connextglobal.com',
            'is_admin' => true,
            'password' => Hash::make($defaultPassword),
        ]);

        User::factory(500)->create();

        // Run the database seeds
        $this->call([
            MailTemplateSeeder::class,
        ]);
        $this->call([
            NotificationSeeder::class,
        ]);
        $this->call([
            SystemDropdownSeeder::class,
        ]);
        $this->call([
            ExampleTaskSeeder::class,
        ]);
    }
}
