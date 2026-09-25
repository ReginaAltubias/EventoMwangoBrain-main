export type Solution = string;
export interface SolutionItem { id: string; name: Solution; subtitle: string; }
export type InterestLevel = "Alto" | "Médio" | "Baixo";
export type LeadStatus = "Novo" | "Contactado" | "Qualificado" | "Demonstração" | "Reunião" | "Proposta enviada" | "Em negociação" | "Convertido" | "Sem interesse" | "Sem resposta";
export type OrgType = "Empresa privada" | "Instituição pública" | "Startup" | "ONG" | "Banco / Instituição financeira" | "Investidor" | "Parceiro" | "Outro";
export type NextAction = "Ligar" | "Contactar via WhatsApp" | "Enviar apresentação" | "Fazer demonstração" | "Agendar reunião" | "Preparar proposta" | "Encaminhar para equipa técnica" | "Nenhuma ação";
export interface Contact { id: string; fullName: string; company: string; role?: string; phone: string; whatsapp?: string; email?: string; sector?: string; orgType?: OrgType; source: "Stand" | "QR Code" | "Captura rápida"; createdAt: string; createdBy: string; isComplete: boolean; }
export interface Lead { id: string; contactId: string; solutions: Solution[]; mainSolution: Solution; need?: string; hasConcreteNeed: "Sim" | "Não" | "Em avaliação"; timeframe?: "0–3 meses" | "3–6 meses" | "6–12 meses" | "Sem prazo definido"; interest: InterestLevel; status: LeadStatus; ownerId: string; nextAction: NextAction; followUpDate?: string; notes?: string; estimatedValue?: number; }
export interface Interaction { id: string; leadId: string; type: "Nota" | "Chamada" | "WhatsApp" | "E-mail" | "Demonstração" | "Reunião" | "Estado alterado"; description: string; date: string; userId: string; }
export interface FollowUp { id: string; leadId: string; action: NextAction; dueDate: string; ownerId: string; status: "Pendente" | "Concluído" | "Atrasado"; }
export interface Meeting { id: string; leadId: string; type: "Demonstração" | "Reunião comercial" | "Reunião técnica" | "Apresentação" | "Follow-up"; start: string; end: string; ownerId: string; location?: string; }
export interface VisitorFeedback { id: string; contactId?: string; overall: 1|2|3|4|5; team: number; presentation: number; relevance: number; highlights: string[]; wantsSolution?: Solution; wantsContact: boolean; comment?: string; }
export type AccountStatus = "Pendente" | "Aprovado";
export interface BrainUser { id: string; name: string; email: string; role: string; initials: string; status: AccountStatus; }
export interface Notification { id: string; title: string; detail: string; date: string; read: boolean; href: string; }
export interface InternalEvaluation { scores: Record<string, number>; wentWell: string; difficulties: string; topSolutions: Solution[]; mainNeeds: string; improvements: string; savedAt?: string; }
export interface BrainState { contacts: Contact[]; leads: Lead[]; interactions: Interaction[]; followUps: FollowUp[]; meetings: Meeting[]; feedback: VisitorFeedback[]; notifications: Notification[]; evaluation: InternalEvaluation; users: BrainUser[]; solutions: SolutionItem[]; }
