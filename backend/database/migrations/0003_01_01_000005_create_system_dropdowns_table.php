<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('system_dropdowns', function (Blueprint $table) {
            $table->id();
            $table->string('label')->index();
            $table->string('module')->index();
            $table->string('type')->index();
            $table->integer('order')->default(0);
            $table->json('properties')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('system_dropdowns');
    }
};
