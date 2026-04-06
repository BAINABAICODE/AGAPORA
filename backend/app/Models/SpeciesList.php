<?php
// backend/app/Models/SpeciesList.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpeciesList extends Model
{
    use HasFactory;

    protected $table = 'species_list';
    
    protected $fillable = ['name', 'group'];
}