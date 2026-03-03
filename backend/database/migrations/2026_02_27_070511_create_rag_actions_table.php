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
            $table->text('description')->nullable();
            $table->json('default_values')->nullable();
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('rag_actions')->insert([
            [
                'name' => 'IT Helpdesk Support',
                'type' => 'ticket',
                'target_table' => 'tickets',
                'description' => 'Network, Internet, System Unit, Login, Keyboard, Remote, Support, Mouse, Application Error, Connection, Remote Desktop, System Unit, Beep, Audio, Microsoft, Azure, Office, Activation, Inventory, Hardware, VPN, Virtual Private Network, Latency, Headset, Softphone, UPS, Terminate Access, Email, Station Relocation, Seat Reservation',
                'default_values' => json_encode(['priority' => 'medium', 'project' => 'IT Helpdesk Support']),
            ],
            [
                'name' => 'MegaTool Support',
                'type' => 'ticket',
                'target_table' => 'tickets',
                'description' => 'Time Tracker, MegaTool Login Credential, Reset, Bugs, Errors',
                'default_values' => json_encode(['priority' => 'medium', 'project' => 'MegaTool Support']),
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
