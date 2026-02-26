<?php

namespace Database\Seeders;

use App\Helpers\DynamicLogger;
use App\Models\System\SystemDropdown;
use App\Models\System\SystemDropdownModule;
// logger helper
use App\Models\System\SystemDropdownModuleType;
use Illuminate\Database\Seeder;

class SystemDropdownSeeder extends Seeder {
    /**
     * Run the database seeds.
     */
    public function run(): void {
        $logger = DynamicLogger::create('laravel.log', 'local');

        try {
            // create `system` module
            $module = SystemDropdownModule::create([
                'label' => 'System',
            ]);

            // create `color` module type
            $moduleType = SystemDropdownModuleType::create([
                'label' => 'Color',
                'system_dropdown_module_id' => $module->id,
            ]);

            $dropdowns = [
                ['label' => 'Ocean', 'order' => 1, 'properties' => ['color' => '#00B8D9', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Blue', 'order' => 2, 'properties' => ['color' => '#0052CC', 'type' => 'circle', 'isDisabled' => true]],
                ['label' => 'Purple', 'order' => 3, 'properties' => ['color' => '#5243AA', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Red', 'order' => 4, 'properties' => ['color' => '#FF5630', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Orange', 'order' => 5, 'properties' => ['color' => '#FF8B00', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Yellow', 'order' => 6, 'properties' => ['color' => '#FFC400', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Green', 'order' => 7, 'properties' => ['color' => '#36B37E', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Forest', 'order' => 8, 'properties' => ['color' => '#00875A', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Slate', 'order' => 9, 'properties' => ['color' => '#253858', 'type' => 'circle', 'isDisabled' => false]],
                ['label' => 'Silver', 'order' => 10, 'properties' => ['color' => '#666666', 'type' => 'circle', 'isDisabled' => false]],
            ];

            // create dropdowns
            foreach ($dropdowns as $dropdown) {
                SystemDropdown::create([
                    'module' => $module->label,
                    'type' => $moduleType->label,
                    'label' => $dropdown['label'],
                    'order' => $dropdown['order'],
                    'properties' => $dropdown['properties'],
                ]);
            }

            // create `Company` module
            $module = SystemDropdownModule::create([
                'label' => 'Company',
            ]);

            // create `Location` module type
            $moduleType = SystemDropdownModuleType::create([
                'label' => 'Location',
                'system_dropdown_module_id' => $module->id,
            ]);

            $dropdowns = [
                ['label' => 'Philippines'],
                ['label' => 'Colombia'],
                ['label' => 'Hawaii'],
                ['label' => 'India'],
            ];

            // create dropdowns
            foreach ($dropdowns as $dropdown) {
                SystemDropdown::create([
                    'module' => $module->label,
                    'type' => $moduleType->label,
                    'label' => $dropdown['label'],
                    'order' => 1,
                ]);
            }

            // create `Position` module type
            $moduleType = SystemDropdownModuleType::create([
                'label' => 'Position',
                'system_dropdown_module_id' => $module->id,
            ]);

            $dropdowns = [
                ['label' => 'Manager'],
                ['label' => 'Supervisor'],
            ];

            // create dropdowns
            foreach ($dropdowns as $dropdown) {
                SystemDropdown::create([
                    'module' => $module->label,
                    'type' => $moduleType->label,
                    'label' => $dropdown['label'],
                    'order' => 1,
                ]);
            }

            // create `Website` module type
            $moduleType = SystemDropdownModuleType::create([
                'label' => 'Website',
                'system_dropdown_module_id' => $module->id,
            ]);

            $dropdowns = [
                ['label' => 'MegaTool'],
                ['label' => 'Community of Talent'],
            ];

            // create dropdowns
            foreach ($dropdowns as $dropdown) {
                SystemDropdown::create([
                    'module' => $module->label,
                    'type' => $moduleType->label,
                    'label' => $dropdown['label'],
                    'order' => 1,
                ]);
            }
        } catch (\Throwable $th) {
            // throw $th;
            $logger->error($th->getMessage());
        }
    }
}
