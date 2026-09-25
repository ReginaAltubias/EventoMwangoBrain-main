import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, FileCheck2, Gavel, TreePine, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { campanha, concursos, estadoCampanha, estadoConcurso, fmtData, totalOperadoresRegistados } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";
import { Countdown } from "@/portal/components/Countdown";

export default function HomePage() {
  const abertos = concursos.filter((c) => estadoConcurso(c) !== "Encerrado").slice(0, 3);

  return (
    <div>
      {/* Destaque */}
      <section className="gradient-hero">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="max-w-2xl animate-slide-up">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Instituto de Desenvolvimento Florestal</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-primary-foreground sm:text-4xl">
              Portal Público do Produtor Florestal
            </h1>
            <p className="mt-4 text-base text-primary-foreground/80">
              Registe-se como operador florestal, candidate-se a concursos públicos de concessão, gira as suas licenças,
              quotas e guias de trânsito — tudo num só lugar, com transparência e rastreabilidade.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-light" asChild>
                <Link to="/registar">Registar-me como operador <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link to="/concursos">Ver concursos públicos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Indicadores */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-8 sm:grid-cols-4">
          {[
            { icon: Users, valor: totalOperadoresRegistados, rotulo: "Operadores registados" },
            { icon: Gavel, valor: abertos.length, rotulo: "Concursos abertos" },
            { icon: TreePine, valor: "18", rotulo: "Províncias cobertas" },
            { icon: FileCheck2, valor: "24h", rotulo: "Verificação de documentos" },
          ].map((s, i) => (
            <div key={s.rotulo} className={`flex items-center gap-3 animate-slide-up stagger-${i + 1}`}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{s.valor}</p>
                <p className="text-xs text-muted-foreground">{s.rotulo}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="mx-auto max-w-6xl space-y-12 px-4 py-12">
        {/* Calendário da campanha */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <CalendarDays className="h-5 w-5 text-primary" /> Calendário da Campanha 2026
            </h2>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3">Tipo de licença / concessão</th>
                  <th className="px-4 py-3">Abertura</th>
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
        </section>

        {/* Concursos recentes */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Gavel className="h-5 w-5 text-primary" /> Concursos públicos recentes
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/concursos">Ver todos <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {abertos.map((c, i) => (
              <Link
                key={c.id}
                to={`/concursos/${c.id}`}
                className={`card-interactive flex flex-col gap-3 rounded-xl p-5 animate-slide-up stagger-${i + 1}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">{c.codigo}</span>
                  <EstadoBadge estado={estadoConcurso(c)} />
                </div>
                <p className="font-semibold leading-snug">{c.titulo}</p>
                <p className="text-sm text-muted-foreground">
                  {c.provincia} · {c.areaHa.toLocaleString("pt-AO")} ha
                </p>
                <Countdown prazo={c.prazo} compacto />
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
