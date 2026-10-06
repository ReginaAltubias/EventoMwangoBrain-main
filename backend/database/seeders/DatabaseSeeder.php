<?php

namespace Database\Seeders;

use App\Models\BrainUser;
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
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Solutions
        $solutions = [
            ['id' => 'SOL-1', 'name' => 'RIVO', 'subtitle' => 'Gestão empresarial integrada'],
            ['id' => 'SOL-2', 'name' => 'SIGAFLO', 'subtitle' => 'Rastreabilidade e gestão agroflorestal'],
            ['id' => 'SOL-3', 'name' => 'SIGIA', 'subtitle' => 'Gestão de incentivos e processos agrícolas'],
            ['id' => 'SOL-4', 'name' => 'DONE', 'subtitle' => 'Gestão e aprovação de processos e pagamentos'],
            ['id' => 'SOL-5', 'name' => 'Talkgenie', 'subtitle' => 'Soluções baseadas em inteligência artificial'],
            ['id' => 'SOL-6', 'name' => 'Solução à medida', 'subtitle' => 'Desenvolvimento personalizado'],
        ];

        foreach ($solutions as $sol) {
            SolutionItem::updateOrCreate(['id' => $sol['id']], $sol);
        }

        // 2. Users (Populate both `brain_users` and standard `users` tables)
        $usersList = [
            [
                'id' => 'USR-00',
                'name' => 'Mónica Ramalhoso',
                'email' => 'monica.ramalhoso@nodix.ao',
                'password' => Hash::make('123456789'),
                'role' => 'Administradora',
                'initials' => 'MR',
                'status' => 'Aprovado',
            ],
            [
                'id' => 'USR-01',
                'name' => 'Regina Altubias',
                'email' => 'regina@mwangobrain.com',
                'password' => Hash::make('summit2026'),
                'role' => 'Expositora / Comercial',
                'initials' => 'RA',
                'status' => 'Aprovado',
            ],
            [
                'id' => 'USR-02',
                'name' => 'Edson Manuel',
                'email' => 'edson@mwangobrain.com',
                'password' => Hash::make('summit2026'),
                'role' => 'Comercial',
                'initials' => 'EM',
                'status' => 'Aprovado',
            ],
            [
                'id' => 'USR-03',
                'name' => 'Marta Joaquim',
                'email' => 'marta@mwangobrain.com',
                'password' => Hash::make('summit2026'),
                'role' => 'Comercial',
                'initials' => 'MJ',
                'status' => 'Aprovado',
            ],
            [
                'id' => 'USR-04',
                'name' => 'Paulo Neto',
                'email' => 'paulo@mwangobrain.com',
                'password' => Hash::make('summit2026'),
                'role' => 'Tecnologia',
                'initials' => 'PN',
                'status' => 'Aprovado',
            ],
            [
                'id' => 'USR-05',
                'name' => 'Ana Costa',
                'email' => 'ana@mwangobrain.com',
                'password' => Hash::make('summit2026'),
                'role' => 'Gestora do evento',
                'initials' => 'AC',
                'status' => 'Aprovado',
            ],
        ];

        foreach ($usersList as $u) {
            User::updateOrCreate(['id' => $u['id']], $u);
        }

        // 3. Contacts
        $people = ["João Manuel","Maria José","António Domingos","Helena Mateus","Carlos Alberto","Teresa Joaquim","Paulo Miguel","Sofia André","Nelson Pedro","Lúcia Francisco","Mateus Simão","Ana Paula","Mário António","Esperança Costa","Domingos Neto","Carla Manuel","Elias José","Rosa Miguel","Bento Manuel","Cláudia João","Amélia Pedro","José Eduardo","Marta Domingos","David Francisco","Isabel António","Manuel Joaquim","Sandra Neto","Filipe Costa","Beatriz Miguel","Augusto João"];
        $companies = ["Kwanza Logística","Agro Huíla","Banco Sumbe","Luanda Digital Hub","Cuanza Energia","Benguela Portos","Nova Rede Angola","Planalto Verde","Kassai Seguros","Soyo Tecnologia"];
        $sectors = ["Logística","Agricultura","Serviços financeiros","Tecnologia","Energia","Administração pública"];
        $roles = ["Director de Operações","Gestora Comercial","Administrador","Coordenadora de Projectos"];

        $contactsList = [];
        foreach ($people as $i => $fullName) {
            $id = 'CON-' . (1001 + $i);
            $cleanName = strtolower(preg_replace('/[^a-zA-Z]/', '', iconv('UTF-8', 'ASCII//TRANSLIT', str_replace(' ', '.', $fullName))));
            $email = $cleanName . '@empresa.ao';

            $contactsList[] = [
                'id' => $id,
                'full_name' => $fullName,
                'company' => $companies[$i % count($companies)],
                'role' => $roles[$i % count($roles)],
                'phone' => '+244 9' . (21 + $i % 7) . ' ' . str_pad((string)(120 + $i * 7), 3, '0', STR_PAD_LEFT) . ' ' . str_pad((string)(200 + $i * 11), 3, '0', STR_PAD_LEFT),
                'whatsapp' => '+244 9' . (21 + $i % 7) . ' ' . str_pad((string)(120 + $i * 7), 3, '0', STR_PAD_LEFT) . ' ' . str_pad((string)(200 + $i * 11), 3, '0', STR_PAD_LEFT),
                'email' => $email,
                'sector' => $sectors[$i % count($sectors)],
                'org_type' => ($i % 5 === 2) ? 'Instituição pública' : 'Empresa privada',
                'source' => ($i % 6 === 0) ? 'QR Code' : (($i % 4 === 0) ? 'Captura rápida' : 'Stand'),
                'is_complete' => ($i % 7 !== 0),
                'created_by' => 'USR-01',
                'created_at' => '2026-09-' . str_pad((string)(23 + $i % 3), 2, '0', STR_PAD_LEFT) . ' ' . str_pad((string)(9 + $i % 8), 2, '0', STR_PAD_LEFT) . ':15:00',
            ];

            Contact::updateOrCreate(['id' => $id], $contactsList[$i]);
        }

        // 4. Leads
        $statuses = ["Novo","Contactado","Qualificado","Demonstração","Reunião","Proposta enviada","Em negociação","Convertido","Sem resposta"];
        $needs = ["Centralizar a gestão da frota e inventário.","Digitalizar processos internos e aprovações.","Melhorar a rastreabilidade das operações."];
        $nextActions = ["Agendar reunião","Enviar apresentação","Fazer demonstração","Contactar via WhatsApp"];

        $leadsList = [];
        for ($i = 0; $i < 20; $i++) {
            $id = 'LEAD-' . (301 + $i);
            $solName = $solutions[$i % 6]['name'];

            $leadData = [
                'id' => $id,
                'contact_id' => $contactsList[$i]['id'],
                'solutions' => [$solName],
                'main_solution' => $solName,
                'need' => $needs[$i % 3],
                'has_concrete_need' => ($i % 3 === 0) ? 'Em avaliação' : 'Sim',
                'timeframe' => ($i % 3 === 0) ? '3–6 meses' : '0–3 meses',
                'interest' => ($i % 5 < 2) ? 'Alto' : (($i % 5 < 4) ? 'Médio' : 'Baixo'),
                'status' => $statuses[$i % count($statuses)],
                'owner_id' => 'USR-0' . (1 + $i % 5),
                'next_action' => $nextActions[$i % count($nextActions)],
                'follow_up_date' => '2026-09-' . (24 + $i % 5) . ' 10:00:00',
                'notes' => 'Contacto captado durante o Angola Hub Summit 2026.',
                'estimated_value' => 2500000 + $i * 625000,
            ];

            Lead::updateOrCreate(['id' => $id], $leadData);
            $leadsList[] = $leadData;
        }

        // 5. Interactions
        foreach ($leadsList as $i => $lead) {
            $id1 = "INT-{$i}-1";
            Interaction::updateOrCreate(['id' => $id1], [
                'id' => $id1,
                'lead_id' => $lead['id'],
                'type' => 'Nota',
                'description' => 'Contacto registado no stand da Mwango Brain.',
                'date' => '2026-09-' . (23 + $i % 3) . ' 10:00:00',
                'user_id' => $lead['owner_id'],
            ]);

            $id2 = "INT-{$i}-2";
            Interaction::updateOrCreate(['id' => $id2], [
                'id' => $id2,
                'lead_id' => $lead['id'],
                'type' => ($i % 2) ? 'WhatsApp' : 'E-mail',
                'description' => ($i % 2) ? 'Apresentação enviada por WhatsApp.' : 'Informação da solução enviada por e-mail.',
                'date' => '2026-09-' . (24 + $i % 3) . ' 14:00:00',
                'user_id' => $lead['owner_id'],
            ]);
        }

        // 6. FollowUps
        for ($i = 0; $i < min(23, count($leadsList)); $i++) {
            $lead = $leadsList[$i];
            $id = 'FUP-' . ($i + 1);
            $day = str_pad((string)($i < 7 ? 24 + $i % 3 : 1 + $i), 2, '0', STR_PAD_LEFT);
            $month = ($i < 7) ? '09' : '10';

            FollowUp::updateOrCreate(['id' => $id], [
                'id' => $id,
                'lead_id' => $lead['id'],
                'action' => $lead['next_action'],
                'due_date' => "2026-{$month}-{$day} 09:30:00",
                'owner_id' => $lead['owner_id'],
                'status' => ($i < 7) ? 'Atrasado' : (($i < 13) ? 'Pendente' : (($i < 18) ? 'Pendente' : 'Concluído')),
            ]);
        }

        // 7. Meetings
        $meetingTypes = ["Demonstração","Reunião comercial","Reunião técnica","Apresentação","Follow-up"];
        for ($i = 0; $i < min(9, count($leadsList)); $i++) {
            $lead = $leadsList[$i];
            $id = 'MTG-' . ($i + 1);
            $day = str_pad((string)(25 + $i % 5), 2, '0', STR_PAD_LEFT);

            Meeting::updateOrCreate(['id' => $id], [
                'id' => $id,
                'lead_id' => $lead['id'],
                'type' => $meetingTypes[$i % count($meetingTypes)],
                'start' => "2026-09-{$day} 09:00:00",
                'end' => "2026-09-{$day} 10:00:00",
                'owner_id' => $lead['owner_id'],
                'location' => ($i % 2) ? 'Stand Mwango Brain' : 'Sala de reuniões B',
            ]);
        }

        // 8. VisitorFeedback
        $highlightsOptions = [
            ["Tecnologia","Demonstração"],
            ["Soluções apresentadas","Aplicabilidade"],
            ["Atendimento"]
        ];
        $commentsOptions = [
            "Soluções muito relevantes para o mercado angolano.",
            "Demonstração clara e equipa disponível.",
            "Gostaria de aprofundar a integração com os nossos processos."
        ];

        for ($i = 0; $i < 15; $i++) {
            $id = 'FDB-' . ($i + 1);
            VisitorFeedback::updateOrCreate(['id' => $id], [
                'id' => $id,
                'contact_id' => $contactsList[$i]['id'],
                'overall' => ($i % 5 === 0) ? 4 : 5,
                'team' => ($i % 4 === 0) ? 4 : 5,
                'presentation' => ($i % 3 === 0) ? 4 : 5,
                'relevance' => ($i % 6 === 0) ? 4 : 5,
                'highlights' => $highlightsOptions[$i % count($highlightsOptions)],
                'wants_solution' => $solutions[$i % 6]['name'],
                'wants_contact' => ($i % 4 !== 0),
                'comment' => $commentsOptions[$i % count($commentsOptions)],
            ]);
        }

        // 9. Notifications
        $notifications = [
            ['id' => 'N-1', 'title' => 'Follow-up vence hoje', 'detail' => 'João Manuel · Kwanza Logística', 'date' => 'Hoje, 09:30', 'read' => false, 'href' => '/follow-ups'],
            ['id' => 'N-2', 'title' => 'Novo lead de interesse alto', 'detail' => 'Maria José demonstrou interesse no SIGAFLO', 'date' => 'Hoje, 10:14', 'read' => false, 'href' => '/leads/LEAD-302'],
            ['id' => 'N-3', 'title' => 'Nova reunião agendada', 'detail' => 'Demonstração RIVO · 26 Set, 14:00', 'date' => 'Ontem', 'read' => true, 'href' => '/reunioes'],
        ];

        foreach ($notifications as $n) {
            Notification::updateOrCreate(['id' => $n['id']], $n);
        }

        // 10. InternalEvaluation
        InternalEvaluation::updateOrCreate(
            ['id' => 1],
            [
                'scores' => [
                    'Organização' => 4,
                    'Visibilidade da marca' => 5,
                    'Qualidade dos contactos' => 5,
                    'Quantidade de contactos' => 4,
                    'Interesse nas soluções' => 5,
                    'Qualidade das demonstrações' => 4,
                    'Actuação da equipa comercial' => 5,
                    'Infraestrutura do evento' => 4
                ],
                'went_well' => 'A abordagem prática e as demonstrações geraram conversas de qualidade.',
                'difficulties' => 'Picos de afluência dificultaram o registo completo de alguns contactos.',
                'top_solutions' => ['RIVO', 'SIGAFLO'],
                'main_needs' => 'Digitalização de processos, integração de dados e rastreabilidade.',
                'improvements' => 'Reforçar a equipa nos períodos de maior movimento.',
                'saved_at' => now(),
            ]
        );
    }
}
