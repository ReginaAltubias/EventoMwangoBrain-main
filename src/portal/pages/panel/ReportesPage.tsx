import { useState } from "react";
import { FileBarChart, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quotas } from "@/portal/data/mock";
import { toast } from "sonner";

// Volumes pré-preenchidos a partir dos dados mock de abate/licença do operador.
export default function ReportesPage() {
  const base = quotas.filter((q) => q.ano === "2026");
  const [linhas, setLinhas] = useState(base.map((q) => ({ id: q.id, especie: q.especie, executado: q.executado, justificacao: "" })));
  const [areaPlantada, setAreaPlantada] = useState("120");
  const [sobrevivencia, setSobrevivencia] = useState("87");
  const [adenda, setAdenda] = useState("Construção de 1 furo de água e apoio à escola comunitária de Buco-Zau.");

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-bold"><FileBarChart className="h-5 w-5 text-primary" /> Relatório de Execução — Campanha 2026</h1>

      <div className="flex items-start gap-2 rounded-lg border border-info/25 bg-info/5 px-4 py-3 text-sm text-muted-foreground">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-info" />
        Os volumes executados vêm pré-preenchidos a partir dos registos de abate e licença. Alterações exigem justificação.
      </div>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Volume executado por espécie (m³)</h2>
        <div className="mt-4 space-y-3">
          {linhas.map((l, i) => (
            <div key={l.id} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label>Espécie</Label>
                <Input value={l.especie} readOnly disabled />
              </div>
              <div className="space-y-1.5">
                <Label>Volume executado (m³)</Label>
                <Input
                  type="number"
                  value={l.executado}
                  onChange={(e) => setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, executado: Number(e.target.value) } : x)))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Justificação {l.executado !== base[i].executado && <span className="text-destructive">*</span>}</Label>
                <Input
                  placeholder={l.executado !== base[i].executado ? "Obrigatória — valor alterado" : "Não necessária"}
                  disabled={l.executado === base[i].executado}
                  value={l.justificacao}
                  onChange={(e) => setLinhas((ls) => ls.map((x, j) => (j === i ? { ...x, justificacao: e.target.value } : x)))}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Reflorestação e adenda social</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Área plantada (ha)</Label>
            <Input type="number" value={areaPlantada} onChange={(e) => setAreaPlantada(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Taxa de sobrevivência (%)</Label>
            <Input type="number" value={sobrevivencia} onChange={(e) => setSobrevivencia(e.target.value)} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Execução da adenda social</Label>
            <textarea
              className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={adenda}
              onChange={(e) => setAdenda(e.target.value)}
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={() => toast.success("Relatório de execução submetido (demonstração).")}>Submeter relatório</Button>
      </div>
    </div>
  );
}
