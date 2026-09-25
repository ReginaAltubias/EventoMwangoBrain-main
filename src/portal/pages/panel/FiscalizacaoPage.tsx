import { useState } from "react";
import { AlertOctagon, Download, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { gerarDocumentoPdf } from "@/portal/lib/pdfDocumento";
import { fmtData, processosFiscalizacao } from "@/portal/data/mock";
import { toast } from "sonner";

function baixarAutoPdf(p: (typeof processosFiscalizacao)[number]) {
  gerarDocumentoPdf({
    titulo: "Auto de notícia",
    subtitulo: "Notificação de infracção — conteúdo para conhecimento e defesa do operador",
    codigo: p.auto,
    campos: [
      { rotulo: "Auto de notícia", valor: p.auto },
      { rotulo: "Estado do processo", valor: p.estado },
      { rotulo: "Factos imputados", valor: p.motivo },
      { rotulo: "Prazo para apresentar defesa", valor: fmtData(p.prazoDefesa) },
    ],
    notas: [
      "Este documento reproduz o auto de notícia levantado pela fiscalização, para que o operador tome conhecimento integral dos factos.",
      "O operador pode apresentar defesa escrita, com documentos de suporte, até ao prazo indicado.",
      "Enquanto a infracção não for sanada, ficam bloqueadas renovações de licenças e novas candidaturas a concursos.",
      "Base legal: Regulamento Florestal — Decreto Presidencial n.º 171/18 (fiscalização e contra-ordenações).",
    ],
    ficheiro: `${p.auto.replace(/\//g, "-")}-auto-de-noticia.pdf`,
  });
}

export default function FiscalizacaoPage() {
  const [defesa, setDefesa] = useState<string | null>(null);
  const bloqueado = processosFiscalizacao.some((p) => p.estado === "Aguarda defesa do operador");

  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-2 text-lg font-bold"><ShieldAlert className="h-5 w-5 text-primary" /> Fiscalização — Os Meus Processos</h1>

      {bloqueado && (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm animate-fade-in">
          <AlertOctagon className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <p>
            <strong className="text-destructive">Bloqueio de renovação:</strong> existe uma infracção não sanada.
            Enquanto o processo não for resolvido, não poderá renovar licenças nem candidatar-se a novos concursos.
          </p>
        </div>
      )}

      {processosFiscalizacao.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          Sem autos de notícia associados à sua conta.
        </div>
      ) : (
        <div className="space-y-4">
          {processosFiscalizacao.map((p) => (
            <div key={p.id} className="card-elevated rounded-xl p-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-primary">{p.auto}</span>
                <EstadoBadge estado={p.estado} />
                <span className="ml-auto text-xs font-medium text-muted-foreground">
                  Prazo de defesa: {p.prazoDefesa.split("-").reverse().join("/")}
                </span>
              </div>
              <p className="mt-2 text-sm">{p.motivo}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => baixarAutoPdf(p)}>
                  <Download className="mr-1.5 h-3.5 w-3.5" /> Baixar auto de notícia (PDF)
                </Button>
                <Button size="sm" onClick={() => setDefesa(defesa === p.id ? null : p.id)}>
                  Apresentar defesa
                </Button>
              </div>
              {defesa === p.id && (
                <div className="mt-4 animate-fade-in rounded-lg border border-border bg-muted/30 p-4">
                  <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Exposição dos factos e fundamentos da defesa…" />
                  <div className="mt-3"><FileUpload label="Documentos de suporte" /></div>
                  <Button className="mt-3" size="sm" onClick={() => { setDefesa(null); toast.success("Defesa apresentada (demonstração)."); }}>
                    Submeter defesa
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
