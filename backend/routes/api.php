<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\BirdController;
use App\Http\Controllers\BreedingController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);

// Protected routes (require authentication)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'getUser']);
    
    // Admin routes
    Route::get('/admin/users', [AdminController::class, 'getAllUsers']);
    Route::delete('/admin/users/{id}', [AdminController::class, 'deleteUser']);
    
    // Bird routes
    Route::apiResource('birds', BirdController::class);
    
    // Breeding routes
    Route::post('/breeding/store', [BreedingController::class, 'store']);
    Route::get('/breeding/pairs', [BreedingController::class, 'getPairs']);
    Route::get('/breeding/pair/{id}', [BreedingController::class, 'getPair']);
    Route::put('/breeding/pair/{id}/computation', [BreedingController::class, 'updateComputation']);
    Route::delete('/breeding/pair/{id}', [BreedingController::class, 'destroy']);
});