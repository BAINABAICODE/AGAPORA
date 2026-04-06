<?php
// backend/database/migrations/2026_04_06_000001_create_breeding_pairs_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('breeding_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Parent 1 Information
            $table->string('parent1_bird_id')->nullable();
            $table->string('parent1_name')->nullable();
            $table->string('parent1_species');
            $table->enum('parent1_sex', ['Male', 'Female']);
            $table->integer('parent1_age')->nullable();
            $table->string('parent1_base_color');
            $table->json('parent1_visual_mutations')->nullable(); // JSON for multiple mutations
            $table->json('parent1_split_genes')->nullable();
            
            // Parent 2 Information
            $table->string('parent2_bird_id')->nullable();
            $table->string('parent2_name')->nullable();
            $table->string('parent2_species');
            $table->enum('parent2_sex', ['Male', 'Female']);
            $table->integer('parent2_age')->nullable();
            $table->string('parent2_base_color');
            $table->json('parent2_visual_mutations')->nullable(); // JSON for multiple mutations
            $table->json('parent2_split_genes')->nullable();
            
            // Genetic Data
            $table->json('parent1_genetic_data')->nullable();
            $table->json('parent2_genetic_data')->nullable();
            $table->json('grandparent_data')->nullable();
            $table->json('computation_results')->nullable(); // Store prediction results
            $table->enum('status', ['pending', 'completed', 'failed'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breeding_pairs');
    }
};