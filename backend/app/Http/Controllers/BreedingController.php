<?php

namespace App\Http\Controllers;

use App\Models\BreedingPair;
use App\Models\Birdm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BreedingController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'parent1' => 'required|array',
            'parent2' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $breedingPair = BreedingPair::create([
            'user_id' => $request->user()->id,
            'pair_name' => $request->pair_name,
            'parent1_id' => $request->parent1['bird_id'] ?? null,
            'parent1_name' => $request->parent1['name'] ?? null,
            'parent1_species' => $request->parent1['species'],
            'parent1_sex' => $request->parent1['sex'],
            'parent1_age' => $request->parent1['age'] ?? null,
            'parent1_base_color' => $request->parent1['base_color'],
            'parent1_dark_factor' => $request->parent1['dark_factor'] ?? 0,
            'parent1_visual_mutations' => $request->parent1['visual_mutations'] ?? [],
            'parent1_splits' => $request->parent1['splits'] ?? [],
            'parent2_id' => $request->parent2['bird_id'] ?? null,
            'parent2_name' => $request->parent2['name'] ?? null,
            'parent2_species' => $request->parent2['species'],
            'parent2_sex' => $request->parent2['sex'],
            'parent2_age' => $request->parent2['age'] ?? null,
            'parent2_base_color' => $request->parent2['base_color'],
            'parent2_dark_factor' => $request->parent2['dark_factor'] ?? 0,
            'parent2_visual_mutations' => $request->parent2['visual_mutations'] ?? [],
            'parent2_splits' => $request->parent2['splits'] ?? [],
        ]);

        return response()->json([
            'message' => 'Breeding pair saved successfully',
            'breeding_pair' => $breedingPair,
            'id' => $breedingPair->id
        ]);
    }

    public function getPairs(Request $request)
    {
        $pairs = BreedingPair::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json($pairs);
    }

    public function getPair($id, Request $request)
    {
        $pair = BreedingPair::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        
        return response()->json($pair);
    }

    public function updateComputation($id, Request $request)
    {
        $pair = BreedingPair::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        
        $pair->update([
            'computation_results' => $request->computation_results,
            'compatibility_score' => $request->compatibility_score,
            'offspring_predictions' => $request->offspring_predictions,
        ]);
        
        return response()->json(['message' => 'Computation results saved']);
    }

    public function destroy($id, Request $request)
    {
        $pair = BreedingPair::where('id', $id)
            ->where('user_id', $request->user()->id)
            ->firstOrFail();
        
        $pair->delete();
        
        return response()->json(['message' => 'Breeding pair deleted']);
    }
}