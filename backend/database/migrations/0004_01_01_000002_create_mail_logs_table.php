<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('mail_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('mail_template_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade');
            $table->string('subject');
            $table->string('recipient_email');
            $table->json('cc')->nullable();
            $table->json('bcc')->nullable();
            $table->boolean('is_sent')->default(false);
            $table->json('content_data')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('mail_logs');
    }
};
