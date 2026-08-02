<?php
// =============================================================
// GeneticComputationController — stores RBGIA + GICA results
// Computation runs on the client (GeneticComputationEngine.js).
// Fixed N=6 chick-card payload is no longer required.
// =============================================================

namespace App\Http\Controllers;

use App\Models\BreedingPair;
use App\Models\ComputationResult;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class GeneticComputationController extends Controller
{
    /**
     * Receive pre-computed RBGIA + GICA results and store them.
     *
     * Expected payload (example):
     * {
     *   "chicks_data": [],
     *   "probabilities": {
     *     "base_colors": { "Green": 50.0, "Blue": 50.0 },
     *     "sex": { "Male": 50.0, "Female": 50.0 },
     *     "mutations": {},
     *     "split_genes": {}
     *   },
     *   "genetic_analysis": {
     *     "rbgia": { ... },
     *     "gica": { "score": 72.5, "label": "Good", "breakdown": { ... } },
     *     "reproductive_forecast": {
     *       "eggs_laid_mean": 5.0,
     *       "hatch_rate": 0.7,
     *       "expected_hatchlings": 3.5
     *     },
     *     "report": { "time_complexity": "O(M) to O(M·K)", ... }
     *   },
     *   "verification": { "method": "...", "confidence_score": 80 },
     *   "gica": { ... },
     *   "reproductive_forecast": { ... },
     *   "report": { ... }
     * }
     */
    public function computeAndPredict(Request $request, $breedingPairId)
    {
        try {
            $breedingPair = BreedingPair::where('user_id', Auth::id())
                ->findOrFail($breedingPairId);

            $validated = $request->validate([
                // Legacy column kept nullable/empty — no fixed clutch of 6
                'chicks_data'                               => 'nullable|array',
                'chicks_data.*.sex'                         => 'nullable|in:Male,Female',
                'chicks_data.*.base_color'                  => 'nullable|string|max:100',
                'chicks_data.*.visual_mutations'            => 'nullable|array',
                'chicks_data.*.split_genes'                 => 'nullable|array',
                'chicks_data.*.genetic_makeup'              => 'nullable|string|max:500',

                'genetic_analysis'                          => 'required|array',
                'genetic_analysis.gica'                     => 'nullable|array',
                'genetic_analysis.reproductive_forecast'    => 'nullable|array',
                'genetic_analysis.report'                   => 'nullable|array',
                'genetic_analysis.rbgia'                    => 'nullable|array',

                'probabilities'                             => 'required|array',
                'probabilities.base_colors'                 => 'required|array',
                'probabilities.sex'                         => 'required|array',
                'probabilities.mutations'                   => 'nullable|array',
                'probabilities.split_genes'                 => 'nullable|array',

                'verification'                              => 'nullable|array',
                'gica'                                      => 'nullable|array',
                'reproductive_forecast'                     => 'nullable|array',
                'report'                                    => 'nullable|array',
            ]);

            $geneticAnalysis = $validated['genetic_analysis'];

            if (!empty($validated['verification'])) {
                $geneticAnalysis['verification'] = $validated['verification'];
            }
            if (!empty($validated['gica'])) {
                $geneticAnalysis['gica'] = $validated['gica'];
            }
            if (!empty($validated['reproductive_forecast'])) {
                $geneticAnalysis['reproductive_forecast'] = $validated['reproductive_forecast'];
            }
            if (!empty($validated['report'])) {
                $geneticAnalysis['report'] = $validated['report'];
            }

            $chicksData = $validated['chicks_data'] ?? [];

            $summaryPayload = [
                'gica' => $geneticAnalysis['gica'] ?? null,
                'reproductive_forecast' => $geneticAnalysis['reproductive_forecast'] ?? null,
                'probabilities' => $validated['probabilities'],
            ];

            $computationResult = ComputationResult::updateOrCreate(
                [
                    'breeding_pair_id' => (int) $breedingPairId,
                ],
                [
                    'user_id'          => Auth::id(),
                    'chicks_data'      => $chicksData,
                    'genetic_analysis' => $geneticAnalysis,
                    'probabilities'    => $validated['probabilities'],
                ]
            );

            $breedingPair->update([
                'computation_results' => $summaryPayload,
                'status'              => 'completed',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'RBGIA + GICA computation results stored successfully.',
                'data'    => [
                    'computation_result_id' => $computationResult->id,
                    'breeding_pair_id'      => (int) $breedingPairId,
                    'chicks_count'          => count($chicksData),
                    'gica_score'            => $geneticAnalysis['gica']['score'] ?? null,
                    'expected_hatchlings'   => $geneticAnalysis['reproductive_forecast']['expected_hatchlings'] ?? null,
                    'status'                => 'completed',
                ],
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed — the computation data sent from the client is invalid.',
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
     * GET /computation-result/{breedingPairId}
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
