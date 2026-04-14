<?php
// backend/app/Http/Controllers/BreedingPairController.php

namespace App\Http\Controllers;

use App\Models\BreedingPair;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BreedingPairController extends Controller
{
    public function index()
    {
        $pairs = BreedingPair::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json([
            'success' => true,
            'data' => $pairs
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            // Parent 1
            'parent1_bird_id' => 'nullable|string',
            'parent1_name' => 'nullable|string',
            'parent1_species' => 'required|string',
            'parent1_sex' => 'required|in:Male,Female',
            'parent1_age' => 'nullable|integer',
            'parent1_base_color' => 'required|string',
            'parent1_visual_mutations' => 'nullable|array', // Array for multiple mutations
            'parent1_split_genes' => 'nullable|array',
            'parent1_genetic_data' => 'nullable|array', // Added: Mother/Father genetic data for parent1
            
            // Parent 2
            'parent2_bird_id' => 'nullable|string',
            'parent2_name' => 'nullable|string',
            'parent2_species' => 'required|string',
            'parent2_sex' => 'required|in:Male,Female',
            'parent2_age' => 'nullable|integer',
            'parent2_base_color' => 'required|string',
            'parent2_visual_mutations' => 'nullable|array', // Array for multiple mutations
            'parent2_split_genes' => 'nullable|array',
            'parent2_genetic_data' => 'nullable|array', // Added: Mother/Father genetic data for parent2
            
            // Grandparent Data (detailed nested structure)
            'grandparent_data' => 'nullable|array',
            'grandparent_data.parent1' => 'nullable|array',
            'grandparent_data.parent2' => 'nullable|array',
            'grandparent_data.parent1.paternal' => 'nullable|array',
            'grandparent_data.parent1.maternal' => 'nullable|array',
            'grandparent_data.parent2.paternal' => 'nullable|array',
            'grandparent_data.parent2.maternal' => 'nullable|array',
        ]);

        $validated['user_id'] = Auth::id();
        $validated['status'] = 'pending';
        
        $breedingPair = BreedingPair::create($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Data collected successfully',
            'data' => $breedingPair
        ], 201);
    }

    public function show($id)
    {
        $pair = BreedingPair::where('user_id', Auth::id())
            ->findOrFail($id);
        
        return response()->json([
            'success' => true,
            'data' => $pair
        ]);
    }

    public function update(Request $request, $id)
    {
        $pair = BreedingPair::where('user_id', Auth::id())
            ->findOrFail($id);
        
        $validated = $request->validate([
            'parent1_name' => 'nullable|string',
            'parent1_age' => 'nullable|integer',
            'parent1_visual_mutations' => 'nullable|array',
            'parent1_split_genes' => 'nullable|array',
            'parent1_genetic_data' => 'nullable|array',
            'parent2_name' => 'nullable|string',
            'parent2_age' => 'nullable|integer',
            'parent2_visual_mutations' => 'nullable|array',
            'parent2_split_genes' => 'nullable|array',
            'parent2_genetic_data' => 'nullable|array',
            'grandparent_data' => 'nullable|array',
            'notes' => 'nullable|string',
            'status' => 'nullable|in:pending,completed,failed',
        ]);
        
        $pair->update($validated);
        
        return response()->json([
            'success' => true,
            'message' => 'Breeding pair updated successfully',
            'data' => $pair
        ]);
    }

    public function destroy($id)
    {
        $pair = BreedingPair::where('user_id', Auth::id())
            ->findOrFail($id);
        
        $pair->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Breeding pair deleted successfully'
        ]);
    }
}