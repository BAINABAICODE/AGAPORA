<?php
// backend/app/Models/SplitGene.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SplitGene extends Model
{
    use HasFactory;

    protected $table = 'split_genes';
    
    protected $fillable = ['name', 'inheritance', 'sex_restriction', 'available_in'];
    
    protected $casts = [
        'available_in' => 'array'
    ];
}