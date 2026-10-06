<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Interaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class InteractionController extends Controller
{
    #[OA\Get(
        path: "/api/interactions",
        operationId: "getInteractions",
        summary: "Listar todas as interacções",
        tags: ["Interactions"],
        responses: [new OA\Response(response: 200, description: "Lista de interacções")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Interaction::orderBy('date', 'desc')->get());
    }

    #[OA\Post(
        path: "/api/interactions",
        operationId: "storeInteraction",
        summary: "Registar nova interacção",
        tags: ["Interactions"],
        responses: [new OA\Response(response: 201, description: "Interacção registada")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leadId' => 'required|string|exists:leads,id',
            'type' => 'required|string',
            'description' => 'required|string',
            'userId' => 'nullable|string',
        ]);

        $id = $request->input('id', 'INT-' . time());

        $interaction = Interaction::create([
            'id' => $id,
            'lead_id' => $validated['leadId'],
            'type' => $validated['type'],
            'description' => $validated['description'],
            'date' => now(),
            'user_id' => $validated['userId'] ?? 'USR-01',
        ]);

        return response()->json($interaction, 201);
    }

    #[OA\Post(
        path: "/api/leads/{leadId}/interactions",
        operationId: "storeInteractionForLead",
        summary: "Registar nova interacção para uma lead específica",
        tags: ["Interactions"],
        parameters: [new OA\Parameter(name: "leadId", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 201, description: "Interacção registada com sucesso")]
    )]
    public function storeForLead(Request $request, string $leadId): JsonResponse
    {
        $validated = $request->validate([
            'description' => 'required|string',
            'type' => 'nullable|string',
            'userId' => 'nullable|string',
        ]);

        $id = 'INT-' . time() . '-' . rand(10, 99);

        $interaction = Interaction::create([
            'id' => $id,
            'lead_id' => $leadId,
            'type' => $validated['type'] ?? 'Nota',
            'description' => $validated['description'],
            'date' => now(),
            'user_id' => $validated['userId'] ?? 'USR-01',
        ]);

        return response()->json($interaction, 201);
    }
}
