<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('rag_actions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('type');
            $table->string('target_table')->nullable();
            $table->string('keywords')->nullable();
            $table->string('default_values')->nullable();
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('rag_actions')->insert([
            [
                'name' => 'IT Helpdesk Support',
                'type' => 'ticket',
                'target_table' => 'tickets',
                'keywords' => json_encode(['IT', 'keyboard', 'mouse', 'computer', 'printer']),
                'default_values' => json_encode(['priority' => 'medium', 'project' => 'IT Helpdesk Support']),
            ],
            [
                'name' => 'MegaTool Support',
                'type' => 'ticket',
                'target_table' => 'tickets',
                'keywords' => json_encode(['website', 'web', 'MegaTool']),
                'default_values' => json_encode(['priority' => 'medium', 'project' => 'MegaTool Support']),
            ],
            [
                'name' => 'Connext Travel',
                'type' => 'ticket',
                'target_table' => 'tickets',
                'keywords' => json_encode(['hotel', 'transportation', 'flight', 'booking']),
                'default_values' => json_encode(['priority' => 'medium', 'project' => 'Connext Travel']),
            ],
            [
                'name' => 'Payroll Dispute',
                'type' => 'dispute',
                'target_table' => 'disputes',
                'keywords' => json_encode(['payroll', 'salary', 'pay', 'dispute']),
                'default_values' => json_encode(['priority' => 'medium']),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('rag_actions');
    }
};
