<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "Mwango Brain API Documentation",
    description: "Documentação das APIs RESTful do sistema Mwango Brain - Gestão de Eventos, Leads e Contactos (Laravel 13 & Neon PostgreSQL)"
)]
#[OA\Server(
    url: "http://localhost:8000",
    description: "Servidor Local / Dev"
)]
#[OA\Tag(name: "State", description: "Estado completo da aplicação")]
#[OA\Tag(name: "Contacts", description: "Gestão de Contactos")]
#[OA\Tag(name: "Leads", description: "Gestão de Leads Comercial")]
#[OA\Tag(name: "Interactions", description: "Histórico de Interacções com Leads")]
#[OA\Tag(name: "FollowUps", description: "Acompanhamento e Follow-ups")]
#[OA\Tag(name: "Meetings", description: "Agendamento de Reuniões")]
#[OA\Tag(name: "Feedback", description: "Avaliação dos Visitantes")]
#[OA\Tag(name: "Solutions", description: "Catálogo de Soluções")]
#[OA\Tag(name: "Users", description: "Gestão de Utilizadores")]
#[OA\Tag(name: "Notifications", description: "Notificações do Sistema")]
#[OA\Tag(name: "Evaluation", description: "Avaliação Interna do Evento")]
abstract class Controller
{
    // Base Controller
}
