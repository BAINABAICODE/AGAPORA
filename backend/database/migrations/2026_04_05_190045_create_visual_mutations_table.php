<?php
// backend/database/migrations/2026_04_06_000004_create_visual_mutations_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visual_mutations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('inheritance');
            $table->json('available_in');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visual_mutations');
    }
};