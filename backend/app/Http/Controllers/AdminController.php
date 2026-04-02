<?php

namespace App\Http\Controllers;

use App\Models\Bird;
use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function getUsers()
    {
        $users = User::where('role', 'user')->get();
        return response()->json($users);
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}