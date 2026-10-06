<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class NotificationController extends Controller
{
    #[OA\Get(
        path: "/api/notifications",
        operationId: "getNotifications",
        summary: "Listar notificações do utilizador",
        tags: ["Notifications"],
        responses: [new OA\Response(response: 200, description: "Lista de notificações")]
    )]
    public function index(): JsonResponse
    {
        return response()->json(Notification::all());
    }

    #[OA\Patch(
        path: "/api/notifications/{id}/read",
        operationId: "markNotificationRead",
        summary: "Marcar notificação como lida",
        tags: ["Notifications"],
        parameters: [new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "string"))],
        responses: [new OA\Response(response: 200, description: "Notificação marcada como lida")]
    )]
    public function markRead(string $id): JsonResponse
    {
        $notification = Notification::find($id);
        if ($notification) {
            $notification->update(['read' => true]);
        }

        return response()->json(['ok' => true]);
    }
}
