import { motion, useReducedMotion } from "framer-motion";
import { Layers, Trophy } from "lucide-react";
import { EstadoBadge, PortalBadge } from "@/portal/components/Badges";
import { fmtData } from "@/portal/data/mock";
import type { ProcessoConcessao } from "@/portal/data/concessaoFluxo";
import { cn } from "@/lib/utils";

const m3 = (v: number) => `${v.toLocaleString("pt-AO")} m³`;

export function OrigemConcursoCard({ p }: { p: ProcessoConcessao }) {
  if (!p.origemConcurso) return null;
  const o = p.origemConcurso;
  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Trophy className="h-4 w-4 text-primary" /> Adjudicada em concurso público
        </h2>
        <PortalBadge tom="verde">{o.codigo}</PortalBadge>
      </div>
      <p className="mt-2 text-sm font-medium">{o.titulo}</p>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Lote adjudicado</dt>
          <dd className="font-medium">{o.lote}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Data de adjudicação</dt>
          <dd className="font-medium">{fmtData(o.adjudicadoEm)}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase text-muted-foreground">Concorrentes</dt>
          <dd className="font-medium">{o.concorrentes}</dd>
        </div>
      </dl>
    </div>
  );
}

export function BlocosConcessao({ p }: { p: ProcessoConcessao }) {
  const reduce = useReducedMotion();
  const blocos = p.blocos ?? [];
  if (blocos.length === 0) return null;

  const contratado = blocos.reduce((s, b) => s + b.volumeContratadoM3, 0);
  const consumido = blocos.reduce((s, b) => s + b.volumeConsumidoM3, 0);
  const disponivel = contratado - consumido;
  const areaBlocos = blocos.reduce((s, b) => s + b.areaHa, 0);

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Layers className="h-4 w-4 text-primary" /> Blocos da concessão
        </h2>
        <PortalBadge tom="azul">{blocos.length} blocos · {areaBlocos.toLocaleString("pt-AO")} ha</PortalBadge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Volume contratado", valor: m3(contratado), cor: "text-foreground" },
          { label: "Já consumido", valor: m3(consumido), cor: "text-warning" },
          { label: "Disponível", valor: m3(disponivel), cor: "text-success" },
        ].map((k) => (
          <div key={k.label} className="rounded-lg border border-border px-3 py-2.5">
            <p className="text-[11px] uppercase text-muted-foreground">{k.label}</p>
            <p className={cn("text-base font-bold", k.cor)}>{k.valor}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-[11px] uppercase text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Bloco</th>
              <th className="py-2 pr-3 font-medium">Área</th>
              <th className="py-2 pr-3 font-medium">Espécies</th>
              <th className="py-2 pr-3 font-medium">Contratado</th>
              <th className="py-2 pr-3 font-medium">Consumido</th>
              <th className="py-2 pr-3 font-medium">Disponível</th>
              <th className="py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {blocos.map((b, i) => {
              const pct = b.volumeContratadoM3 > 0 ? Math.round((b.volumeConsumidoM3 / b.volumeContratadoM3) * 100) : 0;
              return (
                <motion.tr
                  key={b.id}
                  initial={reduce ? false : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reduce ? 0 : i * 0.05, duration: 0.25 }}
                  className="border-b border-border/60 last:border-0"
                >
                  <td className="py-2.5 pr-3 font-semibold">{b.nome}</td>
                  <td className="py-2.5 pr-3">{b.areaHa.toLocaleString("pt-AO")} ha</td>
                  <td className="py-2.5 pr-3 text-muted-foreground">{b.especies}</td>
                  <td className="py-2.5 pr-3">{m3(b.volumeContratadoM3)}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", pct >= 100 ? "bg-destructive" : pct >= 70 ? "bg-warning" : "bg-success")}
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span className="text-xs">{m3(b.volumeConsumidoM3)} ({pct}%)</span>
                    </div>
                  </td>
                  <td className="py-2.5 pr-3 font-medium">{m3(b.volumeContratadoM3 - b.volumeConsumidoM3)}</td>
                  <td className="py-2.5">
                    <EstadoBadge estado={b.estado === "Encerrado" ? "Encerrado" : b.estado === "Em exploração" ? "Activo" : "Pendente"} />
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
