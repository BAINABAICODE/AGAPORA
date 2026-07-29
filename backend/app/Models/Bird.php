<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bird extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'bird_id',
        'name',
        'species',
        'sex',
        'age',
        'base_color',
        'visual_mutations',
        'split_genes',
        'genetic_data',
        'grandparent_data',
        'status',
    ];

    protected $casts = [
        'visual_mutations' => 'array',
        'split_genes' => 'array',
        'genetic_data' => 'array',
        'grandparent_data' => 'array',
        'age' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
