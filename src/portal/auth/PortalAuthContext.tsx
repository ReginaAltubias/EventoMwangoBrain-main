import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { contas, type OperadorConta } from "@/portal/data/mock";

// Extensão de produto (não é requisito directo da DRF-02):
// fluxo de "login automático ao candidatar-se" — guarda a intenção do
// visitante e retoma-a após autenticação, sem perder o contexto da página.
export interface LoginIntent {
  tipo: "concurso" | "concessao";
  id: string;
}

interface PortalAuthCtx {
  operador: OperadorConta | null;
  entrar: (identificador: string, password: string) => { ok: boolean; erro?: string; estado?: string };
  sair: () => void;
  registar: (conta: OperadorConta) => void;
  actualizarPerfil: (dados: Partial<OperadorConta>) => void;
  simularAprovacao: () => void;
  intent: LoginIntent | null;
  setIntent: (i: LoginIntent | null) => void;
  authModalAberto: boolean;
  abrirAuthModal: (intent: LoginIntent) => void;
  fecharAuthModal: () => void;
}

const Ctx = createContext<PortalAuthCtx | null>(null);
const KEY = "idf.portal.sessao";

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [contasExtra, setContasExtra] = useState<OperadorConta[]>([]);
  // Sem ecrã de login: o painel abre sempre com a conta activa de demonstração.
  const contaPadrao = contas.find((c) => c.estado === "Activo") ?? contas[0];
  const [operador, setOperador] = useState<OperadorConta | null>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as OperadorConta) : contaPadrao;
    } catch {
      return contaPadrao;
    }
  });
  const [intent, setIntent] = useState<LoginIntent | null>(null);
  const [authModalAberto, setAuthModalAberto] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setOperador(JSON.parse(raw));
      else setOperador(contaPadrao);
    } catch {
      /* sessão inválida — ignora */
    }
  }, []);

  const todas = useMemo(() => [...contas, ...contasExtra], [contasExtra]);

  const persistir = (op: OperadorConta | null) => {
    setOperador(op);
    if (op) localStorage.setItem(KEY, JSON.stringify(op));
    else localStorage.removeItem(KEY);
  };

  const entrar = useCallback(
    (identificador: string, password: string) => {
      const id = identificador.trim().toLowerCase();
      const conta = todas.find((c) => c.nif === identificador.trim() || c.email.toLowerCase() === id);
      if (!conta || conta.password !== password) return { ok: false, erro: "Credenciais inválidas. Verifique o NIF/e-mail e a palavra-passe." };
      persistir(conta);
      return { ok: true, estado: conta.estado };
    },
    [todas],
  );

  const sair = useCallback(() => persistir(null), []);

  const registar = useCallback((conta: OperadorConta) => {
    setContasExtra((prev) => [...prev, conta]);
    persistir(conta);
  }, []);

  const actualizarPerfil = useCallback(
    (dados: Partial<OperadorConta>) => {
      if (!operador) return;
      persistir({ ...operador, ...dados });
    },
    [operador],
  );

  const simularAprovacao = useCallback(() => {
    // Apenas para demonstração (mock): aprova o registo em análise.
    if (!operador || operador.estado !== "EmAnalise") return;
    const aprovado: OperadorConta = { ...operador, estado: "Activo", nrof: "NROF-0" + (300 + Math.floor(Math.random() * 600)) };
    persistir(aprovado);
  }, [operador]);

  const abrirAuthModal = useCallback((i: LoginIntent) => {
    setIntent(i);
    setAuthModalAberto(true);
  }, []);

  const fecharAuthModal = useCallback(() => {
    setAuthModalAberto(false);
    setIntent(null);
  }, []);

  const value = useMemo(
    () => ({ operador, entrar, sair, registar, actualizarPerfil, simularAprovacao, intent, setIntent, authModalAberto, abrirAuthModal, fecharAuthModal }),
    [operador, entrar, sair, registar, actualizarPerfil, simularAprovacao, intent, authModalAberto, abrirAuthModal, fecharAuthModal],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePortalAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePortalAuth fora do provider");
  return ctx;
}
