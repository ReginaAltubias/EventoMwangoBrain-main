import { ExternalLink, Scale } from "lucide-react";
import { legislacao } from "@/portal/data/mock";

export default function LegislacaoPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Scale className="h-6 w-6 text-primary" /> Legislação de Referência
      </h1>
      <p className="mt-2 text-muted-foreground">Diplomas que regem a actividade florestal em Angola.</p>
      <div className="mt-8 space-y-4">
        {legislacao.map((l, i) => (
          <a
            key={l.titulo}
            href={l.link}
            className={`card-interactive block rounded-xl p-5 animate-slide-up stagger-${i + 1}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{l.titulo}</p>
                <p className="mt-1.5 text-sm text-muted-foreground">{l.resumo}</p>
              </div>
              <ExternalLink className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
