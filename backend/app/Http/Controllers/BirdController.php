<?php

namespace App\Http\Controllers;

use App\Models\Birdm;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BirdController extends Controller
{
    public function index(Request $request)
    {
        $birds = Birdm::where('user_id', $request->user()->id)->get();
        return response()->json($birds);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'bird_id' => 'required|string|unique:birdms,bird_id',
            'species' => 'required|string',
            'sex' => 'required|in:Male,Female',
            'age_months' => 'nullable|integer|min:0|max:360',
            'base_color' => 'required|string',
            'visual_mutations' => 'nullable|array',
            'splits' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bird = Birdm::create([
            'user_id' => $request->user()->id,
            'bird_id' => $request->bird_id,
            'species' => $request->species,
            'sex' => $request->sex,
            'age_months' => $request->age_months,
            'base_color' => $request->base_color,
            'dark_factor' => $request->dark_factor ?? 0,
            'visual_mutations' => $request->visual_mutations ?? [],
            'splits' => $request->splits ?? [],
            'mother_data' => $request->mother_data ?? null,
            'father_data' => $request->father_data ?? null,
            'grandparents_data' => $request->grandparents_data ?? null,
        ]);

        return response()->json($bird, 201);
    }

    public function show(Request $request, $id)
    {
        $bird = Birdm::where('user_id', $request->user()->id)->findOrFail($id);
        return response()->json($bird);
    }

    public function update(Request $request, $id)
    {
        $bird = Birdm::where('user_id', $request->user()->id)->findOrFail($id);

        $validator = Validator::make($request->all(), [
            'bird_id' => 'sometimes|string|unique:birdms,bird_id,'.$bird->id,
            'species' => 'sometimes|string',
            'sex' => 'sometimes|in:Male,Female',
            'age_months' => 'nullable|integer|min:0|max:360',
            'base_color' => 'sometimes|string',
            'visual_mutations' => 'nullable|array',
            'splits' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $bird->update($request->only([
            'bird_id', 'species', 'sex', 'age_months', 'base_color',
            'dark_factor', 'visual_mutations', 'splits',
            'mother_data', 'father_data', 'grandparents_data'
        ]));

        return response()->json($bird);
    }

    public function destroy(Request $request, $id)
    {
        $bird = Birdm::where('user_id', $request->user()->id)->findOrFail($id);
        $bird->delete();
        return response()->json(['message' => 'Bird deleted']);
    }
}