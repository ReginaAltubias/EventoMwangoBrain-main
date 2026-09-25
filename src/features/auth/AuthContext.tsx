import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role } from "@/types/mokamba";

type AuthContextValue = { authenticated: boolean; role: Role; login: () => void; logout: () => void; setRole: (role: Role) => void };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => localStorage.getItem("mokamba.session") === "active");
  const [role, setRoleState] = useState<Role>(() => (localStorage.getItem("mokamba.role") as Role) || "super-admin");
  const value = useMemo(() => ({ authenticated, role, login: () => { localStorage.setItem("mokamba.session", "active"); setAuthenticated(true); }, logout: () => { localStorage.removeItem("mokamba.session"); setAuthenticated(false); }, setRole: (next: Role) => { localStorage.setItem("mokamba.role", next); setRoleState(next); } }), [authenticated, role]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth deve ser usado dentro de AuthProvider");
  return value;
}