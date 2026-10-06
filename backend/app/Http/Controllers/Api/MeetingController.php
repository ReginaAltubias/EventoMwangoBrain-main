<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Meeting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class MeetingController extends Controller
{
    #[OA\Get(
        path: "/api/meetings",
        operationId: "getMeetings",
        summary: "Listar reuniões agendadas",
        tags: ["Meetings"],
        responses: [new OA\Response(response: 200, description: "Lista de reuniões")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Meeting::with('lead')->get());
    }

    #[OA\Post(
        path: "/api/meetings",
        operationId: "storeMeeting",
        summary: "Agendar nova reunião",
        tags: ["Meetings"],
        responses: [new OA\Response(response: 201, description: "Reunião criada com sucesso")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'leadId' => 'required|string|exists:leads,id',
            'type' => 'required|string',
            'start' => 'required|date',
            'end' => 'required|date',
            'ownerId' => 'required|string',
            'location' => 'nullable|string',
        ]);

        $id = $request->input('id', 'MTG-' . time());

        $meeting = Meeting::create([
            'id' => $id,
            'lead_id' => $validated['leadId'],
            'type' => $validated['type'],
            'start' => $validated['start'],
            'end' => $validated['end'],
            'owner_id' => $validated['ownerId'],
            'location' => $validated['location'] ?? null,
        ]);

        return response()->json($meeting, 201);
    }
}
