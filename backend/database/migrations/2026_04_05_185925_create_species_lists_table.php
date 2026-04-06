<?php
// backend/database/migrations/2026_04_06_000002_create_species_list_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('species_list', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('group'); // 'Eye ring' or 'Non-eye ring'
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('species_list');
    }
};