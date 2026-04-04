<?php

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
            $table->string('pair_name')->nullable();
            
            // Parent 1
            $table->string('parent1_id')->nullable();
            $table->string('parent1_name')->nullable();
            $table->string('parent1_species');
            $table->enum('parent1_sex', ['Male', 'Female']);
            $table->string('parent1_age')->nullable();
            $table->string('parent1_base_color');
            $table->integer('parent1_dark_factor')->default(0);
            $table->json('parent1_visual_mutations')->nullable();
            $table->json('parent1_splits')->nullable();
            
            // Parent 2
            $table->string('parent2_id')->nullable();
            $table->string('parent2_name')->nullable();
            $table->string('parent2_species');
            $table->enum('parent2_sex', ['Male', 'Female']);
            $table->string('parent2_age')->nullable();
            $table->string('parent2_base_color');
            $table->integer('parent2_dark_factor')->default(0);
            $table->json('parent2_visual_mutations')->nullable();
            $table->json('parent2_splits')->nullable();
            
            // Results
            $table->json('computation_results')->nullable();
            $table->json('compatibility_score')->nullable();
            $table->json('offspring_predictions')->nullable();
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('breeding_pairs');
    }
};