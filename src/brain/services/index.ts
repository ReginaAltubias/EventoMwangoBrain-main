import { api } from "../lib/api";
import type { Contact, ContactCreateInput, ContactDetail, FollowUp, FollowUpCreateInput, Interaction, InteractionCreateInput, InternalEvaluation, Lead, LeadDetail, LeadInteractionCreateInput, LeadWriteInput, Meeting, Notification, SolutionItem, SolutionWriteInput, TeamMemberSummary, VisitorFeedback } from "../types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isInternalEvaluation(value: unknown): value is InternalEvaluation {
  if (!isRecord(value) || !isRecord(value.scores)) return false;
  if (!Object.values(value.scores).every(
    score => typeof score === "number" && Number.isInteger(score) && score >= 1 && score <= 5,
  )) return false;
  if (
    typeof value.wentWell !== "string" ||
    typeof value.difficulties !== "string" ||
    !Array.isArray(value.topSolutions) ||
    !value.topSolutions.every(solution => typeof solution === "string") ||
    typeof value.mainNeeds !== "string" ||
    typeof value.improvements !== "string"
  ) return false;
  return value.savedAt === undefined || value.savedAt === null || typeof value.savedAt === "string";
}

function requireInternalEvaluation(value: unknown): InternalEvaluation {
  if (!isInternalEvaluation(value)) {
    throw new Error("A API devolveu uma avaliação interna com formato inválido.");
  }
  return value;
}

export const brainService = {
  getContacts: () => api.get<Contact[]>("/api/contacts"),
  getContact: (id: string) => api.get<ContactDetail>(`/api/contacts/${encodeURIComponent(id)}`),
  createContact: (data: ContactCreateInput) => api.post<unknown>("/api/contacts", data),
  updateContact: (id: string, data: ContactCreateInput) =>
    api.put<ContactDetail>(`/api/contacts/${encodeURIComponent(id)}`, data),
  deleteContact: (id: string) => api.delete<unknown>(`/api/contacts/${encodeURIComponent(id)}`),
  getLeads: () => api.get<Lead[]>("/api/leads"),
  getLead: (id: string) => api.get<LeadDetail>(`/api/leads/${encodeURIComponent(id)}`),
  createLead: (data: LeadWriteInput) => api.post<Lead>("/api/leads", data),
  updateLead: (id: string, data: LeadWriteInput) =>
    api.put<Lead>(`/api/leads/${encodeURIComponent(id)}`, data),
  deleteLead: (id: string) => api.delete<unknown>(`/api/leads/${encodeURIComponent(id)}`),
  updateLeadStatus: (id: string, status: Lead["status"]) =>
    api.patch<Lead>(`/api/leads/${encodeURIComponent(id)}/status`, { status }),
  getInteractions: () => api.get<Interaction[]>("/api/interactions"),
  createInteraction: (data: InteractionCreateInput) =>
    api.post<Interaction>("/api/interactions", data),
  createInteractionForLead: (leadId: string, data: LeadInteractionCreateInput) =>
    api.post<Interaction>(`/api/leads/${encodeURIComponent(leadId)}/interactions`, data),
  getFollowUps: () => api.get<FollowUp[]>("/api/follow-ups"),
  createFollowUp: (data: FollowUpCreateInput) => api.post<FollowUp>("/api/follow-ups", data),
  updateFollowUp: (id: string) =>
    api.put<FollowUp>(`/api/follow-ups/${encodeURIComponent(id)}`),
  completeFollowUp: (id: string) =>
    api.patch<FollowUp>(`/api/follow-ups/${encodeURIComponent(id)}/complete`),
  getMeetings: () => api.get<Meeting[]>("/api/meetings"),
  getFeedback: () => api.get<VisitorFeedback[]>("/api/feedback"),
  createFeedback: (data: Omit<VisitorFeedback, "id">) =>
    api.post<VisitorFeedback>("/api/feedback", data),
  getUsers: () => api.get<TeamMemberSummary[]>("/api/users"),
  deleteUser: (id: string | number) =>
    api.delete<unknown>(`/api/users/${encodeURIComponent(String(id))}`),
  getNotifications: () => api.get<Notification[]>("/api/notifications"),
  markNotificationRead: (id: string) =>
    api.patch<{ ok: boolean }>(`/api/notifications/${encodeURIComponent(id)}/read`),
  getSolutions: () => api.get<SolutionItem[]>("/api/solutions"),
  createSolution: (data: SolutionWriteInput) => api.post<SolutionItem>("/api/solutions", data),
  updateSolution: (id: string, data: SolutionWriteInput) =>
    api.patch<SolutionItem>(`/api/solutions/${encodeURIComponent(id)}`, data),
  deleteSolution: (id: string) =>
    api.delete<unknown>(`/api/solutions/${encodeURIComponent(id)}`),
  createMeeting: (meeting: Omit<Meeting, "id" | "ownerId">, ownerId: string) =>
    api.post<Meeting>("/api/meetings", { ...meeting, ownerId }),
  getEvaluation: async () =>
    requireInternalEvaluation(await api.get<unknown>("/api/evaluation")),
  saveEvaluation: async (evaluation: InternalEvaluation) => {
    requireInternalEvaluation(evaluation);
    return requireInternalEvaluation(await api.post<unknown>("/api/evaluation", evaluation));
  },
};
