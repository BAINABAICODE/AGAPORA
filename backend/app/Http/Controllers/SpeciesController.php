<?php
// backend/app/Http/Controllers/SpeciesController.php

namespace App\Http\Controllers;

use App\Models\Species;
use Illuminate\Http\Request;

class SpeciesController extends Controller
{
    public function index()
    {
        try {
            $species = Species::where('is_active', true)
                ->orderBy('display_order')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => [],
                'message' => 'Error retrieving species: ' . $e->getMessage()
            ], 500);
        }
    }

    public function show($key)
    {
        try {
            $species = Species::where('key', $key)->firstOrFail();
            
            return response()->json([
                'success' => true,
                'data' => $species,
                'message' => 'Species retrieved successfully'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'data' => null,
                'message' => 'Species not found'
            ], 404);
        }
    }
}