<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bird extends Model
{
    use HasFactory;

    protected $fillable = [
        'key',
        'name',
        'scientific_name',
        'description',
        'gradient_from',
        'gradient_to',
        'image_src',
    ];
}