<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class LeadController extends Controller
{
    #[OA\Get(
        path: "/api/leads",
        operationId: "getLeads",
        summary: "Listar todas as leads",
        tags: ["Leads"],
        responses: [new OA\Response(response: 200, description: "Lista de leads")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Lead::with(['contact', 'interactions', 'followUps', 'meetings'])->get());
    }

    #[OA\Get(
        path: "/api/leads/{id}",
        operationId: "getLeadById",
        summary: "Obter detalhes da lead por ID",
        tags: ["Leads"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [
            new OA\Response(response: 200, description: "Lead encontrada"),
            new OA\Response(response: 404, description: "Lead não encontrada")
        ]
    )]
    public function show(string $id): JsonResponse
    {
        $lead = Lead::with(['contact', 'interactions', 'followUps', 'meetings'])->find($id);

        if (!$lead) {
            return response()->json(['message' => 'Lead não encontrada'], 404);
        }

        return response()->json($lead);
    }

    #[OA\Post(
        path: "/api/leads",
        operationId: "storeLead",
        summary: "Criar nova lead",
        tags: ["Leads"],
        responses: [new OA\Response(response: 201, description: "Lead criada com sucesso")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contactId' => 'required|string|exists:contacts,id',
            'mainSolution' => 'required|string',
            'solutions' => 'nullable|array',
            'need' => 'nullable|string',
            'hasConcreteNeed' => 'nullable|string',
            'timeframe' => 'nullable|string',
            'interest' => 'required|string',
            'status' => 'required|string',
            'ownerId' => 'required|string',
            'nextAction' => 'nullable|string',
            'followUpDate' => 'nullable|date',
            'notes' => 'nullable|string',
            'estimatedValue' => 'nullable|numeric',
        ]);

        $id = $request->input('id', 'LEAD-' . rand(500, 999));

        $lead = Lead::create([
            'id' => $id,
            'contact_id' => $validated['contactId'],
            'main_solution' => $validated['mainSolution'],
            'solutions' => $validated['solutions'] ?? [$validated['mainSolution']],
            'need' => $validated['need'] ?? null,
            'has_concrete_need' => $validated['hasConcreteNeed'] ?? 'Sim',
            'timeframe' => $validated['timeframe'] ?? null,
            'interest' => $validated['interest'],
            'status' => $validated['status'],
            'owner_id' => $validated['ownerId'],
            'next_action' => $validated['nextAction'] ?? 'Ligar',
            'follow_up_date' => $validated['followUpDate'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'estimated_value' => $validated['estimatedValue'] ?? null,
        ]);

        return response()->json($lead, 201);
    }

    #[OA\Patch(
        path: "/api/leads/{id}/status",
        operationId: "updateLeadStatus",
        summary: "Atualizar estado da lead",
        tags: ["Leads"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Estado da lead atualizado")]
    )]
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json(['message' => 'Lead não encontrada'], 404);
        }

        $validated = $request->validate([
            'status' => 'required|string',
        ]);

        $lead->update(['status' => $validated['status']]);

        return response()->json($lead);
    }

    #[OA\Put(
        path: "/api/leads/{id}",
        operationId: "updateLead",
        summary: "Atualizar lead",
        tags: ["Leads"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [
            new OA\Response(response: 200, description: "Lead atualizada"),
            new OA\Response(response: 404, description: "Lead não encontrada")
        ]
    )]
    public function update(Request $request, string $id): JsonResponse
    {
        $lead = Lead::find($id);

        if (!$lead) {
            return response()->json(['message' => 'Lead não encontrada'], 404);
        }

        $data = [];
        if ($request->has('status')) $data['status'] = $request->input('status');
        if ($request->has('interest')) $data['interest'] = $request->input('interest');
        if ($request->has('nextAction')) $data['next_action'] = $request->input('nextAction');
        if ($request->has('ownerId')) $data['owner_id'] = $request->input('ownerId');
        if ($request->has('notes')) $data['notes'] = $request->input('notes');
        if ($request->has('estimatedValue')) $data['estimated_value'] = $request->input('estimatedValue');
        if ($request->has('followUpDate')) $data['follow_up_date'] = $request->input('followUpDate');

        $lead->update($data);

        return response()->json($lead);
    }

    #[OA\Delete(
        path: "/api/leads/{id}",
        operationId: "deleteLead",
        summary: "Remover lead",
        tags: ["Leads"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Lead removida")]
    )]
    public function destroy(string $id): JsonResponse
    {
        $lead = Lead::find($id);
        if ($lead) {
            $lead->delete();
        }

        return response()->json(['message' => 'Lead removida com sucesso']);
    }
}
