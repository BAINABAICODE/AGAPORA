<?php
// backend/database/migrations/2026_04_06_000005_create_split_genes_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('split_genes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('inheritance');
            $table->string('sex_restriction');
            $table->json('available_in');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('split_genes');
    }
};