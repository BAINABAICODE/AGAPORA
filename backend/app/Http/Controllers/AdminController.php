<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getAllUsers(Request $request)
    {
        // Only admin can access
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $users = User::all();
        return response()->json($users);
    }
    
    public function deleteUser(Request $request, $id)
    {
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        
        $targetUser = User::find($id);
        if (!$targetUser) {
            return response()->json(['message' => 'User not found'], 404);
        }
        
        // Prevent admin from deleting themselves
        if ($targetUser->id === $user->id) {
            return response()->json(['message' => 'Cannot delete own account'], 403);
        }
        
        $targetUser->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}