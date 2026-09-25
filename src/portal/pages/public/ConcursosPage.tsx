import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Gavel, MapPin, TreeDeciduous } from "lucide-react";
import { concursos, estadoConcurso, fmtData } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";
import { Countdown } from "@/portal/components/Countdown";
import { cn } from "@/lib/utils";

const provincias = [...new Set(concursos.map((c) => c.provincia))];

export default function ConcursosPage() {
  const [provincia, setProvincia] = useState<string | null>(null);
  const [estado, setEstado] = useState<string | null>(null);

  const lista = useMemo(() => {
    return concursos
      .filter((c) => !provincia || c.provincia === provincia)
      .filter((c) => !estado || estadoConcurso(c) === estado)
      .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime());
  }, [provincia, estado]);

  const Chip = ({ activo, onClick, children }: { activo: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
        activo ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary",
      )}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <Gavel className="h-6 w-6 text-primary" /> Concursos Públicos
      </h1>
      <p className="mt-2 text-muted-foreground">Ordenados pelo prazo de candidatura mais próximo.</p>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Chip activo={!provincia} onClick={() => setProvincia(null)}>Todas as províncias</Chip>
        {provincias.map((p) => (
          <Chip key={p} activo={provincia === p} onClick={() => setProvincia(provincia === p ? null : p)}>{p}</Chip>
        ))}
        <span className="mx-2 h-4 w-px bg-border" />
        {["Aberto", "A encerrar em breve", "Encerrado"].map((e) => (
          <Chip key={e} activo={estado === e} onClick={() => setEstado(estado === e ? null : e)}>{e}</Chip>
        ))}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lista.map((c, i) => (
          <Link
            key={c.id}
            to={`/concursos/${c.id}`}
            className={cn("card-interactive flex flex-col gap-3 rounded-xl p-5", `animate-slide-up stagger-${Math.min(i + 1, 5)}`)}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">{c.codigo}</span>
              <EstadoBadge estado={estadoConcurso(c)} />
            </div>
            <p className="font-semibold leading-snug">{c.titulo}</p>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" /> {c.municipio}, {c.provincia} · {c.areaHa.toLocaleString("pt-AO")} ha
              </p>
              <p className="flex items-start gap-1.5">
                <TreeDeciduous className="mt-0.5 h-4 w-4 shrink-0" />
                <span className="line-clamp-2">{c.especies.join(" · ")}</span>
              </p>
            </div>
            <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
              <span className="text-xs text-muted-foreground">Prazo: {fmtData(c.prazo.slice(0, 10))}</span>
              <Countdown prazo={c.prazo} compacto />
            </div>
          </Link>
        ))}
      </div>
      {lista.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
          Nenhum concurso corresponde aos filtros seleccionados.
        </div>
      )}
    </div>
  );
}
