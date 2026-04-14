<?php
// =============================================================
// FILE: backend/app/Http/Controllers/GeneticComputationController.php
//       (REPLACE the existing file)
//
// WHAT CHANGED FROM ORIGINAL:
//   BEFORE: This controller computed genetics itself (PHP logic).
//   AFTER:  All computation is done on the FRONTEND (JavaScript).
//           This controller now only:
//             1. Receives pre-computed results from the frontend
//             2. Validates them
//             3. Saves them to the database
//             4. Returns the stored result when requested
//
// API ROUTES (unchanged in api.php):
//   POST /compute/{breedingPairId}
//     → Receive & store pre-computed results from frontend
//   GET  /computation-result/{breedingPairId}
//     → Return stored result with breeding pair data attached
// =============================================================

namespace App\Http\Controllers;

use App\Models\BreedingPair;
use App\Models\ComputationResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GeneticComputationController extends Controller
{
    /**
     * Receive pre-computed genetic results from the frontend and store them.
     *
     * The frontend (GeneticComputationEngine.js) sends:
     * {
     *   "chicks_data": [
     *     {
     *       "chick_number":     1,
     *       "sex":              "Male",
     *       "base_color":       "Cobalt",
     *       "visual_mutations": ["Lutino"],
     *       "split_genes":      ["Pied"],
     *       "genetic_makeup":   "Cobalt Lutino / split: Pied",
     *       "fitness_score":    0.72
     *     },
     *     ... (6 total)
     *   ],
     *   "genetic_analysis": {
     *     "parent1": { ... encoded alleles, species, etc. },
     *     "parent2": { ... },
     *     "algorithm": { ... steps performed, generations, etc. },
     *     "inheritance_rules": { ... },
     *     "verification": { ... }
     *   },
     *   "probabilities": {
     *     "base_colors":  { "Cobalt": 33.3, "Blue": 16.7, ... },
     *     "sex":          { "Male": 50.0, "Female": 50.0 },
     *     "mutations":    { "Lutino": 25.0 },
     *     "split_genes":  { "Pied": 30.0 }
     *   },
     *   "verification": {
     *     "method": "Traditional Punnett Square + Fuzzy Logic Inference",
     *     "base_color_probabilities": { ... },
     *     "mutation_probabilities":   { ... },
     *     "split_probabilities":      { ... },
     *     "confidence_score":         80
     *   }
     * }
     *
     * @param Request $request
     * @param int     $breedingPairId
     * @return \Illuminate\Http\JsonResponse
     */
    public function computeAndPredict(Request $request, $breedingPairId)
    {
        try {
            // ── 1. Verify breeding pair belongs to this user ─────────────
            $breedingPair = BreedingPair::where('user_id', Auth::id())
                ->findOrFail($breedingPairId);

            // ── 2. Validate the incoming pre-computed payload ────────────
            $validated = $request->validate([
                // 6 chicks array — required
                'chicks_data'                         => 'required|array|min:1|max:10',
                'chicks_data.*.sex'                   => 'required|in:Male,Female',
                'chicks_data.*.base_color'            => 'required|string|max:100',
                'chicks_data.*.visual_mutations'      => 'present|array',
                'chicks_data.*.visual_mutations.*'    => 'string|max:100',
                'chicks_data.*.split_genes'           => 'present|array',
                'chicks_data.*.split_genes.*'         => 'string|max:100',
                'chicks_data.*.genetic_makeup'        => 'required|string|max:500',

                // Analysis object — required
                'genetic_analysis'                    => 'required|array',

                // Probabilities — required
                'probabilities'                       => 'required|array',
                'probabilities.base_colors'           => 'required|array',
                'probabilities.sex'                   => 'required|array',

                // Verification — optional but stored if present
                'verification'                        => 'nullable|array',
            ]);

            // ── 3. Merge verification into genetic_analysis ──────────────
            // We store verification inside genetic_analysis so everything
            // is in one JSON column for easy retrieval.
            $geneticAnalysis = $validated['genetic_analysis'];
            if (!empty($validated['verification'])) {
                $geneticAnalysis['verification'] = $validated['verification'];
            }

            // ── 4. Upsert the computation result ─────────────────────────
            // If a result already exists for this breeding pair, update it.
            // Otherwise create a new record.
            $computationResult = ComputationResult::updateOrCreate(
                [
                    'breeding_pair_id' => (int) $breedingPairId,
                ],
                [
                    'user_id'          => Auth::id(),
                    'chicks_data'      => $validated['chicks_data'],
                    'genetic_analysis' => $geneticAnalysis,
                    'probabilities'    => $validated['probabilities'],
                ]
            );

            // ── 5. Mark the breeding pair as completed ───────────────────
            $breedingPair->update([
                'computation_results' => $validated['chicks_data'],
                'status'              => 'completed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Genetic computation results stored successfully.',
                'data'    => [
                    'computation_result_id' => $computationResult->id,
                    'breeding_pair_id'      => (int) $breedingPairId,
                    'chicks_count'          => count($validated['chicks_data']),
                    'status'                => 'completed',
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed — the computation data sent from the frontend is invalid.',
                'errors'  => $e->errors(),
            ], 422);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Breeding pair not found or does not belong to your account.',
            ], 404);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to store computation results: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Retrieve the stored computation result for a breeding pair.
     *
     * GET /computation-result/{breedingPairId}
     *
     * Returns the computation result with the breeding pair data
     * attached so the ComputationResult.jsx page can show parent info.
     *
     * @param int $breedingPairId
     * @return \Illuminate\Http\JsonResponse
     */
    public function getComputationResult($breedingPairId)
    {
        try {
            $result = ComputationResult::where('breeding_pair_id', (int) $breedingPairId)
                ->where('user_id', Auth::id())
                ->first();

            if (!$result) {
                return response()->json([
                    'success' => false,
                    'message' => 'No computation result found for this breeding pair. Please run the computation first.',
                ], 404);
            }

            // Attach the breeding pair so the frontend can display parent info
            $result->breeding_pair = BreedingPair::find($breedingPairId);

            return response()->json([
                'success' => true,
                'data'    => $result,
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve computation result: ' . $e->getMessage(),
            ], 500);
        }
    }
}