<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // Basic user info
            $table->string('first_name');
            $table->string('middle_name')->nullable();
            $table->string('last_name');
            $table->string('suffix')->nullable();

            // Automatically concatenated full name
            // CONCAT_WS avoids double spaces for NULL middle/suffix
            $table->string('full_name')
                ->storedAs("
                    trim(
                        both ' ' from
                        coalesce(first_name, '') || ' ' ||
                        coalesce(middle_name, '') || ' ' ||
                        coalesce(last_name, '') || ' ' ||
                        coalesce(suffix, '')
                    )
                ")
                ->index();

            // Other profile fields
            $table->string('avatar_path')->nullable();
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->boolean('is_admin')->default(false);
            $table->string('account_type')->default('Main');
            $table->string('two_factor_secret')->nullable();
            $table->boolean('is_two_factor_enabled')->default(false);

            // Soft delete + timestamps
            $table->softDeletes();
            $table->timestamp('created_at')->useCurrent();
            $table->timestamp('updated_at')->useCurrent()->useCurrentOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void {
        Schema::dropIfExists('users');
    }
};
