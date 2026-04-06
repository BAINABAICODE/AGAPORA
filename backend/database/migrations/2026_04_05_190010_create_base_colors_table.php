<?php
// backend/database/migrations/2026_04_06_000003_create_base_colors_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('base_colors', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->integer('dark_factor')->default(0);
            $table->string('inheritance');
            $table->json('available_in');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('base_colors');
    }
};