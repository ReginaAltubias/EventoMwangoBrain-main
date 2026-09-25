export type Role = "super-admin" | "moderador" | "suporte";
export type UserStatus = "activa" | "suspensa" | "banida" | "eliminada" | "pendente";
export type AccountType = "Real" | "Número Kamba";
export type ReportStatus = "nova" | "em análise" | "resolvida";

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  kamba: string;
  email: string;
  initials: string;
  status: UserStatus;
  account: AccountType;
  province: string;
  joined: string;
  lastSeen: string;
  messages: number;
  reports: number;
}

export interface Report {
  id: string;
  reporter: string;
  reported: string;
  reason: string;
  priority: "alta" | "média" | "baixa";
  status: ReportStatus;
  time: string;
  preview: string;
  messages: { from: "reporter" | "reported"; text: string; flagged?: boolean }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  twoFactor: boolean;
  lastSeen: string;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  reason: string;
  ip: string;
  time: string;
}