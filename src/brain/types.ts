export type Solution = string;
export interface SolutionItem { id: string; name: Solution; subtitle: string; }
export type SolutionWriteInput = Pick<SolutionItem, "name" | "subtitle">;
export type InterestLevel = "Alto" | "Médio" | "Baixo";
export type LeadStatus = "Novo" | "Contactado" | "Qualificado" | "Demonstração" | "Reunião" | "Proposta enviada" | "Em negociação" | "Convertido" | "Sem interesse" | "Sem resposta";
export type OrgType = "Empresa privada" | "Instituição pública" | "Startup" | "ONG" | "Banco / Instituição financeira" | "Investidor" | "Parceiro" | "Outro";
export type NextAction = "Ligar" | "Contactar via WhatsApp" | "Enviar apresentação" | "Fazer demonstração" | "Agendar reunião" | "Preparar proposta" | "Encaminhar para equipa técnica" | "Nenhuma ação";
export interface Contact { id: string; fullName: string; company: string; role?: string | null; phone: string; whatsapp?: string | null; email?: string | null; sector?: string | null; orgType?: OrgType | null; notes?: string | null; source: "Stand" | "QR Code" | "Captura rápida"; createdAt: string; createdBy: string; isComplete: boolean; }
export type ContactCreateInput = Pick<Contact, "fullName" | "company" | "phone" | "source"> &
  Partial<Pick<Contact, "role" | "whatsapp" | "email" | "sector" | "orgType" | "notes">>;
export interface Lead { id: string; contactId: string; solutions: Solution[]; mainSolution: Solution; need?: string | null; hasConcreteNeed: "Sim" | "Não" | "Em avaliação"; timeframe?: "0–3 meses" | "3–6 meses" | "6–12 meses" | "Sem prazo definido" | null; interest: InterestLevel; status: LeadStatus; ownerId: string; nextAction: NextAction; followUpDate?: string | null; notes?: string | null; estimatedValue?: number | null; }
export type LeadWriteInput = Pick<Lead, "contactId" | "mainSolution" | "interest" | "status" | "ownerId"> &
  Partial<Pick<Lead, "solutions" | "need" | "hasConcreteNeed" | "timeframe" | "nextAction" | "followUpDate" | "notes" | "estimatedValue">>;
export interface LeadDetail extends Lead { contact?: Contact; interactions?: Interaction[]; }
export interface ContactDetail extends Contact { leads?: Lead[]; feedback?: VisitorFeedback[]; }
export interface Interaction { id: string; leadId: string; type: "Nota" | "Chamada" | "WhatsApp" | "E-mail" | "Demonstração" | "Reunião" | "Estado alterado"; description: string; date: string; userId: string; }
export type InteractionType = Interaction["type"];
export type InteractionCreateInput = Pick<Interaction, "leadId" | "type" | "description">;
export type LeadInteractionCreateInput = Pick<Interaction, "type" | "description">;
export interface FollowUp { id: string; leadId: string; action: NextAction; dueDate: string; ownerId: string; status: "Pendente" | "Concluído" | "Atrasado"; }
export type FollowUpCreateInput = Pick<FollowUp, "leadId" | "action" | "dueDate">;
export interface Meeting { id: string; leadId: string; type: "Demonstração" | "Reunião comercial" | "Reunião técnica" | "Apresentação" | "Follow-up"; start: string; end: string; ownerId: string; location?: string | null; }
export interface VisitorFeedback { id: string; contactId?: string | null; overall: 1|2|3|4|5; team: number; presentation: number; relevance: number; highlights: string[]; wantsSolution?: Solution | null; wantsContact: boolean; comment?: string | null; }
export type AccountStatus = "Pendente" | "Aprovado";
export interface BrainUser { id: string; name: string; email: string; role: string; initials: string; status: AccountStatus; }
export interface TeamMemberSummary { id: string | number; name: string; email: string; }
export interface Notification { id: string; title: string; detail: string; date: string; read: boolean; href: string; }
export interface InternalEvaluation { scores: Record<string, number>; wentWell: string; difficulties: string; topSolutions: Solution[]; mainNeeds: string; improvements: string; savedAt?: string | null; }
export interface BrainState { contacts: Contact[]; leads: Lead[]; interactions: Interaction[]; followUps: FollowUp[]; meetings: Meeting[]; feedback: VisitorFeedback[]; notifications: Notification[]; evaluation: InternalEvaluation; users: TeamMemberSummary[]; solutions: SolutionItem[]; }
