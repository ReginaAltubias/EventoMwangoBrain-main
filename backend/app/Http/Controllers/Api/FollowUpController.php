<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowUp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class FollowUpController extends Controller
{
    #[OA\Get(
        path: "/api/follow-ups",
        operationId: "getFollowUps",
        summary: "Listar todos os follow-ups",
        tags: ["FollowUps"],
        responses: [new OA\Response(response: 200, description: "Lista de follow-ups")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(FollowUp::with('lead')->get());
    }

    #[OA\Post(
        path: "/api/follow-ups",
        operationId: "storeFollowUp",
        summary: "Criar novo follow-up",
        tags: ["FollowUps"],
        responses: [new OA\Response(response: 201, description: "Follow-up criado")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leadId' => 'required|string|exists:leads,id',
            'action' => 'required|string',
            'dueDate' => 'required|date',
            'ownerId' => 'nullable|string',
            'status' => 'nullable|string',
        ]);

        $id = $request->input('id', 'FUP-' . time());

        $followUp = FollowUp::create([
            'id' => $id,
            'lead_id' => $validated['leadId'],
            'action' => $validated['action'],
            'due_date' => $validated['dueDate'],
            'owner_id' => $validated['ownerId'] ?? 'USR-01',
            'status' => $validated['status'] ?? 'Pendente',
        ]);

        return response()->json($followUp, 201);
    }

    #[OA\Patch(
        path: "/api/follow-ups/{id}/complete",
        operationId: "completeFollowUp",
        summary: "Concluir follow-up",
        tags: ["FollowUps"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Follow-up marcado como concluído")]
    )]
    public function complete(Request $request, string $id): JsonResponse
    {
        $followUp = FollowUp::find($id);

        if (!$followUp) {
            return response()->json(['message' => 'Follow-up não encontrado'], 404);
        }

        $followUp->update(['status' => 'Concluído']);

        return response()->json($followUp);
    }

    #[OA\Put(
        path: "/api/follow-ups/{id}",
        operationId: "updateFollowUp",
        summary: "Atualizar estado do follow-up",
        tags: ["FollowUps"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Follow-up atualizado")]
    )]
    public function update(Request $request, string $id): JsonResponse
    {
        $followUp = FollowUp::find($id);
        if (!$followUp) {
            return response()->json(['message' => 'Follow-up não encontrado'], 404);
        }

        if ($request->has('status')) $followUp->status = $request->input('status');
        if ($request->has('action')) $followUp->action = $request->input('action');
        if ($request->has('dueDate')) $followUp->due_date = $request->input('dueDate');

        $followUp->save();

        return response()->json($followUp);
    }
}
