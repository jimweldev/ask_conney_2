<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('rag_actions', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('endpoint')->nullable();            
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });

        DB::table('rag_actions')->insert([
            [
                'name' => 'IT Helpdesk Support',
                'description' => 'Network, Internet, System Unit, Login, Keyboard, Remote, Support, Mouse, Application Error, Connection, Remote Desktop, System Unit, Beep, Audio, Microsoft, Azure, Office, Activation, Inventory, Hardware, VPN, Virtual Private Network, Latency, Headset, Softphone, UPS, Terminate Access, Email, Station Relocation, Seat Reservation',
                'endpoint' => 'https://test-megaform-api.connextglobal.com/ticketing-system/ticket'
            ],
            [
                'name' => 'MegaTool Support',
                'description' => 'Time Tracker, MegaTool Login Credential, Reset, Bugs, Errors',
                'endpoint' => 'https://test-megaform-api.connextglobal.com/ticketing-system/ticket'
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
