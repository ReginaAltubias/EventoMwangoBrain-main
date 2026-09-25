import type { AdminUser, AppUser, AuditEntry, Report } from "@/types/mokamba";

export const users: AppUser[] = [
  { id: "USR-10482", name: "Ana Manuel", phone: "+244 923 104 882", kamba: "884 120 119", email: "ana.manuel@exemplo.ao", initials: "AM", status: "activa", account: "Real", province: "Luanda", joined: "12 Set 2026", lastSeen: "há 4 minutos", messages: 12480, reports: 0 },
  { id: "USR-10465", name: "Mateus António", phone: "+244 932 740 116", kamba: "773 094 218", email: "mateus.a@exemplo.ao", initials: "MA", status: "suspensa", account: "Número Kamba", province: "Benguela", joined: "10 Set 2026", lastSeen: "há 2 horas", messages: 2894, reports: 4 },
  { id: "USR-10441", name: "Esperança Joaquim", phone: "+244 944 018 520", kamba: "660 482 019", email: "esperanca.j@exemplo.ao", initials: "EJ", status: "activa", account: "Real", province: "Huíla", joined: "8 Set 2026", lastSeen: "há 18 minutos", messages: 6721, reports: 1 },
  { id: "USR-10409", name: "Domingos Pedro", phone: "+244 921 663 904", kamba: "552 803 477", email: "domingos.p@exemplo.ao", initials: "DP", status: "banida", account: "Número Kamba", province: "Huambo", joined: "3 Set 2026", lastSeen: "há 5 dias", messages: 844, reports: 8 },
  { id: "USR-10388", name: "Teresa Miguel", phone: "+244 955 340 829", kamba: "449 305 188", email: "teresa.m@exemplo.ao", initials: "TM", status: "pendente", account: "Real", province: "Cabinda", joined: "1 Set 2026", lastSeen: "há 1 dia", messages: 12, reports: 0 },
  { id: "USR-10357", name: "Paulo Neto", phone: "+244 933 290 047", kamba: "337 921 604", email: "paulo.neto@exemplo.ao", initials: "PN", status: "activa", account: "Real", province: "Uíge", joined: "28 Ago 2026", lastSeen: "agora", messages: 9371, reports: 1 },
];

export const reports: Report[] = [
  { id: "DEN-2094", reporter: "Ana Manuel", reported: "Domingos Pedro", reason: "Assédio e intimidação", priority: "alta", status: "nova", time: "há 12 minutos", preview: "Mensagens repetidas com linguagem intimidatória.", messages: [{ from: "reporter", text: "Peço que não volte a contactar-me." }, { from: "reported", text: "Não podes fugir para sempre.", flagged: true }, { from: "reported", text: "Se não responderes, vou procurar-te.", flagged: true }] },
  { id: "DEN-2093", reporter: "Mateus António", reported: "Conta Comercial Kilamba", reason: "Fraude ou burla", priority: "alta", status: "em análise", time: "há 36 minutos", preview: "Pedido de transferência para desbloquear um prémio.", messages: [{ from: "reported", text: "Ganhou 250.000 Kz. Transfira 5.000 Kz para activar.", flagged: true }, { from: "reporter", text: "Isto é oficial?" }] },
  { id: "DEN-2092", reporter: "Esperança Joaquim", reported: "Grupo Vendas Sul", reason: "Conteúdo impróprio", priority: "média", status: "nova", time: "há 2 horas", preview: "Publicação não autorizada num grupo público.", messages: [{ from: "reported", text: "Conteúdo removido da pré-visualização.", flagged: true }] },
  { id: "DEN-2089", reporter: "Paulo Neto", reported: "Utilizador 449305188", reason: "Spam", priority: "baixa", status: "resolvida", time: "há 1 dia", preview: "Envio repetido da mesma ligação.", messages: [{ from: "reported", text: "Veja esta oportunidade única.", flagged: true }] },
];

export const activity = [
  { day: "18 Set", messages: 930000, calls: 68000, users: 122000 }, { day: "19 Set", messages: 1010000, calls: 71000, users: 126000 },
  { day: "20 Set", messages: 980000, calls: 69500, users: 124000 }, { day: "21 Set", messages: 1140000, calls: 76000, users: 131000 },
  { day: "22 Set", messages: 1230000, calls: 81000, users: 136000 }, { day: "23 Set", messages: 1190000, calls: 79200, users: 134000 },
  { day: "Hoje", messages: 1284000, calls: 84600, users: 142800 },
];

export const accountGrowth = [
  { month: "Abr", real: 18400, kamba: 12900 }, { month: "Mai", real: 22300, kamba: 15600 }, { month: "Jun", real: 26900, kamba: 19100 },
  { month: "Jul", real: 31200, kamba: 22800 }, { month: "Ago", real: 36700, kamba: 26400 }, { month: "Set", real: 42100, kamba: 31800 },
];

export const groups = [
  { id: "GRP-820", name: "Empreendedores de Angola", members: 18342, reports: 3, owner: "Mário Costa", status: "Activo" },
  { id: "GRP-774", name: "Mercado do Kilamba", members: 12409, reports: 8, owner: "Sofia José", status: "Em análise" },
  { id: "GRP-691", name: "Estudantes da Huíla", members: 9871, reports: 0, owner: "Paulo Neto", status: "Activo" },
  { id: "GRP-540", name: "Oportunidades Luanda", members: 22804, reports: 14, owner: "António Lemos", status: "Suspenso" },
];

export const admins: AdminUser[] = [
  { id: "ADM-01", name: "Deusineusio dos Santos", email: "admin@mokamba.ao", role: "super-admin", active: true, twoFactor: true, lastSeen: "agora" },
  { id: "ADM-02", name: "Marta João", email: "marta.joao@mokamba.ao", role: "moderador", active: true, twoFactor: true, lastSeen: "há 8 minutos" },
  { id: "ADM-03", name: "Elias Neto", email: "elias.neto@mokamba.ao", role: "suporte", active: true, twoFactor: false, lastSeen: "há 3 horas" },
  { id: "ADM-04", name: "Carla Domingos", email: "carla.d@mokamba.ao", role: "moderador", active: false, twoFactor: true, lastSeen: "há 12 dias" },
];

export const audit: AuditEntry[] = [
  { id: "AUD-5519", actor: "Marta João", action: "Suspendeu utilizador", target: "USR-10465", reason: "Spam repetido durante 7 dias", ip: "105.168.42.18", time: "há 18 minutos" },
  { id: "AUD-5518", actor: "Deusineusio dos Santos", action: "Publicou termos", target: "Termos v3.2", reason: "Actualização regulamentar", ip: "41.63.84.102", time: "há 1 hora" },
  { id: "AUD-5517", actor: "Marta João", action: "Resolveu denúncia", target: "DEN-2089", reason: "Conteúdo removido e aviso enviado", ip: "105.168.42.18", time: "há 2 horas" },
  { id: "AUD-5516", actor: "Elias Neto", action: "Terminou sessões", target: "USR-10357", reason: "Pedido do titular da conta", ip: "197.149.20.61", time: "há 4 horas" },
];