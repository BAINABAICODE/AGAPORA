<?php
// backend/app/Models/VisualMutation.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VisualMutation extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'inheritance', 'available_in'];
    
    protected $casts = [
        'available_in' => 'array'
    ];
}