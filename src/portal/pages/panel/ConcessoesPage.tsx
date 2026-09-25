import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Boxes,
  CheckCircle2,
  Download,
  Eye,
  FileSignature,
  FileText,
  Gavel,
  Handshake,
  Landmark,
  MessageSquareWarning,
  Newspaper,
  PenLine,
  Send,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EstadoBadge, PortalBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { NotaSistema } from "@/portal/components/NotaSistema";
import { PagamentoRUPE } from "@/portal/components/PagamentoRUPE";
import { DocumentoContrato } from "@/portal/components/DocumentoContrato";
import { BlocosConcessao, OrigemConcursoCard } from "@/portal/components/BlocosConcessao";
import { ConcessaoMapa } from "@/portal/components/ConcessaoMapa";
import { useConcessoes } from "@/portal/state/ConcessoesStore";
import { ANEXOS_F0, FASES, QUALIDADES_MADEIRA, indiceFase, type FaseId, type ProcessoConcessao } from "@/portal/data/concessaoFluxo";
import { fmtData } from "@/portal/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ───────────────────────── Lista ─────────────────────────

function KpiResumo({ icon: Icone, label, value, hint, index }: { icon: typeof Landmark; label: string; value: number; hint: string; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      whileHover={{ y: -2 }}
      className="min-h-36 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-muted-foreground">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold text-foreground">{value.toLocaleString("pt-AO")}</p>
          <p className="mt-3 text-[11px] font-medium text-success">{hint}</p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icone className="h-4 w-4" />
        </span>
      </div>
    </motion.div>
  );
}

