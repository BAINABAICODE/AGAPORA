<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('birdms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('bird_id')->unique();
            $table->string('species');
            $table->enum('sex', ['Male', 'Female']);
            $table->integer('age_months')->nullable();
            $table->string('base_color');
            $table->integer('dark_factor')->default(0);
            $table->json('visual_mutations')->nullable();
            $table->json('splits')->nullable();
            $table->json('mother_data')->nullable();
            $table->json('father_data')->nullable();
            $table->json('grandparents_data')->nullable();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('birdms');
    }
};