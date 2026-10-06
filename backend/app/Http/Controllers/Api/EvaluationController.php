<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InternalEvaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class EvaluationController extends Controller
{
    #[OA\Get(
        path: "/api/evaluation",
        operationId: "getEvaluation",
        summary: "Obter avaliação interna do evento",
        tags: ["Evaluation"],
        responses: [new OA\Response(response: 200, description: "Dados da avaliação interna")]
    )]
    public function show(): JsonResponse
    {
        $eval = InternalEvaluation::first();
        if (!$eval) {
            return response()->json(null);
        }

        return response()->json([
            'scores' => $eval->scores,
            'wentWell' => $eval->went_well,
            'difficulties' => $eval->difficulties,
            'topSolutions' => $eval->top_solutions,
            'mainNeeds' => $eval->main_needs,
            'improvements' => $eval->improvements,
            'savedAt' => $eval->saved_at,
        ]);
    }

    #[OA\Post(
        path: "/api/evaluation",
        operationId: "saveEvaluation",
        summary: "Guardar ou atualizar avaliação interna",
        tags: ["Evaluation"],
        responses: [new OA\Response(response: 200, description: "Avaliação atualizada")]
    )]
    public function store(Request $request): JsonResponse
    {
        $eval = InternalEvaluation::firstOrNew(['id' => 1]);

        $eval->scores = $request->input('scores', $eval->scores ?? []);
        $eval->went_well = $request->input('wentWell', $eval->went_well);
        $eval->difficulties = $request->input('difficulties', $eval->difficulties);
        $eval->top_solutions = $request->input('topSolutions', $eval->top_solutions ?? []);
        $eval->main_needs = $request->input('mainNeeds', $eval->main_needs);
        $eval->improvements = $request->input('improvements', $eval->improvements);
        $eval->saved_at = now();

        $eval->save();

        return response()->json([
            'scores' => $eval->scores,
            'wentWell' => $eval->went_well,
            'difficulties' => $eval->difficulties,
            'topSolutions' => $eval->top_solutions,
            'mainNeeds' => $eval->main_needs,
            'improvements' => $eval->improvements,
            'savedAt' => $eval->saved_at,
        ]);
    }
}