function ProgressoFases({ fase }: { fase: FaseId }) {
  const actual = indiceFase(fase);
  return (
    <div className="flex items-center gap-0.5" title={`Fase ${fase} de F8`}>
      {FASES.map((f, i) => (
        <span
          key={f.id}
          className={cn(
            "h-1.5 w-3 rounded-full",
            i < actual ? "bg-success" : i === actual ? "bg-primary" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

export function ConcessoesPage() {
  const { processos } = useConcessoes();
  const totalBlocos = processos.reduce((total, processo) => total + (processo.blocos?.length ?? 0), 0);
  const adjudicadas = processos.filter((processo) => processo.origemConcurso).length;
  const kpis = [
    { icon: Landmark, label: "Concessões atribuídas", value: processos.length, hint: "Sob gestão do operador" },
    { icon: Gavel, label: "Ganhas em concurso", value: adjudicadas, hint: "Adjudicadas por concurso público" },
    { icon: Boxes, label: "Blocos sob gestão", value: totalBlocos, hint: "Blocos delimitados nas áreas" },
  ];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-bold"><Landmark className="h-5 w-5 text-primary" /> As Minhas Concessões</h1>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((k, i) => <KpiResumo key={k.label} {...k} index={i} />)}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Concessão e área</th>
              <th className="px-4 py-3">Origem</th>
              <th className="px-4 py-3">Tramitação</th>
              <th className="px-4 py-3 text-right">Consulta</th>
            </tr>
          </thead>
          <tbody>
        {processos.map((p, i) => {
          const idx = indiceFase(p.fase);
          return (
            <tr key={p.id} className={`border-b border-border/60 align-middle transition-colors last:border-0 hover:bg-muted/30 animate-slide-up stagger-${i + 1}`}>
              <td className="px-4 py-4">
                <p className="font-bold text-primary">{p.codigo}</p>
                <p className="mt-1 font-semibold">{p.area}</p>
                <p className="text-xs text-muted-foreground">{p.areaHa.toLocaleString("pt-AO")} ha · {p.blocos?.length ?? 0} blocos</p>
              </td>
              <td className="px-4 py-4">
                {p.origemConcurso ? (
                  <div className="space-y-1">
                    <PortalBadge tom="verde">Concurso {p.origemConcurso.codigo}</PortalBadge>
                    <p className="text-xs font-medium">{p.origemConcurso.lote}</p>
                    <p className="text-xs text-muted-foreground">Adjudicada em {fmtData(p.origemConcurso.adjudicadoEm)}</p>
                  </div>
                ) : <span className="text-xs text-muted-foreground">Processo administrativo</span>}
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2">
                    <PortalBadge tom={p.fase === "F8" ? "verde" : "azul"}>{p.fase} — {FASES[idx].nome}</PortalBadge>
                    <EstadoBadge estado={p.estado} />
                  </div>
                  <ProgressoFases fase={p.fase} />
                  <span className="text-xs text-muted-foreground">{FASES[idx].prazoTexto}</span>
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <Button size="sm" variant="outline" asChild>
                  <Link to={`/painel/concessoes/${p.id}`}><Eye className="mr-1.5 h-3.5 w-3.5" /> Ver tudo</Link>
                </Button>
              </td>
            </tr>
          );
        })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ───────────────────────── Timeline ─────────────────────────

function BarraPrazo({ dias, decorridos }: { dias: number | null; decorridos: number }) {
  if (dias === null) {
    return <p className="text-xs font-medium text-muted-foreground">Sem prazo fixado — acompanhamento contínuo</p>;
  }
  const pct = Math.min(100, Math.round((decorridos / dias) * 100));
  const cor = pct >= 80 ? "bg-destructive" : pct >= 60 ? "bg-warning" : "bg-success";
  return (
    <div>
      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Prazo em curso</span>
        <span>{decorridos} de {dias} dias ({pct}%)</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", cor)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Timeline({ p, seleccionada, onSelect }: { p: ProcessoConcessao; seleccionada: number; onSelect: (i: number) => void }) {
  const actual = indiceFase(p.fase);
  return (
    <div className="card-elevated rounded-xl p-5">
      <h2 className="font-semibold">Tramitação — 9 fases (F0 a F8)</h2>
      <ol className="mt-5 flex w-full items-start">
        {FASES.map((f, i) => {
          const concluida = i < actual;
          const corrente = i === actual;
          return (
            <li key={f.id} className={cn("flex items-start", i < FASES.length - 1 && "flex-1")}>
              <button type="button" onClick={() => onSelect(i)} className="group flex flex-col items-center gap-1.5">
                <span
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-all",
                    concluida && "border-success bg-success text-success-foreground",
                    corrente && "border-primary bg-primary text-primary-foreground shadow-md",
                    !concluida && !corrente && "border-border bg-card text-muted-foreground",
                    i === seleccionada && "ring-2 ring-primary/40 ring-offset-2",
                  )}
                >
                  {concluida ? <CheckCircle2 className="h-4 w-4" /> : f.id}
                </span>
                <span className={cn("max-w-24 text-center text-[10px] font-medium leading-tight", corrente ? "text-primary" : concluida ? "text-success" : "text-muted-foreground")}>
                  {f.nome}
                </span>
              </button>
              {i < FASES.length - 1 && <div className={cn("mx-1 mt-4 h-0.5 flex-1 rounded", i < actual ? "bg-success" : "bg-border")} />}
            </li>
          );
        })}
      </ol>

      <div className="mt-6 rounded-lg border border-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <PortalBadge tom={seleccionada < actual ? "verde" : seleccionada === actual ? "azul" : "cinza"}>
            {FASES[seleccionada].id} · {FASES[seleccionada].nome}
          </PortalBadge>
          {seleccionada === actual && <EstadoBadge estado={p.estado} />}
          {FASES[seleccionada].notaSistema && <NotaSistema texto={FASES[seleccionada].notaSistema!} />}
          <span className="ml-auto text-xs text-muted-foreground">{FASES[seleccionada].prazoTexto}</span>
        </div>
        <div className="mt-3">
          <BarraPrazo dias={seleccionada === actual ? FASES[seleccionada].prazoDias : null} decorridos={seleccionada === actual ? p.diasDecorridos : 0} />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Estados desta fase: {FASES[seleccionada].estados.join(" → ")}
        </p>
      </div>
    </div>
  );
}

// ───────────────────────── Painéis por fase ─────────────────────────

function SoConsultar({ texto }: { texto: string }) {
  const _ = null;
  return (
    <div className="card-elevated rounded-xl p-5">
      <h2 className="flex items-center gap-2 font-semibold"><Eye className="h-4 w-4 text-primary" /> Consulta</h2>
      <p className="mt-2 text-sm text-muted-foreground">{texto}</p>
      <p className="mt-3 text-xs text-muted-foreground">Nesta fase não existe nenhuma acção a cargo do requerente.</p>
    </div>
  );
}

function Documentos({ p }: { p: ProcessoConcessao }) {
  return (
    <div className="card-elevated rounded-xl p-5">
      <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" /> Documentos do processo</h2>
      <ul className="mt-3 divide-y divide-border text-sm">
        {p.documentos.map((d) => (
          <li key={d.codigo} className="flex flex-wrap items-center gap-3 py-2.5">
            <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-bold text-muted-foreground">{d.codigo}</span>
            <span className="font-medium">{d.nome}</span>
            {d.detalhe && <span className="w-full text-xs text-muted-foreground sm:w-auto">{d.detalhe}</span>}
            <span className="ml-auto text-xs text-muted-foreground">{d.emitidoEm && fmtData(d.emitidoEm)}</span>
            <Button size="sm" variant="ghost" onClick={() => toast.success("Documento descarregado (demonstração).")}>
              <Download className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PainelF0({ p }: { p: ProcessoConcessao }) {
  return (
    <div className="card-elevated rounded-xl p-5">
      <h2 className="font-semibold">Requerimento e anexos submetidos</h2>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {ANEXOS_F0.map((a) => (
          <li key={a} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" /> {a}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        Gerados no protocolo: D01 "Dossiê inicial" e D02 "Comprovativo de protocolo" — ambos disponíveis na lista de documentos.
      </p>
    </div>
  );
}

function PainelF5({ p }: { p: ProcessoConcessao }) {
  const indeferido = p.estado === "Indeferido" || p.estado === "Em reclamação";
  if (!indeferido) return <SoConsultar texto="A decisão do processo é comunicada aqui. Enquanto não for proferida, não há nenhuma acção a realizar." />;
  return (
    <div className="card-elevated rounded-xl p-5">
      <h2 className="flex items-center gap-2 font-semibold"><MessageSquareWarning className="h-4 w-4 text-primary" /> Reclamação da decisão</h2>
      <div className="mt-3 space-y-3">
        <Textarea placeholder="Fundamentação da reclamação" rows={4} />
        <FileUpload label="Documentos de suporte" />
        <Button onClick={() => toast.success("Reclamação submetida (demonstração).")}><Send className="mr-1.5 h-4 w-4" /> Submeter reclamação</Button>
      </div>
    </div>
  );
}

function PainelF6({ p }: { p: ProcessoConcessao }) {
  const { enviarMensagem, enviarInstrumento } = useConcessoes();
  const [msg, setMsg] = useState("");
  const [qualidade, setQualidade] = useState("A");
  const completos = p.instrumentos.filter((i) => i.enviado).length;
  const p2 = p.cobrancas.find((c) => c.codigo === "P2");

  return (
    <div className="space-y-5">
      {/* Negociação */}
      <div className="card-elevated rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="flex items-center gap-2 font-semibold"><Handshake className="h-4 w-4 text-primary" /> Negociação do contrato</h2>
          <PortalBadge tom={p.negociacao.estado === "Concluída" ? "verde" : "ambar"}>{p.negociacao.estado}</PortalBadge>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">A negociação segue os termos do Art. 59.º do Regulamento Florestal.</p>
        <ul className="mt-4 space-y-3">
          {p.negociacao.mensagens.map((m) => (
            <li key={m.id} className={cn("rounded-lg border p-3 text-sm", m.autor === "Requerente" ? "border-primary/25 bg-primary/5" : "border-border bg-muted/40")}>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-semibold text-foreground">{m.autor}</span>
                <span>{fmtData(m.data)}</span>
              </div>
              <p className="mt-1.5">{m.texto}</p>
            </li>
          ))}
        </ul>
        {p.negociacao.estado === "Em curso" && (
          <div className="mt-4 space-y-2">
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={3} placeholder="Escrever resposta aos órgãos centrais do Ministério…" />
            <Button size="sm" disabled={!msg.trim()} onClick={() => { enviarMensagem(p.id, msg.trim()); setMsg(""); toast.success("Mensagem enviada (demonstração)."); }}>
              <Send className="mr-1.5 h-4 w-4" /> Enviar
            </Button>
          </div>
        )}
      </div>

      {/* D07 */}
      <div className="card-elevated rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold">Dossiê pós-deferimento (8 instrumentos)</h2>
          <PortalBadge tom={completos === 8 ? "verde" : "ambar"}>D07: {completos} de 8 instrumentos completos</PortalBadge>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {p.instrumentos.map((it) => (
            <div key={it.id} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium">{it.nome}</p>
                <EstadoBadge estado={it.enviado ? "Conforme" : "Pendente"} />
              </div>
              {!it.enviado && <FileUpload label="Ficheiro" onChange={(f) => { if (f) { enviarInstrumento(p.id, it.id); toast.success("Instrumento enviado (demonstração)."); } }} />}
            </div>
          ))}
        </div>
      </div>

      {/* Checklist de bloqueio */}
      <div className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Requisitos para a celebração do contrato (RN-COB-04)</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <CheckCircle2 className={cn("h-4 w-4", completos === 8 ? "text-success" : "text-muted-foreground")} />
            Dossiê D07 completo <EstadoBadge className="ml-auto" estado={completos === 8 ? "Conforme" : "Pendente"} />
          </li>
          <li className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
            <CheckCircle2 className={cn("h-4 w-4", p2?.estado === "Paga" ? "text-success" : "text-muted-foreground")} />
            Pagamento P2 confirmado <EstadoBadge className="ml-auto" estado={p2?.estado === "Paga" ? "Paga" : "Pendente"} />
          </li>
        </ul>
      </div>

      {/* Cobrança P2 */}
      {p2 && (
        <div className="space-y-3">
          <div className="card-elevated rounded-xl p-4">
            <Label className="text-xs">Qualidade da madeira em toro sem casca (taxa de exploração)</Label>
            <select
              value={qualidade}
              onChange={(e) => setQualidade(e.target.value)}
              className="mt-1.5 h-9 w-full rounded-md border border-input bg-background px-3 text-sm sm:w-72"
            >
              {QUALIDADES_MADEIRA.map((q) => (
                <option key={q.classe} value={q.classe}>Qualidade {q.classe} — {q.valor.toLocaleString("pt-AO")} Kz/m³</option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] text-muted-foreground">Volume contratado por confirmar — o valor total de P2 mantém-se "a confirmar".</p>
          </div>
          <PagamentoRUPE processoId={p.id} cobranca={p2} />
        </div>
      )}
    </div>
  );
}

// F3 / F4 — fases de parecer: o requerente pode juntar requerimentos e documentos de apoio ao parecer.
function PainelParecer({ p, fase }: { p: ProcessoConcessao; fase: "F3" | "F4" }) {
  const provincial = fase === "F3";
  const [assunto, setAssunto] = useState("");
  const [nota, setNota] = useState("");
  const [ficheiro, setFicheiro] = useState<string | null>(null);
  const [enviados, setEnviados] = useState<{ id: string; assunto: string; ficheiro: string; data: string }[]>([]);

  return (
    <div className="space-y-5">
      <SoConsultar
        texto={
          provincial
            ? "Aguarda a emissão do parecer provincial. Sem prazo fixado na fonte."
            : "Análise central em curso: parecer técnico central e, em seguida, decisão."
        }
      />

      <div className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <FileText className="h-4 w-4 text-primary" /> Requerimentos para o {provincial ? "parecer provincial" : "parecer técnico central"}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Carregue aqui requerimentos e documentos complementares solicitados durante a instrução do parecer ({p.codigo}).
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Assunto do requerimento</Label>
            <Input value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex.: Esclarecimento sobre limites da área" />
          </div>
          <FileUpload
            key={enviados.length}
            label="Ficheiro do requerimento"
            obrigatorio
            ajuda="PDF ou imagem — o documento é anexado ao processo."
            onChange={(f) => setFicheiro(f?.name ?? null)}
          />
        </div>
        <div className="mt-3 space-y-1.5">
          <Label>Observações</Label>
          <Textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota dirigida aos serviços que emitem o parecer" />
        </div>
        <Button
          className="mt-3"
          disabled={!assunto.trim() || !ficheiro}
          onClick={() => {
            setEnviados((l) => [
              ...l,
              { id: `r${Date.now()}`, assunto: assunto.trim(), ficheiro: ficheiro!, data: new Date().toISOString().slice(0, 10) },
            ]);
            setAssunto("");
            setNota("");
            setFicheiro(null);
            toast.success("Requerimento carregado (demonstração).");
          }}
        >
          <Send className="mr-1.5 h-4 w-4" /> Submeter requerimento
        </Button>

        {enviados.length > 0 && (
          <ul className="mt-4 divide-y divide-border text-sm">
            {enviados.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="font-medium">{r.assunto}</span>
                <span className="text-xs text-muted-foreground">{r.ficheiro}</span>
                <span className="ml-auto text-xs text-muted-foreground">{fmtData(r.data)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function PainelF7({ p }: { p: ProcessoConcessao }) {
  const { assinarContrato } = useConcessoes();
  const [aberto, setAberto] = useState(false);
  const [identidade, setIdentidade] = useState(false);
  const p3 = p.cobrancas.find((c) => c.codigo === "P3");

  return (
    <div className="space-y-5">
      <div className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold"><FileSignature className="h-4 w-4 text-primary" /> Celebração do contrato</h2>
        <div className="mt-3">
          <DocumentoContrato p={p} />
        </div>
        {p.contrato ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <EstadoBadge estado="Conforme" />
            <span className="text-sm font-medium">Contrato celebrado em {fmtData(p.contrato.assinadoEm)}</span>
            <code className="rounded bg-muted px-2 py-1 text-xs">Assinatura {p.contrato.hash}</code>
            <Button size="sm" variant="outline" onClick={() => toast.success("D08 descarregado (2 vias, demonstração).")}><Download className="mr-1.5 h-3.5 w-3.5" /> D08 Contrato</Button>
          </div>
        ) : (
          <Button className="mt-4" onClick={() => setAberto(true)}><PenLine className="mr-1.5 h-4 w-4" /> Assinar digitalmente</Button>
        )}
      </div>

      <div className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold"><Newspaper className="h-4 w-4 text-primary" /> Publicação</h2>
        {p.publicacao ? (
          <p className="mt-2 text-sm">D09 publicado no Diário da República a <span className="font-semibold">{fmtData(p.publicacao.data)}</span>.</p>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Aguarda publicação — prazo de 5 dias úteis a contar da celebração do contrato.</p>
        )}
      </div>

      {p3 && <PagamentoRUPE processoId={p.id} cobranca={p3} />}

      {p.alvara && (
        <div className="card-elevated rounded-xl p-5">
          <h2 className="font-semibold">Alvará</h2>
          <div className="mt-3 flex items-center gap-3">
            <EstadoBadge estado="Válido" />
            <Button size="sm" variant="outline" onClick={() => toast.success("D10 descarregado (demonstração).")}><Download className="mr-1.5 h-3.5 w-3.5" /> D10 Alvará e planta</Button>
          </div>
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assinatura digital do contrato</DialogTitle></DialogHeader>
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Confirme a identidade do representante legal do Concessionário para assinar o contrato.</p>
            <div className="space-y-1.5"><Label>Código de confirmação (demonstração)</Label><Input placeholder="123456" onChange={(e) => setIdentidade(e.target.value.length >= 4)} /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button disabled={!identidade} onClick={() => { assinarContrato(p.id); setAberto(false); toast.success("Contrato assinado digitalmente (demonstração)."); }}>Assinar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PainelF8({ p }: { p: ProcessoConcessao }) {
  const p4 = p.cobrancas.find((c) => c.codigo === "P4");

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-medium text-warning">
        <ShieldAlert className="mr-1.5 inline h-4 w-4" />
        Novas instalações ou transformação das existentes exigem acordo prévio da entidade concedente.
      </div>

      <div className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold"><UserCheck className="h-4 w-4 text-primary" /> Recrutamento de pessoal privativo de fiscalização</h2>
        <p className="mt-1 text-xs text-muted-foreground">Consulta dos fiscais associados à concessão. A juramentação é feita pelo IDF.</p>
        <ul className="mt-4 divide-y divide-border text-sm">
          {p.fiscais.map((f) => (
            <li key={f.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <span className="font-medium">{f.nome}</span>
              <span className="text-xs text-muted-foreground">{f.documento}</span>
              <EstadoBadge className="ml-auto" estado={f.estado === "Juramentado" ? "Conforme" : "Pendente"} />
              <span className="text-[11px] text-muted-foreground">{f.estado}</span>
            </li>
          ))}
          {p.fiscais.length === 0 && <li className="py-3 text-sm text-muted-foreground">Nenhum fiscal registado.</li>}
        </ul>
        {p.fiscaisRecrutados && <p className="mt-3 text-xs font-medium text-success">Recrutamento declarado como concluído pelo Concessionário.</p>}
      </div>

      {p4 && <PagamentoRUPE processoId={p.id} cobranca={p4} />}
    </div>
  );
}

// ───────────────────────── Detalhe ─────────────────────────

export function ConcessaoDetalhePage() {
  const { id } = useParams();
  const { obter } = useConcessoes();
  const p = obter(id);
  const [params] = useSearchParams();
  const tramitacaoRef = useRef<HTMLDivElement>(null);
  const actual = p ? indiceFase(p.fase) : 0;
  const [sel, setSel] = useState(actual);

  useEffect(() => { setSel(actual); }, [actual]);

  useEffect(() => {
    const cob = params.get("cobranca");
    if (!cob || !p) return;
    const alvo = p.cobrancas.find((c) => c.codigo === cob);
    if (alvo) setSel(indiceFase(alvo.fase as FaseId));
    const t = window.setTimeout(() => {
      tramitacaoRef.current?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 650);
    return () => window.clearTimeout(t);
  }, [params, p]);

  const painel = useMemo(() => {
    if (!p) return null;
    const fase = FASES[sel].id;
    const p1 = p.cobrancas.find((c) => c.codigo === "P1");
    switch (fase) {
      case "F0": return <PainelF0 p={p} />;
      case "F1": return <SoConsultar texto="O processo está em apreciação preliminar pelos serviços do IDF. Será notificado caso seja necessária correcção." />;
      case "F2": return p1 ? <PagamentoRUPE processoId={p.id} cobranca={p1} /> : <SoConsultar texto="Cobrança P1 ainda não emitida para este processo." />;
      case "F3": return <PainelParecer p={p} fase="F3" />;
      case "F4": return <PainelParecer p={p} fase="F4" />;
      case "F5": return <PainelF5 p={p} />;
      case "F6": return <PainelF6 p={p} />;
      case "F7": return <PainelF7 p={p} />;
      case "F8": return <PainelF8 p={p} />;
      default: return null;
    }
  }, [p, sel]);

  if (!p) return <p className="text-muted-foreground">Concessão não encontrada.</p>;
  const tratamento = indiceFase(p.fase) >= indiceFase("F7") ? "Concessionário" : "Requerente";
  const totalContratado = (p.blocos ?? []).reduce((s, b) => s + b.volumeContratadoM3, 0);
  const totalConsumido = (p.blocos ?? []).reduce((s, b) => s + b.volumeConsumidoM3, 0);
  const pctConsumo = totalContratado > 0 ? Math.round((totalConsumido / totalContratado) * 100) : 0;

  const seccoes = [
    <OrigemConcursoCard key="origem" p={p} />,
    p.blocos?.length ? <ConcessaoMapa key="mapa" p={p} /> : null,
    <BlocosConcessao key="blocos" p={p} />,
    <div key="tramitacao" ref={tramitacaoRef} className="scroll-mt-24 space-y-5">
      <Timeline p={p} seleccionada={sel} onSelect={setSel} />
      {painel}
    </div>,
    <Documentos key="docs" p={p} />,
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild><Link to="/painel/concessoes"><ArrowLeft className="mr-1.5 h-4 w-4" /> As Minhas Concessões</Link></Button>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="card-elevated rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-primary">{p.codigo}</span>
          <PortalBadge tom={p.fase === "F8" ? "verde" : "azul"}>{p.fase} — {FASES[indiceFase(p.fase)].nome}</PortalBadge>
          <EstadoBadge estado={p.estado} />
          <span className="ml-auto text-xs font-medium text-muted-foreground">Tratamento: {tratamento}</span>
        </div>
        <h1 className="mt-1.5 text-xl font-bold">{p.area}</h1>
        <p className="text-sm text-muted-foreground">{p.areaHa.toLocaleString("pt-AO")} ha · produto principal: madeira</p>

        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          <ResumoConcessao label="Fase actual" valor={`${p.fase} de F8`} />
          <ResumoConcessao label="Blocos" valor={String(p.blocos?.length ?? 0)} />
          <ResumoConcessao label="Volume contratado" valor={totalContratado > 0 ? `${totalContratado.toLocaleString("pt-AO")} m³` : "—"} />
          <div>
            <p className="text-[11px] uppercase text-muted-foreground">Consumo global</p>
            <p className="font-semibold">{totalContratado > 0 ? `${pctConsumo}% consumido` : "—"}</p>
            {totalContratado > 0 && (
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctConsumo}%` }} />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {seccoes.map((seccao, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 + i * 0.05, duration: 0.25 }}
        >
          {seccao}
        </motion.div>
      ))}
    </div>
  );
}

function ResumoConcessao({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase text-muted-foreground">{label}</p>
      <p className="font-semibold">{valor}</p>
    </div>
  );
}
