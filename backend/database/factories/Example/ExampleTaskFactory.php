<?php

namespace Database\Factories\Example;

use Illuminate\Database\Eloquent\Factories\Factory;

class ExampleTaskFactory extends Factory {
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array {
        $actions = [
            'Prepare', 'Review', 'Fix', 'Update', 'Create', 'Document',
            'Analyze', 'Design', 'Test', 'Optimize', 'Refactor', 'Implement',
            'Validate', 'Configure', 'Deploy', 'Schedule', 'Inspect', 'Verify',
            'Draft', 'Compile',
        ];

        $objects = [
            'API functionality', 'system configuration', 'login module',
            'database schema', 'project requirements', 'payment workflow',
            'notification settings', 'user dashboard', 'report templates',
            'deployment script', 'audit logs', 'security rules', 'email templates',
            'frontend layout', 'database backups', 'server environment',
            'queue workers', 'access controls', 'form validation logic',
            'test cases', 'error monitoring setup', 'webhook integration',
            'cache settings', 'session handling', 'authentication flow',
        ];

        return [
            'name' => $this->faker->randomElement($actions).' '.$this->faker->randomElement($objects),
            'status' => $this->faker->randomElement([
                'To Do',
                'In Progress',
                'Completed',
            ]),
        ];
    }
}
