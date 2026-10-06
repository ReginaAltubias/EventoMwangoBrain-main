<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BrainUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: "/api/auth/login",
        operationId: "login",
        summary: "Autenticação de utilizador",
        tags: ["Users"],
        responses: [
            new OA\Response(response: 200, description: "Login efetuado com sucesso"),
            new OA\Response(response: 401, description: "Credenciais inválidas")
        ]
    )]
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = BrainUser::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Credenciais inválidas'], 401);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'initials' => $user->initials,
            'status' => $user->status,
        ]);
    }

    #[OA\Post(
        path: "/api/auth/register",
        operationId: "register",
        summary: "Registo de novo utilizador",
        tags: ["Users"],
        responses: [new OA\Response(response: 201, description: "Utilizador registado (pendente de aprovação)")]
    )]
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:brain_users,email',
            'role' => 'required|string',
            'password' => 'required|string|min:6',
        ]);

        $words = explode(' ', trim($validated['name']));
        $initials = count($words) >= 2
            ? mb_strtoupper(mb_substr($words[0], 0, 1) . mb_substr(end($words), 0, 1))
            : mb_strtoupper(mb_substr($validated['name'], 0, 2));

        $id = 'USR-' . str_pad((string)rand(10, 99), 2, '0', STR_PAD_LEFT);

        $user = BrainUser::create([
            'id' => $id,
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'initials' => $initials,
            'status' => 'Pendente',
        ]);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'initials' => $user->initials,
            'status' => $user->status,
        ], 201);
    }
}
