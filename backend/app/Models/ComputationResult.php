<?php
// backend/app/Models/ComputationResult.php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ComputationResult extends Model
{
    use HasFactory;

    protected $table = 'computation_results';

    protected $fillable = [
        'breeding_pair_id',
        'user_id',
        'chicks_data',
        'genetic_analysis',
        'probabilities'
    ];

    protected $casts = [
        'chicks_data' => 'array',
        'genetic_analysis' => 'array',
        'probabilities' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the breeding pair that owns this computation result
     */
    public function breedingPair()
    {
        return $this->belongsTo(BreedingPair::class);
    }

    /**
     * Get the user that owns this computation result
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get chicks data as array
     */
    public function getChicksDataAttribute($value)
    {
        return json_decode($value, true);
    }

    /**
     * Get genetic analysis as array
     */
    public function getGeneticAnalysisAttribute($value)
    {
        return json_decode($value, true);
    }

    /**
     * Get probabilities as array
     */
    public function getProbabilitiesAttribute($value)
    {
        return json_decode($value, true);
    }

    /**
     * Set chicks data as JSON
     */
    public function setChicksDataAttribute($value)
    {
        $this->attributes['chicks_data'] = json_encode($value);
    }

    /**
     * Set genetic analysis as JSON
     */
    public function setGeneticAnalysisAttribute($value)
    {
        $this->attributes['genetic_analysis'] = json_encode($value);
    }

    /**
     * Set probabilities as JSON
     */
    public function setProbabilitiesAttribute($value)
    {
        $this->attributes['probabilities'] = json_encode($value);
    }

    /**
     * Get formatted chicks data for display
     */
    public function getFormattedChicks()
    {
        $chicks = $this->chicks_data;
        if (!is_array($chicks)) {
            return [];
        }
        
        return array_map(function($chick, $index) {
            return [
                'number' => $index + 1,
                'sex' => $chick['sex'] ?? 'Unknown',
                'base_color' => $chick['base_color'] ?? 'Unknown',
                'visual_mutations' => $chick['visual_mutations'] ?? [],
                'split_genes' => $chick['split_genes'] ?? [],
                'genetic_makeup' => $chick['genetic_makeup'] ?? 'Not available'
            ];
        }, $chicks, array_keys($chicks));
    }

    /**
     * Get summary of prediction
     */
    public function getSummary()
    {
        $chicks = $this->getFormattedChicks();
        $probabilities = $this->probabilities;
        
        return [
            'total_chicks' => count($chicks),
            'male_count' => count(array_filter($chicks, fn($c) => $c['sex'] === 'Male')),
            'female_count' => count(array_filter($chicks, fn($c) => $c['sex'] === 'Female')),
            'unique_base_colors' => array_unique(array_column($chicks, 'base_color')),
            'common_mutations' => $this->getCommonMutations($chicks),
            'probabilities' => $probabilities
        ];
    }

    /**
     * Get common mutations across chicks
     */
    private function getCommonMutations($chicks)
    {
        $allMutations = [];
        foreach ($chicks as $chick) {
            foreach ($chick['visual_mutations'] as $mutation) {
                $allMutations[$mutation] = ($allMutations[$mutation] ?? 0) + 1;
            }
        }
        
        arsort($allMutations);
        return array_slice($allMutations, 0, 5, true);
    }
}