import { useEffect, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { ArrowLeft, Download, FileText, Gavel, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { concursos, estadoConcurso, fmtData } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";
import { Countdown } from "@/portal/components/Countdown";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { useNavigate } from "react-router-dom";

export default function ConcursoDetalhePage() {
  const { id } = useParams();
  const c = concursos.find((x) => x.id === id);
  const { operador, abrirAuthModal } = usePortalAuth();
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!c || !mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapRef.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: c.coords,
      zoom: 6.5,
      interactive: false, // mapa read-only
    });
    new maplibregl.Marker({ color: "#1f523a" }).setLngLat(c.coords).addTo(map);
    return () => map.remove();
  }, [c]);

  if (!c) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <p className="text-muted-foreground">Concurso não encontrado.</p>
        <Button variant="ghost" asChild className="mt-4"><Link to="/concursos">Voltar aos concursos</Link></Button>
      </div>
    );
  }

  const estado = estadoConcurso(c);

  const candidatar = () => {
    // Fluxo de login automático (decisão de UX — ver Parte 3 do prompt).
    if (!operador) {
      abrirAuthModal({ tipo: "concurso", id: c.id });
      return;
    }
    if (operador.estado === "Activo") navigate(`/painel/concursos/${c.id}/candidatar`);
    else navigate("/estado-registo");
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <Button variant="ghost" size="sm" asChild className="mb-4">
        <Link to="/concursos"><ArrowLeft className="mr-1.5 h-4 w-4" /> Voltar aos concursos</Link>
      </Button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-primary">{c.codigo}</span>
            <EstadoBadge estado={estado} />
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight">{c.titulo}</h1>
          <p className="mt-1 text-muted-foreground">
            {c.municipio}, {c.provincia} · {c.areaHa.toLocaleString("pt-AO")} ha · Abertura: {fmtData(c.abertura.slice(0, 10))}
          </p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <Countdown prazo={c.prazo} />
          {estado !== "Encerrado" && (
            <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent-light" onClick={candidatar}>
              <Gavel className="mr-2 h-4 w-4" /> Candidatar-me a este concurso
            </Button>
          )}
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="card-elevated overflow-hidden rounded-xl">
          <div ref={mapRef} className="h-72 w-full" />
          <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
            Localização aproximada da área a concurso (mapa apenas de leitura).
          </p>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" /> Memória descritiva</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.descricao}</p>
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Espécies previstas</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {c.especies.map((e) => (
                <span key={e} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{e}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card-elevated rounded-xl p-5">
          <h2 className="flex items-center gap-2 font-semibold"><Download className="h-4 w-4 text-primary" /> Peças do procedimento</h2>
          <ul className="mt-3 divide-y divide-border">
            {c.pecas.map((p) => (
              <li key={p.nome} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" /> {p.nome}
                  <span className="text-xs text-muted-foreground">({p.tamanho})</span>
                </span>
                <Button variant="ghost" size="sm">Descarregar</Button>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-elevated rounded-xl p-5">
          <h2 className="flex items-center gap-2 font-semibold"><ListChecks className="h-4 w-4 text-primary" /> Critérios de avaliação</h2>
          <ul className="mt-3 space-y-2">
            {c.criterios.map((cr, i) => (
              <li key={cr} className="flex items-start gap-2.5 text-sm">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{i + 1}</span>
                {cr}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
