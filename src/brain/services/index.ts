import { api } from "../lib/api";
import type { Contact, FollowUp, Lead, Meeting, VisitorFeedback } from "../types";

export const brainService = {
  getContacts: () => api.get<Contact[]>("/api/contacts"),
  getLeads: () => api.get<Lead[]>("/api/leads"),
  getFollowUps: () => api.get<FollowUp[]>("/api/follow-ups"),
  getMeetings: () => api.get<Meeting[]>("/api/meetings"),
  getFeedback: () => api.get<VisitorFeedback[]>("/api/feedback"),
};
