<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        // Ensure the vector extension is installed
        Schema::ensureVectorExtensionExists();

        Schema::create('rag_files', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->json('allowed_locations')->nullable();
            $table->json('allowed_positions')->nullable();
            $table->json('allowed_websites')->nullable();
            $table->string('file_path');
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('rag_files');
    }
};
