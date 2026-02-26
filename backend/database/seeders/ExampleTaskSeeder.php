<?php

namespace Database\Seeders;

use App\Helpers\DynamicLogger;
use App\Models\Example\ExampleTask;
use Illuminate\Database\Seeder;

class ExampleTaskSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        $logger = DynamicLogger::create('laravel.log', 'local');
        try {
            ExampleTask::factory()->count(500)->create();
        } catch (\Throwable $th) {
            $logger->error($th->getMessage());
        }
    }
}
