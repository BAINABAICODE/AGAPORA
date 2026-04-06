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
        $breedingPair = BreedingPair::where('user_id', Auth::id())
            ->findOrFail($breedingPairId);
        
        // Step 1: Genetic Data Encoding
        $encodedData = $this->encodeGeneticData($breedingPair);
        
        // Step 2: Rule-Based Genetic Inheritance Algorithm
        $inheritanceRules = $this->applyInheritanceRules($encodedData);
        
        // Step 3: Genetic Algorithm with advanced operators
        $offspring = $this->runGeneticAlgorithm($encodedData, $inheritanceRules);
        
        // Calculate probabilities
        $probabilities = $this->calculateProbabilities($offspring);
        
        // Store results
        $computationResult = ComputationResult::updateOrCreate(
            ['breeding_pair_id' => $breedingPairId],
            [
                'user_id' => Auth::id(),
                'chicks_data' => $offspring,
                'genetic_analysis' => $inheritanceRules,
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
                'analysis' => $inheritanceRules
            ]
        ]);
    }
    
    private function encodeGeneticData($breedingPair)
    {
        // Encode genetic information into numerical format
        return [
            'parent1' => [
                'base_color' => $this->encodeBaseColor($breedingPair->parent1_base_color),
                'visual_mutations' => $breedingPair->parent1_visual_mutations ?? [],
                'split_genes' => $breedingPair->parent1_split_genes ?? [],
                'sex' => $breedingPair->parent1_sex
            ],
            'parent2' => [
                'base_color' => $this->encodeBaseColor($breedingPair->parent2_base_color),
                'visual_mutations' => $breedingPair->parent2_visual_mutations ?? [],
                'split_genes' => $breedingPair->parent2_split_genes ?? [],
                'sex' => $breedingPair->parent2_sex
            ]
        ];
    }
    
    private function encodeBaseColor($color)
    {
        $colorMap = [
            'Green' => 'GG',
            'Dark Green' => 'Gd',
            'Olive' => 'dd',
            'Blue' => 'bb',
            'Cobalt' => 'bc',
            'Mauve' => 'bm',
            'Aqua (Dutch Blue)' => 'aq',
            'Turquoise (Whitefaced Blue)' => 'tq'
        ];
        return $colorMap[$color] ?? 'GG';
    }
    
    private function applyInheritanceRules($encodedData)
    {
        $rules = [];
        
        // Base color inheritance rules
        $baseColorInheritance = $this->calculateBaseColorInheritance(
            $encodedData['parent1']['base_color'],
            $encodedData['parent2']['base_color']
        );
        $rules['base_color'] = $baseColorInheritance;
        
        // Sex-linked mutation rules
        $sexLinkedRules = $this->calculateSexLinkedInheritance($encodedData);
        $rules['sex_linked'] = $sexLinkedRules;
        
        // Recessive mutation rules
        $recessiveRules = $this->calculateRecessiveInheritance($encodedData);
        $rules['recessive'] = $recessiveRules;
        
        // Dominant mutation rules
        $dominantRules = $this->calculateDominantInheritance($encodedData);
        $rules['dominant'] = $dominantRules;
        
        return $rules;
    }
    
    private function calculateBaseColorInheritance($parent1Color, $parent2Color)
    {
        // Simplified Punnett square for base colors
        $possibleColors = [];
        
        if ($parent1Color === 'GG' && $parent2Color === 'GG') {
            $possibleColors = ['Green' => 100];
        } elseif ($parent1Color === 'GG' && $parent2Color === 'bb') {
            $possibleColors = ['Green' => 100];
        } elseif ($parent1Color === 'bb' && $parent2Color === 'bb') {
            $possibleColors = ['Blue' => 100];
        } elseif (($parent1Color === 'GG' && $parent2Color === 'Gd') ||
                  ($parent1Color === 'Gd' && $parent2Color === 'GG')) {
            $possibleColors = ['Green' => 50, 'Dark Green' => 50];
        } elseif ($parent1Color === 'Gd' && $parent2Color === 'Gd') {
            $possibleColors = ['Green' => 25, 'Dark Green' => 50, 'Olive' => 25];
        }
        
        return $possibleColors;
    }
    
    private function calculateSexLinkedInheritance($encodedData)
    {
        $mutations = [];
        $parent1Mutations = $encodedData['parent1']['visual_mutations'];
        $parent2Mutations = $encodedData['parent2']['visual_mutations'];
        $parent1Sex = $encodedData['parent1']['sex'];
        $parent2Sex = $encodedData['parent2']['sex'];
        
        // Lutino, Opaline, Cinnamon are sex-linked recessive
        $sexLinkedMutations = ['Lutino', 'Opaline', 'American Cinnamon', 'Pallid', 'Creamino'];
        
        foreach ($sexLinkedMutations as $mutation) {
            $probability = 0;
            $parent1Has = in_array($mutation, $parent1Mutations);
            $parent2Has = in_array($mutation, $parent2Mutations);
            
            if ($parent1Sex === 'Male' && $parent2Sex === 'Female') {
                if ($parent1Has && $parent2Has) $probability = 100;
                elseif ($parent1Has && !$parent2Has) $probability = 50;
                elseif (!$parent1Has && $parent2Has) $probability = 0;
            } elseif ($parent1Sex === 'Female' && $parent2Sex === 'Male') {
                if ($parent1Has && $parent2Has) $probability = 100;
                elseif ($parent1Has && !$parent2Has) $probability = 0;
                elseif (!$parent1Has && $parent2Has) $probability = 50;
            }
            
            if ($probability > 0) {
                $mutations[$mutation] = $probability;
            }
        }
        
        return $mutations;
    }
    
    private function calculateRecessiveInheritance($encodedData)
    {
        $recessiveMutations = ['Pied', 'Pastel', 'Dilute', 'White Face', 'Fallow', 'Dark-eyed Clear'];
        $inheritance = [];
        
        $parent1Splits = $encodedData['parent1']['split_genes'];
        $parent2Splits = $encodedData['parent2']['split_genes'];
        
        foreach ($recessiveMutations as $mutation) {
            $parent1Split = in_array("split to $mutation", $parent1Splits);
            $parent2Split = in_array("split to $mutation", $parent2Splits);
            $parent1Visual = in_array($mutation, $encodedData['parent1']['visual_mutations']);
            $parent2Visual = in_array($mutation, $encodedData['parent2']['visual_mutations']);
            
            $probability = 0;
            
            if ($parent1Visual && $parent2Visual) {
                $probability = 100;
            } elseif (($parent1Visual && $parent2Split) || ($parent2Visual && $parent1Split)) {
                $probability = 50;
            } elseif ($parent1Split && $parent2Split) {
                $probability = 25;
            } elseif ($parent1Visual || $parent2Visual) {
                $probability = 50;
            }
            
            if ($probability > 0) {
                $inheritance[$mutation] = $probability;
            }
        }
        
        return $inheritance;
    }
    
    private function calculateDominantInheritance($encodedData)
    {
        $dominantMutations = ['Dominant Pied', 'Dominant Edged', 'Euwing', 'Dominant Yellow'];
        $inheritance = [];
        
        $parent1Visuals = $encodedData['parent1']['visual_mutations'];
        $parent2Visuals = $encodedData['parent2']['visual_mutations'];
        
        foreach ($dominantMutations as $mutation) {
            $parent1Has = in_array($mutation, $parent1Visuals);
            $parent2Has = in_array($mutation, $parent2Visuals);
            
            if ($parent1Has || $parent2Has) {
                $probability = 50;
                if ($parent1Has && $parent2Has) {
                    $probability = 75;
                }
                $inheritance[$mutation] = $probability;
            }
        }
        
        return $inheritance;
    }
    
    private function runGeneticAlgorithm($encodedData, $inheritanceRules)
    {
        $offspring = [];
        
        // Generate 6 chicks
        for ($i = 0; $i < 6; $i++) {
            // Rank Selection for traits
            $baseColor = $this->rankSelection($inheritanceRules['base_color']);
            
            // Parameterized Uniform Crossover
            $visualMutations = $this->uniformCrossover(
                $encodedData['parent1']['visual_mutations'],
                $encodedData['parent2']['visual_mutations']
            );
            
            // Mutation with Random Resetting + Inversion
            $splitGenes = $this->applyMutation(
                array_merge(
                    $encodedData['parent1']['split_genes'],
                    $encodedData['parent2']['split_genes']
                )
            );
            
            // Determine sex (50/50 chance)
            $sex = rand(0, 1) ? 'Male' : 'Female';
            
            $offspring[] = [
                'chick_number' => $i + 1,
                'sex' => $sex,
                'base_color' => $baseColor,
                'visual_mutations' => $visualMutations,
                'split_genes' => $splitGenes,
                'genetic_makeup' => $this->generateGeneticMakeup($baseColor, $visualMutations, $splitGenes)
            ];
        }
        
        return $offspring;
    }
    
    private function rankSelection($probabilities)
    {
        $rand = rand(1, 100);
        $cumulative = 0;
        
        foreach ($probabilities as $trait => $probability) {
            $cumulative += $probability;
            if ($rand <= $cumulative) {
                return $trait;
            }
        }
        
        return array_key_first($probabilities);
    }
    
    private function uniformCrossover($parent1Genes, $parent2Genes)
    {
        $offspring = [];
        
        // 50% chance from each parent for each gene
        for ($i = 0; $i < count(array_unique(array_merge($parent1Genes, $parent2Genes))); $i++) {
            if (rand(0, 1)) {
                $offspring[] = $parent1Genes[$i] ?? null;
            } else {
                $offspring[] = $parent2Genes[$i] ?? null;
            }
        }
        
        return array_filter($offspring);
    }
    
    private function applyMutation($genes)
    {
        // 5% chance of mutation
        if (rand(1, 100) <= 5) {
            // Random resetting or inversion
            if (rand(0, 1)) {
                // Random resetting - add a random gene
                $genes[] = 'split to Random Gene';
            } else {
                // Inversion mutation - reverse a segment
                if (count($genes) > 1) {
                    $start = rand(0, count($genes) - 2);
                    $end = rand($start + 1, count($genes) - 1);
                    $reversed = array_reverse(array_slice($genes, $start, $end - $start + 1));
                    array_splice($genes, $start, $end - $start + 1, $reversed);
                }
            }
        }
        
        return array_unique($genes);
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
        $probabilities = [];
        $total = count($offspring);
        
        // Calculate base color probabilities
        $baseColors = array_count_values(array_column($offspring, 'base_color'));
        foreach ($baseColors as $color => $count) {
            $probabilities['base_colors'][$color] = round(($count / $total) * 100, 1);
        }
        
        // Calculate mutation probabilities
        $allMutations = [];
        foreach ($offspring as $chick) {
            foreach ($chick['visual_mutations'] as $mutation) {
                $allMutations[$mutation] = ($allMutations[$mutation] ?? 0) + 1;
            }
        }
        
        foreach ($allMutations as $mutation => $count) {
            $probabilities['mutations'][$mutation] = round(($count / $total) * 100, 1);
        }
        
        // Sex probability
        $males = count(array_filter($offspring, fn($c) => $c['sex'] === 'Male'));
        $probabilities['sex'] = [
            'Male' => round(($males / $total) * 100, 1),
            'Female' => round((($total - $males) / $total) * 100, 1)
        ];
        
        return $probabilities;
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
        
        return response()->json([
            'success' => true,
            'data' => $result
        ]);
    }
}