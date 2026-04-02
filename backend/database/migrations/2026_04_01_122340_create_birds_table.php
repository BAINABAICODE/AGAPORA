<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateBirdsTable extends Migration
{
    public function up()
    {
        Schema::create('birds', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('name');
            $table->string('scientific_name');
            $table->text('description');
            $table->string('gradient_from');
            $table->string('gradient_to');
            $table->string('image_src');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('birds');
    }
}