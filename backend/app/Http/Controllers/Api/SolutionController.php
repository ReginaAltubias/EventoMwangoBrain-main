<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SolutionItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class SolutionController extends Controller
{
    #[OA\Get(
        path: "/api/solutions",
        operationId: "getSolutions",
        summary: "Listar catálogo de soluções",
        tags: ["Solutions"],
        responses: [new OA\Response(response: 200, description: "Lista de soluções")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(SolutionItem::all());
    }

    #[OA\Post(
        path: "/api/solutions",
        operationId: "storeSolution",
        summary: "Criar nova solução",
        tags: ["Solutions"],
        responses: [new OA\Response(response: 201, description: "Solução criada")]
    )]
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|unique:solution_items,name',
            'subtitle' => 'required|string',
        ]);

        $id = 'SOL-' . time();

        $solution = SolutionItem::create([
            'id' => $id,
            'name' => $validated['name'],
            'subtitle' => $validated['subtitle'],
        ]);

        return response()->json($solution, 201);
    }

    #[OA\Patch(
        path: "/api/solutions/{id}",
        operationId: "updateSolution",
        summary: "Atualizar solução",
        tags: ["Solutions"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Solução atualizada")]
    )]
    public function update(Request $request, string $id): JsonResponse
    {
        $solution = SolutionItem::find($id);
        if (!$solution) {
            return response()->json(['message' => 'Solução não encontrada'], 404);
        }

        if ($request->has('name')) $solution->name = $request->input('name');
        if ($request->has('subtitle')) $solution->subtitle = $request->input('subtitle');

        $solution->save();

        return response()->json($solution);
    }

    #[OA\Delete(
        path: "/api/solutions/{id}",
        operationId: "deleteSolution",
        summary: "Remover solução",
        tags: ["Solutions"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Solução removida")]
    )]
    public function destroy(string $id): JsonResponse
    {
        $solution = SolutionItem::find($id);
        if ($solution) {
            $solution->delete();
        }

        return response()->json(['ok' => true]);
    }
}
