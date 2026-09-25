import { useState } from "react";
import { Gavel } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstadoBadge } from "@/portal/components/Badges";
import { Countdown } from "@/portal/components/Countdown";
import { concursos, estadoConcurso, fmtData, minhasCandidaturas } from "@/portal/data/mock";
import { cn } from "@/lib/utils";

export default function ConcursosPanelPage() {
  const [aba, setAba] = useState("disponiveis");
  const abertos = concursos.filter((c) => estadoConcurso(c) !== "Encerrado");

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-bold"><Gavel className="h-5 w-5 text-primary" /> Concursos Públicos</h1>
      <Tabs value={aba} onValueChange={setAba}>
        <TabsList>
          <TabsTrigger value="disponiveis">Disponíveis ({abertos.length})</TabsTrigger>
          <TabsTrigger value="minhas">As Minhas Candidaturas ({minhasCandidaturas.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="disponiveis" className="mt-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {abertos.map((c, i) => (
              <div key={c.id} className={cn("card-elevated flex flex-col gap-3 rounded-xl p-5", `animate-slide-up stagger-${i + 1}`)}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{c.codigo}</span>
                  <EstadoBadge estado={estadoConcurso(c)} />
                </div>
                <p className="font-semibold leading-snug">{c.titulo}</p>
                <p className="text-sm text-muted-foreground">{c.provincia} · {c.areaHa.toLocaleString("pt-AO")} ha</p>
                <Countdown prazo={c.prazo} compacto />
                <p className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">Disponível apenas para consulta.</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="minhas" className="mt-5">
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Concurso</th>
                  <th className="px-4 py-3">Título</th>
                  <th className="px-4 py-3">Submetida em</th>
                  <th className="px-4 py-3">Estado</th>
                </tr>
              </thead>
              <tbody>
                {minhasCandidaturas.map((m) => (
                  <tr key={m.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 font-bold text-primary">{m.concurso}</td>
                    <td className="px-4 py-3">{m.titulo}</td>
                    <td className="px-4 py-3">{fmtData(m.submetida)}</td>
                    <td className="px-4 py-3"><EstadoBadge estado={m.estado} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
