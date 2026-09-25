import { useState } from "react";
import { BadgeCheck, BellRing, Copy, Download, FileCheck2, Lock, Receipt, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { EstadoBadge, PortalBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { useConcessoes } from "@/portal/state/ConcessoesStore";
import type { Cobranca, Parcela } from "@/portal/data/concessaoFluxo";
import { kz, fmtData } from "@/portal/data/mock";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Jornada de cobrança em 6 passos, reutilizada em P1, P2, P3 e P4.
export function PagamentoRUPE({ processoId, cobranca }: { processoId: string; cobranca: Cobranca }) {
  const { emitirRupe, registarComprovativo, confirmarPagamento } = useConcessoes();
  const [prestacoes, setPrestacoes] = useState(false);
  const [nParcelas, setNParcelas] = useState(3);
  const [ficheiro, setFicheiro] = useState<string | null>(null);

  const total = cobranca.linhas.reduce<number | null>((s, l) => (s === null || l.valor === null ? (l.valor === null ? null : s) : s + l.valor), 0);
  const temValor = cobranca.linhas.every((l) => l.valor !== null);
  const paga = cobranca.estado === "Paga";

  const parcelas: Parcela[] =
    temValor && total !== null
      ? Array.from({ length: nParcelas }, (_, i) => ({
          n: i + 1,
          valor: Math.round(total / nParcelas),
          vencimento: new Date(Date.now() + (i + 1) * 30 * 86400000).toISOString().slice(0, 10),
        }))
      : [];

  const passo = (n: number, titulo: string, icone: React.ReactNode, activo: boolean, conteudo: React.ReactNode) => (
    <div className={cn("rounded-lg border p-4", activo ? "border-primary/30 bg-primary/5" : "border-border bg-card")}>
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">{n}</span>
        <span className="flex items-center gap-1.5 text-sm font-semibold">{icone} {titulo}</span>
      </div>
      <div className="mt-3">{conteudo}</div>
    </div>
  );

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-semibold"><Wallet className="h-4 w-4 text-primary" /> {cobranca.titulo}</h2>
        <EstadoBadge estado={paga ? "Paga" : cobranca.estado === "Em validação" ? "Em análise" : "Pendente"} />
        <PortalBadge tom="cinza" className="ml-auto">Fase {cobranca.fase}</PortalBadge>
      </div>

      {/* Bloqueio sempre visível */}
      <p className="mt-3 flex items-start gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2.5 text-xs font-medium text-warning">
        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {cobranca.bloqueio}
      </p>

      <div className="mt-4 grid gap-3">
        {passo(1, "Notificação", <BellRing className="h-3.5 w-3.5 text-primary" />, !paga, (
          <p className="text-xs text-muted-foreground">
            {paga ? "Cobrança liquidada — notificação encerrada." : "Tem uma cobrança pendente. Notificação enviada no portal e também por e-mail e SMS (demonstração)."}
          </p>
        ))}

        {passo(2, "Nota de liquidação", <Receipt className="h-3.5 w-3.5 text-primary" />, !paga, (
          <div className="space-y-2">
            <ul className="divide-y divide-border rounded-lg border border-border">
              {cobranca.linhas.map((l, i) => (
                <li key={i} className="flex flex-wrap items-center gap-2 px-3 py-2.5 text-sm">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">{l.codigo}</span>
                  <span className="font-medium">{l.descricao}</span>
                  <span className="w-full text-xs text-muted-foreground sm:w-auto sm:flex-1">{l.detalhe}</span>
                  <span className={cn("ml-auto font-semibold tabular-nums", l.valor === null && "text-muted-foreground")}>
                    {l.valor === null ? "a confirmar" : kz(l.valor)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2 text-sm font-bold">
              <span>Total a pagar</span>
              <span className="tabular-nums">{temValor && total !== null ? kz(total) : "a confirmar"}</span>
            </div>
            {cobranca.baseLegal && <p className="text-[11px] text-muted-foreground">Base legal: {cobranca.baseLegal}</p>}
          </div>
        ))}

        {passo(3, "RUPE", <FileCheck2 className="h-3.5 w-3.5 text-primary" />, !cobranca.rupe, (
          cobranca.rupe ? (
            <div className="flex flex-wrap items-center gap-2">
              <code className="rounded-md border border-primary/25 bg-primary/5 px-3 py-1.5 text-sm font-bold tracking-wide text-primary">{cobranca.rupe}</code>
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(cobranca.rupe!); toast.success("Referência copiada."); }}>
                <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toast.success("RUPE descarregada (demonstração).")}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Descarregar
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={() => { emitirRupe(processoId, cobranca.codigo); toast.success("Referência única de pagamento gerada."); }}>
              Gerar RUPE
            </Button>
          )
        ))}

        {passo(4, "Pagamento", <Wallet className="h-3.5 w-3.5 text-primary" />, !!cobranca.rupe && cobranca.estado === "Pendente", (
          cobranca.comprovativo && cobranca.estado !== "Pendente" ? (
            <p className="text-xs text-muted-foreground">Comprovativo submetido: <span className="font-medium text-foreground">{cobranca.comprovativo}</span></p>
          ) : (
            <div className="space-y-3">
              <FileUpload label="Comprovativo de pagamento" obrigatorio ajuda="Não há reconciliação automática (RN-COB-05) — o comprovativo é validado pelo IDF." onChange={(f) => setFicheiro(f?.name ?? null)} />
              {temValor && (
                <label className="flex items-start gap-2.5 text-xs">
                  <Checkbox checked={prestacoes} onCheckedChange={(v) => setPrestacoes(v === true)} className="mt-0.5" />
                  Pagamento em prestações (admitido pelo DEC 243/22, Art. 5.º)
                </label>
              )}
              {prestacoes && temValor && (
                <div className="space-y-2 rounded-lg border border-border p-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-xs">N.º de parcelas</Label>
                    <Input type="number" min={2} max={12} value={nParcelas} onChange={(e) => setNParcelas(Math.max(2, Math.min(12, Number(e.target.value) || 2)))} className="h-8 w-20" />
                  </div>
                  <ul className="divide-y divide-border text-xs">
                    {parcelas.map((p) => (
                      <li key={p.n} className="flex items-center justify-between py-1.5">
                        <span>Parcela {p.n} · vence {fmtData(p.vencimento)}</span>
                        <span className="font-semibold tabular-nums">{kz(p.valor)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                size="sm"
                disabled={!cobranca.rupe || !ficheiro}
                onClick={() => { registarComprovativo(processoId, cobranca.codigo, ficheiro!, prestacoes ? parcelas : undefined); toast.success("Pagamento declarado — aguarda validação."); }}
              >
                Já paguei
              </Button>
            </div>
          )
        ))}

        {passo(5, "Reconciliação", <ShieldCheck className="h-3.5 w-3.5 text-primary" />, cobranca.estado === "Em validação", (
          <div className="flex flex-wrap items-center gap-3">
            <EstadoBadge estado={paga ? "Conforme" : cobranca.estado === "Em validação" ? "Em análise" : "Pendente"} />
            <span className="text-xs text-muted-foreground">{paga ? "Pagamento confirmado pelo IDF." : "Validação manual pelo IDF (sem reconciliação automática)."}</span>
            {cobranca.estado === "Em validação" && (
              <Button size="sm" variant="outline" onClick={() => { confirmarPagamento(processoId, cobranca.codigo); toast.success("Pagamento confirmado (botão de demonstração)."); }}>
                Confirmar pagamento (demonstração)
              </Button>
            )}
          </div>
        ))}

        {passo(6, "Desbloqueio", <BadgeCheck className="h-3.5 w-3.5 text-primary" />, paga, (
          paga ? (
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span>Fase desbloqueada.</span>
              {cobranca.recibo && (
                <Button size="sm" variant="outline" onClick={() => toast.success("Recibo descarregado (demonstração).")}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Recibo {cobranca.recibo}
                </Button>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Disponível após a confirmação do pagamento.</p>
          )
        ))}
      </div>

      {cobranca.contínua && (
        <div className="mt-4 rounded-lg border border-border p-4">
          <h3 className="text-sm font-semibold">Histórico de pagamentos</h3>
          <ul className="mt-2 divide-y divide-border text-xs">
            {(cobranca.historico ?? []).map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2">
                <span>{fmtData(h.data)} · {h.referencia}</span>
                <span className="font-semibold">{h.valor === null ? "a confirmar" : kz(h.valor)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
