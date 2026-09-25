import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Wallet,
  Banknote,
  ReceiptText,
  CheckCircle2,
  Hourglass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { KpiCards } from "@/sigaflo/templates/KpiCards";
import { PagamentoRUPE } from "@/portal/components/PagamentoRUPE";
import { EstadoBadge, PortalBadge } from "@/portal/components/Badges";
import { kz } from "@/portal/data/mock";
import { FASES, indiceFase } from "@/portal/data/concessaoFluxo";
import { useConcessoes } from "@/portal/state/ConcessoesStore";
import { cn } from "@/lib/utils";

interface LinhaFinanceira {
  chave: string;
  codigo: string;
  descricao: string;
  fase: string;
  faseNome: string;
  concessaoId: string;
  concessaoCodigo: string;
  cobranca: string;
  valor: number | null;
  estado: string;
}

type Vista = "pendentes" | "liquidadas";

export default function FinanceiroPage() {
  const { processos } = useConcessoes();
  const reduceMotion = useReducedMotion();
  const [vista, setVista] = useState<Vista>("pendentes");
  const [pagamentoAberto, setPagamentoAberto] = useState<{ concessaoId: string; cobranca: string } | null>(null);

  const cobrancaActiva = useMemo(() => {
    if (!pagamentoAberto) return null;
    const proc = processos.find((p) => p.id === pagamentoAberto.concessaoId);
    const cob = proc?.cobrancas.find((c) => c.codigo === pagamentoAberto.cobranca);
    return proc && cob ? { processoId: proc.id, cobranca: cob } : null;
  }, [pagamentoAberto, processos]);

  const linhas: LinhaFinanceira[] = useMemo(
    () =>
      processos.flatMap((p) =>
        p.cobrancas.flatMap((c) =>
          c.linhas.map((l, i) => ({
            chave: `${p.id}-${c.codigo}-${i}`,
            codigo: l.codigo,
            descricao: l.descricao,
            fase: c.fase,
            faseNome: FASES[indiceFase(c.fase)].nome,
            concessaoId: p.id,
            concessaoCodigo: p.codigo,
            cobranca: c.codigo,
            valor: l.valor,
            estado: c.estado,
          })),
        ),
      ),
    [processos],
  );

  const pendentes = linhas.filter((l) => l.estado !== "Paga");
  const pagas = linhas.filter((l) => l.estado === "Paga");
  const totalPendente = pendentes.reduce((s, l) => s + (l.valor ?? 0), 0);
  const totalPago = pagas.reduce((s, l) => s + (l.valor ?? 0), 0);
  const temPorConfirmar = pendentes.some((l) => l.valor === null);

  const visiveis = vista === "pendentes" ? pendentes : pagas;
  const totalVista = visiveis.reduce((s, l) => s + (l.valor ?? 0), 0);
  const porConfirmarVista = visiveis.some((l) => l.valor === null);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-bold">
            <Wallet className="h-5 w-5 text-primary" /> Financeiro
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cobranças das suas concessões, liquidáveis via RUPE.
          </p>
        </div>
      </div>

      <KpiCards
        columns={3}
        items={[
          {
            icon: Banknote,
            tone: "destructive",
            label: "Total pendente",
            value: kz(totalPendente),
            hint: temPorConfirmar ? "+ encargos a confirmar" : "Valores liquidáveis via RUPE",
          },
          {
            icon: ReceiptText,
            label: "Cobranças pendentes",
            value: pendentes.length,
            tone: "warning",
            hint: "Aguardam pagamento ou validação",
          },
          {
            icon: CheckCircle2,
            label: "Cobranças liquidadas",
            value: pagas.length,
            tone: "success",
            hint: `${kz(totalPago)} confirmados`,
          },
        ]}
      />

      <section className="card-elevated overflow-hidden rounded-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">Cobranças por fase do processo</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Cada cobrança liga directamente ao ecrã de pagamento RUPE da concessão de origem.
            </p>
          </div>
          <div className="flex rounded-lg border border-border bg-muted/40 p-1">
            {(
              [
                { id: "pendentes", label: "Pendentes", count: pendentes.length, icon: Hourglass },
                { id: "liquidadas", label: "Liquidadas", count: pagas.length, icon: CheckCircle2 },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setVista(t.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
                  vista === t.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <t.icon className="h-3.5 w-3.5" />
                {t.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] leading-none",
                    vista === t.id ? "bg-primary-foreground/20" : "bg-muted",
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={vista}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {visiveis.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
                <CheckCircle2 className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-sm font-medium">
                  {vista === "pendentes" ? "Sem cobranças pendentes" : "Ainda sem cobranças liquidadas"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {vista === "pendentes"
                    ? "Todas as cobranças das suas concessões estão liquidadas."
                    : "Os pagamentos confirmados aparecerão aqui."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-5 py-3 font-semibold">Código</th>
                      <th className="px-3 py-3 font-semibold">Descrição</th>
                      <th className="px-3 py-3 font-semibold">Fase</th>
                      <th className="px-3 py-3 font-semibold">Concessão</th>
                      <th className="px-3 py-3 text-right font-semibold">Valor</th>
                      <th className="px-3 py-3 font-semibold">Estado</th>
                      <th className="px-5 py-3 text-right font-semibold">Acção</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {visiveis.map((l, i) => (
                      <motion.tr
                        key={l.chave}
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: reduceMotion ? 0 : Math.min(i * 0.03, 0.3) }}
                        className="transition-colors hover:bg-muted/30"
                      >
                        <td className="px-5 py-3">
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-bold text-primary">
                            {l.codigo}
                          </span>
                        </td>
                        <td className="max-w-[280px] px-3 py-3 font-medium">{l.descricao}</td>
                        <td className="px-3 py-3">
                          <PortalBadge tom="cinza">
                            {l.fase} · {l.faseNome}
                          </PortalBadge>
                        </td>
                        <td className="px-3 py-3">
                          <Link
                            to={`/painel/concessoes/${l.concessaoId}`}
                            className="text-xs font-semibold text-primary hover:underline"
                          >
                            {l.concessaoCodigo}
                          </Link>
                        </td>
                        <td className="px-3 py-3 text-right font-semibold tabular-nums">
                          {l.valor === null ? (
                            <span className="text-xs font-medium text-muted-foreground">a confirmar</span>
                          ) : (
                            kz(l.valor)
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <EstadoBadge estado={l.estado === "Em validação" ? "Em análise" : l.estado} />
                        </td>
                        <td className="px-5 py-3 text-right">
                          <Button
                            size="sm"
                            variant={l.estado === "Paga" ? "outline" : "default"}
                            onClick={() =>
                              setPagamentoAberto({ concessaoId: l.concessaoId, cobranca: l.cobranca })
                            }
                          >
                            <Wallet className="mr-1.5 h-3.5 w-3.5" />
                            {l.estado === "Paga" ? "Ver cobrança" : "Pagar"}
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-border bg-muted/40">
                      <td colSpan={4} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Total {vista === "pendentes" ? "pendente" : "liquidado"} · {visiveis.length}{" "}
                        {visiveis.length === 1 ? "cobrança" : "cobranças"}
                      </td>
                      <td className="px-3 py-3 text-right font-bold tabular-nums">
                        {kz(totalVista)}
                        {porConfirmarVista && (
                          <span className="ml-1 text-xs font-medium text-muted-foreground">+ a confirmar</span>
                        )}
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <Dialog open={pagamentoAberto !== null} onOpenChange={(aberto) => !aberto && setPagamentoAberto(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Pagamento via RUPE</DialogTitle>
            <DialogDescription>
              {pagamentoAberto
                ? `Cobrança ${pagamentoAberto.cobranca} da concessão ${
                    processos.find((p) => p.id === pagamentoAberto.concessaoId)?.codigo ?? ""
                  } — gere a referência única, submeta o comprovativo e acompanhe a validação.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          {cobrancaActiva && (
            <PagamentoRUPE processoId={cobrancaActiva.processoId} cobranca={cobrancaActiva.cobranca} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
