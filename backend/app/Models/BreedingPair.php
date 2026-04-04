<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BreedingPair extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'pair_name',
        'parent1_id', 'parent1_name', 'parent1_species', 'parent1_sex',
        'parent1_age', 'parent1_base_color', 'parent1_dark_factor',
        'parent1_visual_mutations', 'parent1_splits',
        'parent2_id', 'parent2_name', 'parent2_species', 'parent2_sex',
        'parent2_age', 'parent2_base_color', 'parent2_dark_factor',
        'parent2_visual_mutations', 'parent2_splits',
        'computation_results', 'compatibility_score', 'offspring_predictions'
    ];

    protected $casts = [
        'parent1_visual_mutations' => 'array',
        'parent1_splits' => 'array',
        'parent2_visual_mutations' => 'array',
        'parent2_splits' => 'array',
        'computation_results' => 'array',
        'compatibility_score' => 'array',
        'offspring_predictions' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}