<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\InteractionController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\MeetingController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SolutionController;
use App\Http\Controllers\Api\StateController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VisitorFeedbackController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Mwango Brain
|--------------------------------------------------------------------------
*/

Route::options('{any}', function () {
    return response('', 200);
})->where('any', '.*');

Route::get('/health', function () {
    return response()->json(['ok' => true, 'timestamp' => now()]);
});

// Authentication
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/register', [AuthController::class, 'register']);

// Full State
Route::get('/state', [StateController::class, 'index']);

// Contacts & Quick/Full/QR endpoints
Route::post('/contacts/quick', [ContactController::class, 'quick']);
Route::post('/contacts/full', [ContactController::class, 'full']);
Route::post('/public/qr-contact', [ContactController::class, 'qrContact']);
Route::apiResource('/contacts', ContactController::class);

// Leads
Route::patch('/leads/{id}/status', [LeadController::class, 'updateStatus']);
Route::post('/leads/{leadId}/interactions', [InteractionController::class, 'storeForLead']);
Route::apiResource('/leads', LeadController::class);

// Interactions
Route::get('/interactions', [InteractionController::class, 'index']);
Route::post('/interactions', [InteractionController::class, 'store']);

// Follow-Ups
Route::get('/follow-ups', [FollowUpController::class, 'index']);
Route::post('/follow-ups', [FollowUpController::class, 'store']);
Route::patch('/follow-ups/{id}/complete', [FollowUpController::class, 'complete']);
Route::put('/follow-ups/{id}', [FollowUpController::class, 'update']);

// Meetings
Route::get('/meetings', [MeetingController::class, 'index']);
Route::post('/meetings', [MeetingController::class, 'store']);

// Visitor Feedback
Route::get('/feedback', [VisitorFeedbackController::class, 'index']);
Route::post('/feedback', [VisitorFeedbackController::class, 'store']);

// Solutions
Route::get('/solutions', [SolutionController::class, 'index']);
Route::post('/solutions', [SolutionController::class, 'store']);
Route::patch('/solutions/{id}', [SolutionController::class, 'update']);
Route::delete('/solutions/{id}', [SolutionController::class, 'destroy']);

// Users
Route::get('/users', [UserController::class, 'index']);
Route::patch('/users/{id}/approve', [UserController::class, 'approve']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);

// Notifications
Route::get('/notifications', [NotificationController::class, 'index']);
Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);

// Internal Evaluation
Route::get('/evaluation', [EvaluationController::class, 'show']);
Route::put('/evaluation', [EvaluationController::class, 'store']);
Route::post('/evaluation', [EvaluationController::class, 'store']);
