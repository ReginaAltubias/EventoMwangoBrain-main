<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\FollowUp;
use App\Models\Interaction;
use App\Models\InternalEvaluation;
use App\Models\Lead;
use App\Models\Meeting;
use App\Models\Notification;
use App\Models\SolutionItem;
use App\Models\User;
use App\Models\VisitorFeedback;
use Illuminate\Http\JsonResponse;
use OpenApi\Attributes as OA;

class StateController extends Controller
{
    #[OA\Get(
        path: "/api/state",
        operationId: "getState",
        summary: "Obter o estado completo da aplicação",
        tags: ["State"],
        responses: [
            new OA\Response(response: 200, description: "Operação bem-sucedida")
        ]
    )]
    public function index(): JsonResponse
    {
        $evaluationModel = InternalEvaluation::first();

        return response()->json([
            'contacts' => Contact::all(),
            'leads' => Lead::all(),
            'interactions' => Interaction::all(),
            'followUps' => FollowUp::all(),
            'meetings' => Meeting::all(),
            'feedback' => VisitorFeedback::all(),
            'solutions' => SolutionItem::all(),
            'users' => User::all(),
            'notifications' => Notification::all(),
            'evaluation' => $evaluationModel ? [
                'scores' => $evaluationModel->scores,
                'wentWell' => $evaluationModel->went_well,
                'difficulties' => $evaluationModel->difficulties,
                'topSolutions' => $evaluationModel->top_solutions,
                'mainNeeds' => $evaluationModel->main_needs,
                'improvements' => $evaluationModel->improvements,
                'savedAt' => $evaluationModel->saved_at,
            ] : null,
        ]);
    }
}
