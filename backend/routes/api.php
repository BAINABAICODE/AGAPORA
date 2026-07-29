<?php
// backend/routes/api.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SpeciesController;
use App\Http\Controllers\BreedingPairController;
use App\Http\Controllers\ReferenceDataController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\GeneticComputationController;
use App\Http\Controllers\BirdController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// =============================================
// PUBLIC ROUTES (No authentication required)
// =============================================

// Test route
Route::get('/test', function() {
    return response()->json([
        'success' => true,
        'message' => 'API is working properly!',
        'timestamp' => now()
    ]);
});

// Authentication routes (public)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Species routes (public read-only)
Route::get('/species', [SpeciesController::class, 'index']);
Route::get('/species/{key}', [SpeciesController::class, 'show']);

// Reference data routes (public read-only)
Route::get('/references/species', [ReferenceDataController::class, 'getSpecies']);
Route::get('/references/base-colors', [ReferenceDataController::class, 'getBaseColors']);
Route::get('/references/visual-mutations', [ReferenceDataController::class, 'getVisualMutations']);
Route::get('/references/split-genes', [ReferenceDataController::class, 'getSplitGenes']);
Route::get('/references/all', [ReferenceDataController::class, 'getAllReferences']);

// =============================================
// PROTECTED ROUTES (Authentication required)
// =============================================

Route::middleware('auth:sanctum')->group(function () {
    
    // Authentication routes
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    
    // Breeding pair CRUD operations
    Route::get('/breeding-pairs', [BreedingPairController::class, 'index']);
    Route::post('/breeding-pairs', [BreedingPairController::class, 'store']);
    Route::get('/breeding-pairs/{id}', [BreedingPairController::class, 'show']);
    Route::put('/breeding-pairs/{id}', [BreedingPairController::class, 'update']);
    Route::delete('/breeding-pairs/{id}', [BreedingPairController::class, 'destroy']);

    // Bird inventory CRUD
    Route::get('/birds', [BirdController::class, 'index']);
    Route::post('/birds', [BirdController::class, 'store']);
    Route::get('/birds/{id}', [BirdController::class, 'show']);
    Route::put('/birds/{id}', [BirdController::class, 'update']);
    Route::delete('/birds/{id}', [BirdController::class, 'destroy']);
    
    // Genetic computation routes
    Route::post('/compute/{breedingPairId}', [GeneticComputationController::class, 'computeAndPredict']);
    Route::get('/computation-result/{breedingPairId}', [GeneticComputationController::class, 'getComputationResult']);
    
    // Protected species routes (if you need write operations later)
    // Route::post('/species', [SpeciesController::class, 'store']);
    // Route::put('/species/{id}', [SpeciesController::class, 'update']);
    // Route::delete('/species/{id}', [SpeciesController::class, 'destroy']);
    
    // =============================================
    // ADMIN ONLY ROUTES
    // =============================================
    Route::middleware('admin')->group(function () {
        Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
        Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
        
        // Additional admin routes (if needed)
        Route::get('/admin/breeding-pairs', [AdminController::class, 'getAllBreedingPairs']);
        Route::get('/admin/computation-results', [AdminController::class, 'getAllComputationResults']);
        Route::delete('/admin/breeding-pairs/{id}', [AdminController::class, 'deleteBreedingPair']);
    });
});

// =============================================
// FALLBACK ROUTE (404 handler)
// =============================================

Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found'
    ], 404);
});