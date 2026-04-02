<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
        ]);
    }

    public function login(Request $request)
    {
        // Log incoming request for debugging
        Log::info('Login attempt', ['email' => $request->email]);
        
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find user by email
        $user = User::where('email', $request->email)->first();
        
        // Log user found status
        Log::info('User found', ['found' => $user ? 'yes' : 'no']);
        
        if (!$user) {
            return response()->json([
                'message' => 'User not found with this email'
            ], 401);
        }
        
        // Check password
        if (!Hash::check($request->password, $user->password)) {
            Log::info('Password check failed');
            return response()->json([
                'message' => 'Invalid password'
            ], 401);
        }

        // Delete old tokens
        $user->tokens()->delete();
        
        // Create new token
        $token = $user->createToken('auth_token')->plainTextToken;

        Log::info('Login successful', ['user_id' => $user->id]);

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
            'role' => $user->role,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function getUser(Request $request)
    {
        return response()->json($request->user());
    }

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
        ]);

        return response()->json([
            'message' => 'Password reset link would be sent to your email'
        ]);
    }
}