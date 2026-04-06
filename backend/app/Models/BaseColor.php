<?php
// backend/app/Models/BaseColor.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BaseColor extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'dark_factor', 'inheritance', 'available_in'];
    
    protected $casts = [
        'available_in' => 'array'
    ];
}