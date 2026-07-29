<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('birds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('bird_id')->nullable();
            $table->string('name')->nullable();
            $table->string('species');
            $table->enum('sex', ['Male', 'Female']);
            $table->unsignedInteger('age')->nullable();
            $table->string('base_color');
            $table->json('visual_mutations')->nullable();
            $table->json('split_genes')->nullable();
            $table->json('genetic_data')->nullable();
            $table->json('grandparent_data')->nullable();
            $table->string('status')->default('active');
            $table->timestamps();

            $table->index(['user_id', 'species']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('birds');
    }
};
