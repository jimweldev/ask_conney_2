<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('rag_action_fields', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rag_action_id')->constrained('rag_actions')->onDelete('cascade');
            $table->integer('order')->default(0);
            $table->string('name');
            $table->string('type'); // string, dropdown
            $table->string('default_value')->nullable();
            $table->json('dropdown_options')->nullable(); // only for dropdown
            $table->boolean('is_required')->default(false);
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('rag_action_fields');
    }
};
