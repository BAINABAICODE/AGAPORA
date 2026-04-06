<?php
// backend/app/Http/Controllers/ReferenceDataController.php

namespace App\Http\Controllers;

use App\Models\SpeciesList;
use App\Models\BaseColor;
use App\Models\VisualMutation;
use App\Models\SplitGene;

class ReferenceDataController extends Controller
{
    public function getSpecies()
    {
        $species = SpeciesList::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $species
        ]);
    }

    public function getBaseColors()
    {
        $colors = BaseColor::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $colors
        ]);
    }

    public function getVisualMutations()
    {
        $mutations = VisualMutation::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $mutations
        ]);
    }

    public function getSplitGenes()
    {
        $genes = SplitGene::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'data' => $genes
        ]);
    }

    public function getAllReferences()
    {
        return response()->json([
            'success' => true,
            'data' => [
                'species' => SpeciesList::orderBy('name')->get(),
                'base_colors' => BaseColor::orderBy('name')->get(),
                'visual_mutations' => VisualMutation::orderBy('name')->get(),
                'split_genes' => SplitGene::orderBy('name')->get(),
            ]
        ]);
    }
}