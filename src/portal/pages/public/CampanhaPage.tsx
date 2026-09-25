import { CalendarDays } from "lucide-react";
import { campanha, estadoCampanha, fmtData } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";

export default function CampanhaPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <CalendarDays className="h-6 w-6 text-primary" /> Calendário da Campanha Florestal 2026
      </h1>
      <p className="mt-2 text-muted-foreground">Períodos de submissão por tipo de licença e concessão.</p>
      <div className="mt-8 overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Abertura de submissões</th>
              <th className="px-4 py-3">Encerramento</th>
              <th className="px-4 py-3">Estado</th>
            </tr>
          </thead>
          <tbody>
            {campanha.map((r) => (
              <tr key={r.tipo} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">{r.tipo}</td>
                <td className="px-4 py-3">{fmtData(r.abertura)}</td>
                <td className="px-4 py-3">{fmtData(r.encerramento)}</td>
                <td className="px-4 py-3"><EstadoBadge estado={estadoCampanha(r)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
