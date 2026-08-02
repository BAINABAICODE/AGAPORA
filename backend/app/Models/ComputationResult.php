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
     * Get summary of prediction (RBGIA + GICA)
     */
    public function getSummary()
    {
        $analysis = $this->genetic_analysis ?? [];
        $probabilities = $this->probabilities ?? [];
        $gica = $analysis['gica'] ?? [];
        $repro = $analysis['reproductive_forecast'] ?? [];

        return [
            'gica_score' => $gica['score'] ?? null,
            'gica_label' => $gica['label'] ?? null,
            'expected_hatchlings' => $repro['expected_hatchlings'] ?? null,
            'eggs_laid_mean' => $repro['eggs_laid_mean'] ?? null,
            'hatch_rate' => $repro['hatch_rate'] ?? null,
            'probabilities' => $probabilities,
            'fixed_n6_removed' => true,
        ];
    }

    /**
     * Top mutation probabilities from RBGIA
     */
    private function getCommonMutations($chicks)
    {
        $mutations = ($this->probabilities ?? [])['mutations'] ?? [];
        arsort($mutations);
        return array_slice($mutations, 0, 5, true);
    }
}