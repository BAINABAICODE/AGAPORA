<?php
// backend/database/migrations/2026_04_06_000006_create_computation_results_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('computation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('breeding_pair_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->json('chicks_data'); // Store 6 chicks genetic data
            $table->json('genetic_analysis');
            $table->json('probabilities');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('computation_results');
    }
};