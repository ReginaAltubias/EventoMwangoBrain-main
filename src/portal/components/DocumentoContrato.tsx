import { Download, FileSignature, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { fmtData } from "@/portal/data/mock";
import type { ProcessoConcessao } from "@/portal/data/concessaoFluxo";

// Documento de contrato gerado em mock — é a peça que o Concessionário assina em F7.
export function DocumentoContrato({ p }: { p: ProcessoConcessao }) {
  const hoje = new Date().toISOString().slice(0, 10);

  const clausulas: { titulo: string; texto: string }[] = [
    {
      titulo: "Cláusula 1.ª — Objecto",
      texto: `O presente contrato tem por objecto a concessão florestal da ${p.area}, com a superfície de ${p.areaHa.toLocaleString("pt-AO")} hectares, para exploração de madeira em toro, nos termos do Regulamento Florestal e do procedimento de contratação simplificada.`,
    },
    {
      titulo: "Cláusula 2.ª — Prazo",
      texto: "A concessão é atribuída pelo prazo fixado no despacho de deferimento, renovável mediante requerimento do Concessionário e parecer favorável da entidade concedente.",
    },
    {
      titulo: "Cláusula 3.ª — Obrigações do Concessionário",
      texto: "O Concessionário obriga-se a cumprir o plano de gestão e os demais instrumentos técnicos aprovados (D07), a liquidar as taxas, rendas, cauções e bónus devidos e a recrutar pessoal privativo de fiscalização, sujeito a juramentação pelo IDF.",
    },
    {
      titulo: "Cláusula 4.ª — Instalações",
      texto: "Novas instalações, ou a transformação das existentes, dependem de acordo prévio e expresso da entidade concedente.",
    },
    {
      titulo: "Cláusula 5.ª — Encargos e publicação",
      texto: "Os encargos de contrato, publicação e alvará (P3) são da responsabilidade do Concessionário. O contrato é publicado no Diário da República no prazo de 5 dias úteis.",
    },
    {
      titulo: "Cláusula 6.ª — Vigência",
      texto: `O contrato produz efeitos a partir da data da assinatura digital de ambas as partes, sendo emitido em 2 vias com igual valor. Documento elaborado a ${fmtData(hoje)}.`,
    },
  ];

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <FileSignature className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">D08 — Contrato de Concessão Florestal</span>
        <span className="text-[11px] text-muted-foreground">2 vias · minuta gerada pelo sistema</span>
        <div className="ml-auto flex gap-1.5">
          <Button size="sm" variant="ghost" onClick={() => toast.success("Pré-visualização enviada para impressão (demonstração).")}>
            <Printer className="mr-1.5 h-3.5 w-3.5" /> Imprimir
          </Button>
          <Button size="sm" variant="outline" onClick={() => toast.success("Minuta do contrato descarregada (demonstração).")}>
            <Download className="mr-1.5 h-3.5 w-3.5" /> Descarregar
          </Button>
        </div>
      </div>

      <div className="max-h-[420px] space-y-4 overflow-y-auto px-6 py-5 text-sm leading-relaxed">
        <div className="text-center">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">República de Angola · Instituto de Desenvolvimento Florestal</p>
          <h3 className="mt-1 text-base font-bold">Contrato de Concessão Florestal por Contratação Simplificada</h3>
          <p className="text-xs text-muted-foreground">Processo {p.codigo}</p>
        </div>

        <div className="rounded-lg bg-muted/40 px-4 py-3 text-xs">
          <p><span className="font-semibold">Primeiro outorgante:</span> Entidade concedente — Instituto de Desenvolvimento Florestal (IDF).</p>
          <p className="mt-1"><span className="font-semibold">Segundo outorgante:</span> Concessionário titular do processo {p.codigo}.</p>
          <p className="mt-1"><span className="font-semibold">Área concessionada:</span> {p.area} · {p.areaHa.toLocaleString("pt-AO")} ha.</p>
        </div>

        {clausulas.map((c) => (
          <div key={c.titulo}>
            <p className="font-semibold">{c.titulo}</p>
            <p className="text-muted-foreground">{c.texto}</p>
          </div>
        ))}

        <div className="grid gap-4 border-t border-dashed border-border pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold">Pela entidade concedente</p>
            <div className="mt-6 border-t border-border pt-1 text-[11px] text-muted-foreground">Assinatura e carimbo</div>
          </div>
          <div>
            <p className="text-xs font-semibold">Pelo Concessionário</p>
            {p.contrato ? (
              <div className="mt-2 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-[11px] font-medium text-success">
                Assinado digitalmente a {fmtData(p.contrato.assinadoEm)} · código {p.contrato.hash}
              </div>
            ) : (
              <div className="mt-6 border-t border-dashed border-border pt-1 text-[11px] text-muted-foreground">Por assinar digitalmente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
