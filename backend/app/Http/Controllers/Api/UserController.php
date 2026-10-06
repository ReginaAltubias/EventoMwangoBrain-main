<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class UserController extends Controller
{
    #[OA\Get(
        path: "/api/users",
        operationId: "getUsers",
        summary: "Listar todos os utilizadores da equipa",
        tags: ["Users"],
        responses: [new OA\Response(response: 200, description: "Lista de utilizadores")]
    )]
    public function index(): JsonResponse
    {
        // Fetch all records directly from the `users` table
        return response()->json(User::all());
    }

    #[OA\Patch(
        path: "/api/users/{id}/approve",
        operationId: "approveUser",
        summary: "Aprovar conta de utilizador pendente",
        tags: ["Users"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Utilizador aprovado")]
    )]
    public function approve(string $id): JsonResponse
    {
        $user = User::find($id);
        if ($user) {
            $user->update(['status' => 'Aprovado']);
        }

        return response()->json(['ok' => true]);
    }

    #[OA\Delete(
        path: "/api/users/{id}",
        operationId: "rejectUser",
        summary: "Rejeitar ou remover utilizador",
        tags: ["Users"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Utilizador removido")]
    )]
    public function destroy(string $id): JsonResponse
    {
        $user = User::find($id);
        if ($user) {
            $user->delete();
        }

        return response()->json(['ok' => true]);
    }
}
