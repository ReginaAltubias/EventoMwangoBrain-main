<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ContactController extends Controller
{
    #[OA\Get(
        path: "/api/contacts",
        operationId: "getContacts",
        summary: "Listar todos os contactos",
        tags: ["Contacts"],
        responses: [new OA\Response(response: 200, description: "Lista de contactos")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Contact::orderBy('created_at', 'desc')->get());
    }

    #[OA\Get(
        path: "/api/contacts/{id}",
        operationId: "getContactById",
        summary: "Obter contacto por ID",
        tags: ["Contacts"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [
            new OA\Response(response: 200, description: "Contacto encontrado"),
            new OA\Response(response: 404, description: "Contacto não encontrado")
        ]
    )]
    public function show(string $id): JsonResponse
    {
        $contact = Contact::with(['leads', 'feedback'])->find($id);

        if (!$contact) {
            return response()->json(['message' => 'Contacto não encontrado'], 404);
        }

        return response()->json($contact);
    }

    #[OA\Post(
        path: "/api/contacts",
        operationId: "storeContact",
        summary: "Criar novo contacto",
        tags: ["Contacts"],
        responses: [new OA\Response(response: 201, description: "Contacto criado com sucesso")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'phone' => 'required|string|max:100',
            'whatsapp' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255',
            'sector' => 'nullable|string|max:255',
            'orgType' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'source' => 'required|string|max:255',
            'createdBy' => 'nullable|string|max:255',
        ]);

        $id = $request->input('id', 'CON-' . rand(2000, 9999));

        $contact = Contact::create([
            'id' => $id,
            'full_name' => $validated['fullName'],
            'company' => $validated['company'],
            'role' => $validated['role'] ?? null,
            'phone' => $validated['phone'],
            'whatsapp' => $validated['whatsapp'] ?? null,
            'email' => $validated['email'] ?? null,
            'sector' => $validated['sector'] ?? null,
            'org_type' => $validated['orgType'] ?? null,
            'notes' => $validated['notes'] ?? null,
            'source' => $validated['source'],
            'is_complete' => true,
            'created_by' => $validated['createdBy'] ?? 'USR-01',
        ]);

        return response()->json($contact, 201);
    }

    #[OA\Post(
        path: "/api/contacts/quick",
        operationId: "quickContact",
        summary: "Registo Rápido de Contacto e Lead",
        tags: ["Contacts"],
        responses: [new OA\Response(response: 201, description: "Contacto e Lead criados com sucesso")]
    )]
    public function quick(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'phone' => 'required|string|max:100',
            'mainSolution' => 'required|string',
            'interest' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $contactId = 'CON-' . rand(2000, 9999);
        $leadId = 'LEAD-' . rand(1000, 9999);

        $contact = Contact::create([
            'id' => $contactId,
            'full_name' => $validated['fullName'],
            'company' => $validated['company'],
            'phone' => $validated['phone'],
            'source' => 'Captura rápida',
            'is_complete' => true,
            'created_by' => 'USR-01',
        ]);

        $lead = Lead::create([
            'id' => $leadId,
            'contact_id' => $contactId,
            'main_solution' => $validated['mainSolution'],
            'solutions' => [$validated['mainSolution']],
            'interest' => $validated['interest'],
            'status' => 'Novo',
            'owner_id' => 'USR-01',
            'next_action' => 'Ligar',
            'has_concrete_need' => 'Sim',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'contact' => $contact,
            'lead' => $lead,
        ], 201);
    }

    #[OA\Post(
        path: "/api/contacts/full",
        operationId: "fullContact",
        summary: "Registo Completo de Contacto e Lead",
        tags: ["Contacts"],
        responses: [new OA\Response(response: 201, description: "Contacto e Lead criados com sucesso")]
    )]
    public function full(Request $request): JsonResponse
    {
        $contactData = $request->input('contact', []);
        $leadData = $request->input('lead', []);

        $contactId = 'CON-' . rand(2000, 9999);
        $leadId = 'LEAD-' . rand(1000, 9999);

        $contact = Contact::create([
            'id' => $contactId,
            'full_name' => $contactData['fullName'] ?? 'Contacto Sem Nome',
            'company' => $contactData['company'] ?? 'Empresa Desconhecida',
            'role' => $contactData['role'] ?? null,
            'phone' => $contactData['phone'] ?? '',
            'whatsapp' => $contactData['whatsapp'] ?? null,
            'email' => $contactData['email'] ?? null,
            'sector' => $contactData['sector'] ?? null,
            'org_type' => $contactData['orgType'] ?? null,
            'notes' => $contactData['notes'] ?? null,
            'source' => 'Stand',
            'is_complete' => true,
            'created_by' => 'USR-01',
        ]);

        $lead = Lead::create([
            'id' => $leadId,
            'contact_id' => $contactId,
            'main_solution' => $leadData['mainSolution'] ?? 'RIVO',
            'solutions' => $leadData['solutions'] ?? [$leadData['mainSolution'] ?? 'RIVO'],
            'need' => $leadData['need'] ?? null,
            'has_concrete_need' => $leadData['hasConcreteNeed'] ?? 'Sim',
            'timeframe' => $leadData['timeframe'] ?? null,
            'interest' => $leadData['interest'] ?? 'Alto',
            'status' => $leadData['status'] ?? 'Novo',
            'owner_id' => $leadData['ownerId'] ?? 'USR-01',
            'next_action' => $leadData['nextAction'] ?? 'Ligar',
            'follow_up_date' => $leadData['followUpDate'] ?? null,
            'notes' => $leadData['notes'] ?? null,
            'estimated_value' => $leadData['estimatedValue'] ?? null,
        ]);

        return response()->json([
            'contact' => $contact,
            'lead' => $lead,
        ], 201);
    }

    #[OA\Post(
        path: "/api/public/qr-contact",
        operationId: "qrContact",
        summary: "Captura Pública por QR Code",
        tags: ["Contacts"],
        responses: [new OA\Response(response: 201, description: "Contacto QR Code registado")]
    )]
    public function qrContact(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'fullName' => 'required|string|max:255',
            'company' => 'required|string|max:255',
            'role' => 'nullable|string',
            'whatsapp' => 'nullable|string',
            'email' => 'nullable|email',
            'solution' => 'nullable|string',
            'solutions' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        $contactId = 'CON-' . rand(2000, 9999);
        $leadId = 'LEAD-' . rand(1000, 9999);
        $sol = $validated['solution'] ?? ($validated['solutions'][0] ?? 'RIVO');

        $contact = Contact::create([
            'id' => $contactId,
            'full_name' => $validated['fullName'],
            'company' => $validated['company'],
            'role' => $validated['role'] ?? null,
            'phone' => $validated['whatsapp'] ?? '',
            'whatsapp' => $validated['whatsapp'] ?? null,
            'email' => $validated['email'] ?? null,
            'source' => 'QR Code',
            'is_complete' => false,
            'created_by' => 'Public QR',
        ]);

        $lead = Lead::create([
            'id' => $leadId,
            'contact_id' => $contactId,
            'main_solution' => $sol,
            'solutions' => $validated['solutions'] ?? [$sol],
            'interest' => 'Alto',
            'status' => 'Novo',
            'owner_id' => 'USR-01',
            'next_action' => 'Contactar via WhatsApp',
            'has_concrete_need' => 'Sim',
            'notes' => $validated['notes'] ?? 'Registo efectuado via QR Code no Stand.',
        ]);

        return response()->json(['ok' => true, 'contactId' => $contactId, 'leadId' => $leadId], 201);
    }

    #[OA\Put(
        path: "/api/contacts/{id}",
        operationId: "updateContact",
        summary: "Atualizar contacto existente",
        tags: ["Contacts"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [
            new OA\Response(response: 200, description: "Contacto atualizado"),
            new OA\Response(response: 404, description: "Contacto não encontrado")
        ]
    )]
    public function update(Request $request, string $id): JsonResponse
    {
        $contact = Contact::find($id);

        if (!$contact) {
            return response()->json(['message' => 'Contacto não encontrado'], 404);
        }

        $data = [];
        if ($request->has('fullName')) $data['full_name'] = $request->input('fullName');
        if ($request->has('company')) $data['company'] = $request->input('company');
        if ($request->has('role')) $data['role'] = $request->input('role');
        if ($request->has('phone')) $data['phone'] = $request->input('phone');
        if ($request->has('whatsapp')) $data['whatsapp'] = $request->input('whatsapp');
        if ($request->has('email')) $data['email'] = $request->input('email');
        if ($request->has('sector')) $data['sector'] = $request->input('sector');
        if ($request->has('orgType')) $data['org_type'] = $request->input('orgType');
        if ($request->has('notes')) $data['notes'] = $request->input('notes');
        if ($request->has('isComplete')) $data['is_complete'] = $request->input('isComplete');

        $contact->update($data);

        return response()->json($contact);
    }

    #[OA\Delete(
        path: "/api/contacts/{id}",
        operationId: "deleteContact",
        summary: "Eliminar contacto",
        tags: ["Contacts"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Contacto eliminado")]
    )]
    public function destroy(string $id): JsonResponse
    {
        $contact = Contact::find($id);
        if ($contact) {
            $contact->delete();
        }

        return response()->json(['message' => 'Contacto removido com sucesso']);
    }
}
