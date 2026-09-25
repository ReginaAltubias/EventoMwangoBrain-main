import { useState } from "react";
import { FileCheck2, SearchX, ShieldCheck, ShieldX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documentosVerificaveis, fmtData, type DocVerificavel } from "@/portal/data/mock";

export default function VerificarDocumentoPage() {
  const [codigo, setCodigo] = useState("");
  const [resultado, setResultado] = useState<DocVerificavel | null>(null);
  const [pesquisou, setPesquisou] = useState(false);

  const verificar = (e: React.FormEvent) => {
    e.preventDefault();
    setResultado(documentosVerificaveis.find((d) => d.codigo.toLowerCase() === codigo.trim().toLowerCase()) ?? null);
    setPesquisou(true);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <FileCheck2 className="h-6 w-6 text-primary" /> Verificação de Documento
      </h1>
      <p className="mt-2 text-muted-foreground">
        Introduza o código de verificação impresso na guia de trânsito, certificado ou alvará.
      </p>

      <form onSubmit={verificar} className="mt-6 flex gap-2">
        <Input placeholder="Ex.: GT-2026-88412" value={codigo} onChange={(e) => setCodigo(e.target.value)} className="h-11" />
        <Button type="submit" className="h-11">Verificar</Button>
      </form>
      <p className="mt-2 text-xs text-muted-foreground">
        Códigos de demonstração: GT-2026-88412 · GT-2026-87001 · CE-2026-1120 · AL-2026-0331
      </p>

      {pesquisou && (
        <div className="mt-8 animate-scale-in">
          {resultado ? (
            <div className={`card-elevated rounded-xl border-l-4 p-6 ${resultado.valido ? "border-l-success" : "border-l-destructive"}`}>
              <div className="flex items-center gap-3">
                {resultado.valido ? (
                  <ShieldCheck className="h-8 w-8 text-success" />
                ) : (
                  <ShieldX className="h-8 w-8 text-destructive" />
                )}
                <div>
                  <p className="font-bold">{resultado.tipo}</p>
                  <p className={`text-sm font-semibold ${resultado.valido ? "text-success" : "text-destructive"}`}>
                    {resultado.valido ? "Documento válido" : "Documento sem validade"}
                  </p>
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Emitido em</dt>
                  <dd className="font-medium">{fmtData(resultado.emitidoEm)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Válido até</dt>
                  <dd className="font-medium">{fmtData(resultado.validoAte)}</dd>
                </div>
              </dl>
              <p className="mt-3 rounded-lg bg-muted px-3 py-2 text-sm text-muted-foreground">{resultado.referencia}</p>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-destructive/40 bg-destructive/5 p-6 text-destructive">
              <SearchX className="h-6 w-6 shrink-0" />
              <p className="text-sm font-medium">
                Código não encontrado. Confirme o código impresso no documento ou contacte o IDF.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
