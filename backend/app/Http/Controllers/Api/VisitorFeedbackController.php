<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VisitorFeedback;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class VisitorFeedbackController extends Controller
{
    #[OA\Get(
        path: "/api/feedback",
        operationId: "getFeedback",
        summary: "Listar todos os feedbacks de visitantes",
        tags: ["Feedback"],
        responses: [new OA\Response(response: 200, description: "Lista de feedbacks")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(VisitorFeedback::with('contact')->get());
    }

    #[OA\Post(
        path: "/api/feedback",
        operationId: "storeFeedback",
        summary: "Submeter feedback de visitante",
        tags: ["Feedback"],
        responses: [new OA\Response(response: 201, description: "Feedback submetido com sucesso")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contactId' => 'nullable|string',
            'overall' => 'required|integer|min:1|max:5',
            'team' => 'required|integer|min:1|max:5',
            'presentation' => 'required|integer|min:1|max:5',
            'relevance' => 'required|integer|min:1|max:5',
            'highlights' => 'nullable|array',
            'wantsSolution' => 'nullable|string',
            'wantsContact' => 'nullable|boolean',
            'comment' => 'nullable|string',
        ]);

        $id = $request->input('id', 'FDB-' . time());

        $feedback = VisitorFeedback::create([
            'id' => $id,
            'contact_id' => $validated['contactId'] ?? null,
            'overall' => $validated['overall'],
            'team' => $validated['team'],
            'presentation' => $validated['presentation'],
            'relevance' => $validated['relevance'],
            'highlights' => $validated['highlights'] ?? [],
            'wants_solution' => $validated['wantsSolution'] ?? null,
            'wants_contact' => $validated['wantsContact'] ?? false,
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json($feedback, 201);
    }
}
