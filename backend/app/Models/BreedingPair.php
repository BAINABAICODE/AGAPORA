<?php
// backend/app/Models/BreedingPair.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BreedingPair extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'parent1_bird_id',
        'parent1_name',
        'parent1_species',
        'parent1_sex',
        'parent1_age',
        'parent1_base_color',
        'parent1_visual_mutations',  // Changed from singular to plural to match frontend
        'parent1_split_genes',
        'parent2_bird_id',
        'parent2_name',
        'parent2_species',
        'parent2_sex',
        'parent2_age',
        'parent2_base_color',
        'parent2_visual_mutations',  // Changed from singular to plural to match frontend
        'parent2_split_genes',
        'parent1_genetic_data',
        'parent2_genetic_data',
        'grandparent_data',
        'status',
        'notes'
    ];

    protected $casts = [
        'parent1_visual_mutations' => 'array',  // Added array cast for mutations
        'parent1_split_genes' => 'array',
        'parent2_visual_mutations' => 'array',  // Added array cast for mutations
        'parent2_split_genes' => 'array',
        'parent1_genetic_data' => 'array',
        'parent2_genetic_data' => 'array',
        'grandparent_data' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function computationResult()
    {
        return $this->hasOne(ComputationResult::class);
    }
}