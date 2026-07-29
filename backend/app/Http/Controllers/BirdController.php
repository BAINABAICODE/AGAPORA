<?php

namespace App\Http\Controllers;

use App\Models\Bird;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BirdController extends Controller
{
    public function index(Request $request)
    {
        $query = Bird::where('user_id', Auth::id());

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('bird_id', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhere('species', 'like', "%{$search}%")
                    ->orWhere('base_color', 'like', "%{$search}%")
                    ->orWhere('status', 'like', "%{$search}%");
            });
        }

        if ($sex = $request->query('sex')) {
            $query->where('sex', $sex);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $sort = $request->query('sort', 'created_at');
        $direction = $request->query('direction', 'desc');
        $allowed = ['created_at', 'name', 'species', 'sex', 'bird_id', 'status', 'base_color'];
        if (!in_array($sort, $allowed, true)) {
            $sort = 'created_at';
        }
        $direction = strtolower($direction) === 'asc' ? 'asc' : 'desc';

        $birds = $query->orderBy($sort, $direction)->get();

        return response()->json([
            'success' => true,
            'data' => $birds,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateBird($request);
        $validated['user_id'] = Auth::id();
        $validated['status'] = $validated['status'] ?? 'active';

        $bird = Bird::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bird created successfully',
            'data' => $bird,
        ], 201);
    }

    public function show($id)
    {
        $bird = Bird::where('user_id', Auth::id())->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $bird,
        ]);
    }

    public function update(Request $request, $id)
    {
        $bird = Bird::where('user_id', Auth::id())->findOrFail($id);
        $validated = $this->validateBird($request, false);
        $bird->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Bird updated successfully',
            'data' => $bird->fresh(),
        ]);
    }

    public function destroy($id)
    {
        $bird = Bird::where('user_id', Auth::id())->findOrFail($id);
        $bird->delete();

        return response()->json([
            'success' => true,
            'message' => 'Bird deleted successfully',
        ]);
    }

    private function validateBird(Request $request, bool $requireCore = true): array
    {
        $speciesRule = $requireCore ? 'required|string' : 'sometimes|string';
        $sexRule = $requireCore ? 'required|in:Male,Female' : 'sometimes|in:Male,Female';
        $colorRule = $requireCore ? 'required|string' : 'sometimes|string';

        return $request->validate([
            'bird_id' => 'nullable|string|max:255',
            'name' => 'nullable|string|max:255',
            'species' => $speciesRule,
            'sex' => $sexRule,
            'age' => 'nullable|integer|min:0',
            'base_color' => $colorRule,
            'visual_mutations' => 'nullable|array',
            'split_genes' => 'nullable|array',
            'genetic_data' => 'nullable|array',
            'grandparent_data' => 'nullable|array',
            'status' => 'nullable|string|in:active,retired,sold,deceased',
        ]);
    }
}
