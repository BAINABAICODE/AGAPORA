<?php
// backend/app/Http/Controllers/GeneticComputationController.php

namespace App\Http\Controllers;

use App\Models\BreedingPair;
use App\Models\ComputationResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GeneticComputationController extends Controller
{
    public function computeAndPredict($breedingPairId)
    {
        try {
            $breedingPair = BreedingPair::where('user_id', Auth::id())
                ->findOrFail($breedingPairId);
            
            // Generate 6 unique chicks based on parent genetics
            $offspring = $this->generateOffspring($breedingPair);
            
            // Calculate probabilities
            $probabilities = $this->calculateProbabilities($offspring);
            
            // Prepare genetic analysis
            $geneticAnalysis = $this->prepareGeneticAnalysis($breedingPair);
            
            // Store results
            $computationResult = ComputationResult::updateOrCreate(
                ['breeding_pair_id' => $breedingPairId],
                [
                    'user_id' => Auth::id(),
                    'chicks_data' => $offspring,
                    'genetic_analysis' => $geneticAnalysis,
                    'probabilities' => $probabilities
                ]
            );
            
            // Update breeding pair status
            $breedingPair->update([
                'computation_results' => $offspring,
                'status' => 'completed'
            ]);
            
            return response()->json([
                'success' => true,
                'data' => [
                    'chicks' => $offspring,
                    'probabilities' => $probabilities,
                    'analysis' => $geneticAnalysis
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Computation failed: ' . $e->getMessage()
            ], 500);
        }
    }
    
    private function generateOffspring($breedingPair)
    {
        $offspring = [];
        $possibleColors = $this->getPossibleBaseColors($breedingPair);
        $possibleMutations = $this->getPossibleMutations($breedingPair);
        
        for ($i = 0; $i < 6; $i++) {
            // Select base color with probability
            $baseColor = $this->selectWithProbability($possibleColors);
            
            // Select mutations that appear
            $selectedMutations = [];
            foreach ($possibleMutations as $mutation => $probability) {
                if (rand(1, 100) <= $probability) {
                    $selectedMutations[] = $mutation;
                }
            }
            
            // Select split genes (random 0-3 from parents)
            $allSplits = array_merge(
                $breedingPair->parent1_split_genes ?? [],
                $breedingPair->parent2_split_genes ?? []
            );
            shuffle($allSplits);
            $selectedSplits = array_slice($allSplits, 0, rand(0, 3));
            
            // Random sex
            $sex = rand(0, 1) ? 'Male' : 'Female';
            
            $offspring[] = [
                'chick_number' => $i + 1,
                'sex' => $sex,
                'base_color' => $baseColor,
                'visual_mutations' => array_unique($selectedMutations),
                'split_genes' => array_unique($selectedSplits),
                'genetic_makeup' => $this->generateGeneticMakeup($baseColor, $selectedMutations, $selectedSplits)
            ];
        }
        
        return $offspring;
    }
    
    private function getPossibleBaseColors($breedingPair)
    {
        $color1 = $breedingPair->parent1_base_color;
        $color2 = $breedingPair->parent2_base_color;
        
        // Punnett square results
        $combinations = [];
        
        // Green series
        if ($color1 === 'Green' && $color2 === 'Green') {
            $combinations = ['Green' => 100];
        } elseif ($color1 === 'Green' && $color2 === 'Blue') {
            $combinations = ['Green' => 100];
        } elseif ($color1 === 'Blue' && $color2 === 'Blue') {
            $combinations = ['Blue' => 100];
        } elseif ($color1 === 'Green' && $color2 === 'Dark Green') {
            $combinations = ['Green' => 50, 'Dark Green' => 50];
        } elseif ($color1 === 'Dark Green' && $color2 === 'Dark Green') {
            $combinations = ['Green' => 25, 'Dark Green' => 50, 'Olive' => 25];
        } else {
            $combinations = [$color1 => 100];
        }
        
        return $combinations;
    }
    
    private function getPossibleMutations($breedingPair)
    {
        $mutations = [];
        $parent1Visuals = $breedingPair->parent1_visual_mutations ?? [];
        $parent2Visuals = $breedingPair->parent2_visual_mutations ?? [];
        
        $allVisuals = array_unique(array_merge($parent1Visuals, $parent2Visuals));
        
        foreach ($allVisuals as $mutation) {
            $parent1Has = in_array($mutation, $parent1Visuals);
            $parent2Has = in_array($mutation, $parent2Visuals);
            
            if ($parent1Has && $parent2Has) {
                $mutations[$mutation] = 75; // Both parents visual
            } elseif ($parent1Has || $parent2Has) {
                $mutations[$mutation] = 50; // One parent visual
            }
        }
        
        return $mutations;
    }
    
    private function selectWithProbability($options)
    {
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($options as $option => $probability) {
            $cumulative += $probability;
            if ($rand <= $cumulative) {
                return $option;
            }
        }
        
        return array_key_first($options);
    }
    
    private function generateGeneticMakeup($baseColor, $visualMutations, $splitGenes)
    {
        $makeup = $baseColor;
        
        if (!empty($visualMutations)) {
            $makeup .= ' + ' . implode(', ', $visualMutations);
        }
        
        if (!empty($splitGenes)) {
            $makeup .= ' / ' . implode(', ', $splitGenes);
        }
        
        return $makeup;
    }
    
    private function calculateProbabilities($offspring)
    {
        $total = count($offspring);
        $probabilities = [];
        
        // Base color probabilities
        $baseColors = [];
        foreach ($offspring as $chick) {
            $color = $chick['base_color'];
            $baseColors[$color] = ($baseColors[$color] ?? 0) + 1;
        }
        
        foreach ($baseColors as $color => $count) {
            $probabilities['base_colors'][$color] = round(($count / $total) * 100, 1);
        }
        
        // Sex probabilities
        $males = count(array_filter($offspring, fn($c) => $c['sex'] === 'Male'));
        $probabilities['sex'] = [
            'Male' => round(($males / $total) * 100, 1),
            'Female' => round((($total - $males) / $total) * 100, 1)
        ];
        
        // Mutation probabilities
        $mutations = [];
        foreach ($offspring as $chick) {
            foreach ($chick['visual_mutations'] as $mutation) {
                $mutations[$mutation] = ($mutations[$mutation] ?? 0) + 1;
            }
        }
        
        foreach ($mutations as $mutation => $count) {
            $probabilities['mutations'][$mutation] = round(($count / $total) * 100, 1);
        }
        
        return $probabilities;
    }
    
    private function prepareGeneticAnalysis($breedingPair)
    {
        return [
            'parent1' => [
                'species' => $breedingPair->parent1_species,
                'sex' => $breedingPair->parent1_sex,
                'base_color' => $breedingPair->parent1_base_color,
                'visual_mutations' => $breedingPair->parent1_visual_mutations ?? [],
                'split_genes' => $breedingPair->parent1_split_genes ?? []
            ],
            'parent2' => [
                'species' => $breedingPair->parent2_species,
                'sex' => $breedingPair->parent2_sex,
                'base_color' => $breedingPair->parent2_base_color,
                'visual_mutations' => $breedingPair->parent2_visual_mutations ?? [],
                'split_genes' => $breedingPair->parent2_split_genes ?? []
            ],
            'inheritance_rules' => [
                'base_color' => 'Autosomal',
                'visual_mutations' => 'Various (Dominant/Recessive/Sex-linked)',
                'split_genes' => 'Recessive carriers'
            ]
        ];
    }
    
    public function getComputationResult($breedingPairId)
    {
        $result = ComputationResult::where('breeding_pair_id', $breedingPairId)
            ->where('user_id', Auth::id())
            ->first();
        
        if (!$result) {
            return response()->json([
                'success' => false,
                'message' => 'No computation result found'
            ], 404);
        }
        
        // Load breeding pair data
        $breedingPair = BreedingPair::find($breedingPairId);
        $result->breeding_pair = $breedingPair;
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
}