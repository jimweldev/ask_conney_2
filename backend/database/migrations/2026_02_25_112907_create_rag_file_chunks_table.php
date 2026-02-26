<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('rag_file_chunks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('rag_file_id')->constrained('rag_files')->onDelete('cascade');
            $table->integer('chunk_index');
            $table->text('content');
            $table->vector('embeddings', 768)->nullable()->index();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('rag_file_chunks');
    }
};
