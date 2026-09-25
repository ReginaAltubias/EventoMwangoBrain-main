import { createContext, useCallback, useContext, useMemo, useState } from "react";
import {
  CodigoCobranca,
  EstadoProcesso,
  FaseId,
  Parcela,
  ProcessoConcessao,
  gerarRupe,
  processosIniciais,
} from "@/portal/data/concessaoFluxo";

// Estado local (mock) de todos os processos de concessão. Nenhuma persistência remota.
interface Ctx {
  processos: ProcessoConcessao[];
  obter: (id?: string) => ProcessoConcessao | undefined;
  emitirRupe: (id: string, cob: CodigoCobranca) => void;
  registarComprovativo: (id: string, cob: CodigoCobranca, nome: string, parcelas?: Parcela[]) => void;
  confirmarPagamento: (id: string, cob: CodigoCobranca) => void;
  enviarInstrumento: (id: string, instrumentoId: string) => void;
  enviarMensagem: (id: string, texto: string) => void;
  assinarContrato: (id: string) => void;
  registarFiscal: (id: string, nome: string, documento: string) => void;
  concluirRecrutamento: (id: string) => void;
}

const ConcessoesCtx = createContext<Ctx | null>(null);

function avancarPorPagamento(p: ProcessoConcessao, cob: CodigoCobranca): ProcessoConcessao {
  const hoje = new Date().toISOString().slice(0, 10);
  if (cob === "P1") {
    return {
      ...p,
      fase: "F2" as FaseId,
      estado: "Em vistoria" as EstadoProcesso,
      documentos: p.documentos.some((d) => d.codigo === "R01")
        ? p.documentos
        : [...p.documentos, { codigo: "R01", nome: "Recibo do pagamento P1", emitidoEm: hoje }],
    };
  }
  if (cob === "P2") {
    return { ...p, estado: "Aguarda pagamento P2" as EstadoProcesso };
  }
  if (cob === "P3") {
    return {
      ...p,
      fase: "F7" as FaseId,
      estado: "Alvará emitido" as EstadoProcesso,
      alvara: true,
      publicacao: p.publicacao ?? { data: hoje },
      documentos: [
        ...p.documentos.filter((d) => d.codigo !== "D09" && d.codigo !== "D10"),
        { codigo: "D09", nome: "Publicação em Diário da República", emitidoEm: hoje },
        { codigo: "D10", nome: "Alvará e planta", emitidoEm: hoje },
      ],
    };
  }
  return p;
}

export function ConcessoesProvider({ children }: { children: React.ReactNode }) {
  const [processos, setProcessos] = useState<ProcessoConcessao[]>(processosIniciais);

  const patch = useCallback((id: string, fn: (p: ProcessoConcessao) => ProcessoConcessao) => {
    setProcessos((lista) => lista.map((p) => (p.id === id ? fn(p) : p)));
  }, []);

  const patchCob = useCallback(
    (id: string, cob: CodigoCobranca, fn: (c: ProcessoConcessao["cobrancas"][number]) => ProcessoConcessao["cobrancas"][number]) =>
      patch(id, (p) => ({ ...p, cobrancas: p.cobrancas.map((c) => (c.codigo === cob ? fn(c) : c)) })),
    [patch],
  );

  const value = useMemo<Ctx>(
    () => ({
      processos,
      obter: (id) => processos.find((p) => p.id === id),
      emitirRupe: (id, cob) => patchCob(id, cob, (c) => ({ ...c, rupe: c.rupe ?? gerarRupe(cob) })),
      registarComprovativo: (id, cob, nome, parcelas) =>
        patchCob(id, cob, (c) => ({ ...c, comprovativo: nome, parcelas, estado: "Em validação" })),
      confirmarPagamento: (id, cob) => {
        patchCob(id, cob, (c) => ({
          ...c,
          estado: "Paga",
          recibo: cob === "P1" ? "R01" : c.recibo,
          historico: c.contínua
            ? [...(c.historico ?? []), { id: `h${Date.now()}`, data: new Date().toISOString().slice(0, 10), valor: null, referencia: c.rupe ?? "RUPE" }]
            : c.historico,
        }));
        patch(id, (p) => avancarPorPagamento(p, cob));
      },
      enviarInstrumento: (id, instrumentoId) =>
        patch(id, (p) => ({ ...p, instrumentos: p.instrumentos.map((i) => (i.id === instrumentoId ? { ...i, enviado: true } : i)) })),
      enviarMensagem: (id, texto) =>
        patch(id, (p) => ({
          ...p,
          negociacao: {
            ...p.negociacao,
            mensagens: [...p.negociacao.mensagens, { id: `m${Date.now()}`, autor: "Requerente", data: new Date().toISOString().slice(0, 10), texto }],
          },
        })),
      assinarContrato: (id) =>
        patch(id, (p) => {
          const hoje = new Date().toISOString().slice(0, 10);
          return {
            ...p,
            fase: "F7",
            estado: "Contrato celebrado",
            contrato: { assinadoEm: hoje, hash: Math.random().toString(16).slice(2, 6).toUpperCase() + "-" + Math.random().toString(16).slice(2, 6).toUpperCase() + "-9C4D-13A0" },
            documentos: p.documentos.some((d) => d.codigo === "D08")
              ? p.documentos
              : [...p.documentos, { codigo: "D08", nome: "Contrato de concessão (2 vias)", emitidoEm: hoje }],
            cobrancas: p.cobrancas.some((c) => c.codigo === "P3")
              ? p.cobrancas
              : [
                  ...p.cobrancas,
                  {
                    codigo: "P3" as CodigoCobranca,
                    fase: "F7" as FaseId,
                    titulo: "P3 — Emissão de alvará e publicação",
                    bloqueio: "O alvará e a planta (D10) só ficam disponíveis após a confirmação deste pagamento.",
                    estado: "Pendente" as const,
                    linhas: [{ codigo: "P3", descricao: "Encargos de contrato, publicação e alvará", detalhe: "Cobrado ao Concessionário", valor: null }],
                  },
                ],
          };
        }),
      registarFiscal: (id, nome, documento) =>
        patch(id, (p) => ({
          ...p,
          fiscais: [...p.fiscais, { id: `f${Date.now()}`, nome, documento, estado: "Pendente de juramentação pelo IDF" }],
        })),
      concluirRecrutamento: (id) => patch(id, (p) => ({ ...p, fiscaisRecrutados: true })),
    }),
    [processos, patch, patchCob],
  );

  return <ConcessoesCtx.Provider value={value}>{children}</ConcessoesCtx.Provider>;
}

export function useConcessoes() {
  const ctx = useContext(ConcessoesCtx);
  if (!ctx) throw new Error("useConcessoes fora do ConcessoesProvider");
  return ctx;
}
