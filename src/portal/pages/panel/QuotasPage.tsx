import { useState } from "react";
import { Percent } from "lucide-react";
import { quotas } from "@/portal/data/mock";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const anos = [...new Set(quotas.map((q) => q.ano))];

export default function QuotasPage() {
  const [ano, setAno] = useState(anos[0]);
  const linhas = quotas.filter((q) => q.ano === ano);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-bold"><Percent className="h-5 w-5 text-primary" /> Consumo de Quota</h1>
        <div className="flex gap-1.5">
          {anos.map((a) => (
            <button
              key={a}
              onClick={() => setAno(a)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
                ano === a ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-primary",
              )}
            >
              Campanha {a}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Área / Concessão / Licença</th>
              <th className="px-4 py-3">Espécie</th>
              <th className="px-4 py-3 text-right">Autorizado (m³)</th>
              <th className="px-4 py-3 text-right">Executado (m³)</th>
              <th className="px-4 py-3 text-right">Saldo (m³)</th>
              <th className="px-4 py-3 w-56">Consumo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((q) => {
              const pct = Math.round((q.executado / q.autorizado) * 100);
              const alerta = pct >= 100 ? "vermelho" : pct >= 80 ? "ambar" : "ok";
              return (
                <tr key={q.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium">{q.contexto}</td>
                  <td className="px-4 py-3">{q.especie}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{q.autorizado.toLocaleString("pt-AO")}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{q.executado.toLocaleString("pt-AO")}</td>
                  <td className={cn("px-4 py-3 text-right font-bold tabular-nums", alerta === "vermelho" ? "text-destructive" : alerta === "ambar" ? "text-warning" : "text-success")}>
                    {(q.autorizado - q.executado).toLocaleString("pt-AO")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Progress
                        value={Math.min(100, pct)}
                        className={cn("h-2 flex-1", alerta === "vermelho" && "[&>div]:bg-destructive", alerta === "ambar" && "[&>div]:bg-warning")}
                      />
                      <span className={cn("w-10 text-right text-xs font-bold", alerta === "vermelho" ? "text-destructive" : alerta === "ambar" ? "text-warning" : "text-muted-foreground")}>
                        {pct}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Linhas a âmbar/vermelho indicam consumo igual ou superior a 80% do volume autorizado.</p>
    </div>
  );
}
