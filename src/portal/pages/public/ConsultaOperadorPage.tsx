import { useState } from "react";
import { Search, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { operadoresPublicos } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";

export default function ConsultaOperadorPage() {
  const [termo, setTermo] = useState("");
  const [pesquisou, setPesquisou] = useState(false);

  const resultados = pesquisou
    ? operadoresPublicos.filter(
        (o) =>
          o.denominacao.toLowerCase().includes(termo.toLowerCase()) ||
          o.nrof.toLowerCase().includes(termo.toLowerCase()),
      )
    : [];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-bold">Consulta Pública de Operador</h1>
      <p className="mt-2 text-muted-foreground">
        Pesquise por NROF ou denominação. São apresentados apenas dados públicos — nunca NIF completo ou contactos privados.
      </p>

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPesquisou(true);
        }}
      >
        <Input
          placeholder="Ex.: NROF-0142 ou Kimbo Madeiras"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          className="h-11"
        />
        <Button type="submit" className="h-11">
          <Search className="mr-2 h-4 w-4" /> Pesquisar
        </Button>
      </form>

      {pesquisou && (
        <div className="mt-8 space-y-4 animate-fade-in">
          {resultados.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
              Nenhum operador encontrado para «{termo}».
            </div>
          )}
          {resultados.map((o) => (
            <div key={o.nrof} className="card-elevated flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-start">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{o.denominacao}</p>
                  <EstadoBadge estado={o.estado} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{o.nrof} · Província(s) de operação: {o.provincias.join(", ")}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {o.categorias.map((c) => (
                    <span key={c} className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
