import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, useReducedMotion } from "framer-motion";
import { Map as MapIcon, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalBadge, EstadoBadge } from "@/portal/components/Badges";
import type { MinhaArea } from "@/portal/data/mock";
import { processosIniciais, type BlocoConcessao } from "@/portal/data/concessaoFluxo";
import { InventarioBloco } from "@/portal/components/InventarioBloco";
import { cn } from "@/lib/utils";

const m3 = (v: number) => `${v.toLocaleString("pt-AO")} m³`;

const CORES = ["#2563eb", "#7c3aed", "#0891b2", "#c2410c", "#15803d", "#b45309"];

/** Contorno orgânico da área-mãe, dimensionado pelos hectares. */
const contornoArea = (centro: [number, number], areaHa: number): [number, number][] => {
  const raio = Math.max(0.08, Math.min(0.55, Math.sqrt(areaHa) / 220));
  const pontos = 18;
  return Array.from({ length: pontos }, (_, i) => {
    const ang = (Math.PI * 2 * i) / pontos;
    const variacao = 0.78 + ((Math.sin(i * 2.3) + Math.cos(i * 1.7)) + 2) / 8;
    return [centro[0] + Math.sin(ang) * raio * variacao, centro[1] + Math.cos(ang) * raio * variacao * 1.25] as [number, number];
  });
};

/** Divide um polígono em N sectores a partir do centroide. */
const sectores = (poly: [number, number][], count: number): [number, number][][] => {
  const centro: [number, number] = [
    poly.reduce((s, [lat]) => s + lat, 0) / poly.length,
    poly.reduce((s, [, lng]) => s + lng, 0) / poly.length,
  ];
  return Array.from({ length: count }, (_, i) => {
    const inicio = Math.floor((i * poly.length) / count);
    const fim = Math.floor(((i + 1) * poly.length) / count);
    const contorno = Array.from({ length: Math.max(fim - inicio, 1) + 1 }, (_, o) => poly[(inicio + o) % poly.length]);
    return [centro, ...contorno];
  });
};

interface ConcessaoNaArea {
  codigo: string;
  tipo: string;
  estado: string;
  areaHa: number;
  blocos: BlocoConcessao[];
}

export function AreaMapa({ area }: { area: MinhaArea }) {
  const reduce = useReducedMotion();
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [concessaoSel, setConcessaoSel] = useState<string | null>(null);
  const [blocoSel, setBlocoSel] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(false);

  // Apenas concessões da área (licenças não entram no mapa), cruzadas com os
  // processos do operador para obter os blocos de cada concessão.
  const concessoes = useMemo<ConcessaoNaArea[]>(
    () =>
      area.associacoes.filter((as) => as.tipo === "Concessão").map((as) => {
        const processo = processosIniciais.find((p) => p.codigo === as.codigo);
        return {
          codigo: as.codigo,
          tipo: as.tipo,
          estado: as.estado,
          areaHa: as.areaHa,
          blocos: processo?.blocos ?? [],
        };
      }),
    [area],
  );

  // Centro: coords do mock vêm como [lng, lat]; o Leaflet usa [lat, lng].
  const geometria = useMemo(() => {
    const centro: [number, number] = [area.coords[1], area.coords[0]];
    const contorno = contornoArea(centro, area.areaHa);
    const fatias = concessoes.length ? sectores(contorno, concessoes.length) : [];
    const comBlocos = fatias.map((fatia, i) => {
      const n = concessoes[i]?.blocos.length ?? 0;
      return n ? sectores(fatia, n) : [];
    });
    return { contorno, fatias, comBlocos };
  }, [area, concessoes]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const instancia = L.map(container.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(instancia);
    layerRef.current = L.layerGroup().addTo(instancia);
    mapRef.current = instancia;
    return () => {
      instancia.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const mapa = mapRef.current;
    const camada = layerRef.current;
    if (!mapa || !camada) return;
    camada.clearLayers();

    const areaLayer = L.polygon(geometria.contorno, {
      color: "#1f523a",
      weight: 2.5,
      fillColor: "#1f523a",
      fillOpacity: 0.08,
      dashArray: "6 4",
    }).bindTooltip(`<strong>${area.nome}</strong><br>${area.areaHa.toLocaleString("pt-AO")} ha`, { sticky: true });
    camada.addLayer(areaLayer);

    geometria.fatias.forEach((fatia, i) => {
      const conc = concessoes[i];
      const cor = CORES[i % CORES.length];
      const activa = concessaoSel === conc.codigo;
      const temBlocos = geometria.comBlocos[i].length > 0;
      if (!temBlocos) {
        camada.addLayer(
          L.polygon(fatia, { color: cor, weight: activa ? 3.5 : 1.8, fillColor: cor, fillOpacity: activa ? 0.45 : 0.25 })
            .bindTooltip(`<strong>${conc.tipo} ${conc.codigo}</strong><br>${conc.areaHa.toLocaleString("pt-AO")} ha · ${conc.estado}`, { sticky: true })
            .on("click", () => {
              setConcessaoSel((a) => (a === conc.codigo ? null : conc.codigo));
              setBlocoSel(null);
            }),
        );
        if (activa) camada.addLayer(rotulo(L.polygon(fatia).getBounds().getCenter(), cor, conc.codigo));
        return;
      }
      // Contorno da concessão + blocos internos.
      camada.addLayer(L.polygon(fatia, { color: cor, weight: activa ? 3 : 1.6, fill: false, dashArray: "3 3" }));
      geometria.comBlocos[i].forEach((sub, j) => {
        const bloco = conc.blocos[j];
        const selBloco = concessaoSel === conc.codigo && blocoSel === bloco.id;
        const pct = bloco.volumeContratadoM3 > 0 ? Math.round((bloco.volumeConsumidoM3 / bloco.volumeContratadoM3) * 100) : 0;
        const pol = L.polygon(sub, {
          color: cor,
          weight: selBloco ? 3.5 : 1.4,
          fillColor: cor,
          fillOpacity: selBloco ? 0.55 : activa ? 0.35 : 0.2,
        })
          .bindTooltip(
            `<strong>${bloco.nome}</strong> · ${conc.codigo}<br>${bloco.areaHa.toLocaleString("pt-AO")} ha · ${bloco.especies}<br>Consumido: ${bloco.volumeConsumidoM3.toLocaleString("pt-AO")} m³ (${pct}%)`,
            { sticky: true },
          )
          .on("click", () => {
            setConcessaoSel(conc.codigo);
            setBlocoSel((b) => (b === bloco.id ? null : bloco.id));
          });
        camada.addLayer(pol);
        if (selBloco) camada.addLayer(rotulo(pol.getBounds().getCenter(), cor, bloco.nome));
      });
      if (activa && !blocoSel) camada.addLayer(rotulo(L.polygon(fatia).getBounds().getCenter(), cor, conc.codigo));
    });

    mapa.fitBounds(areaLayer.getBounds(), { padding: [24, 24] });
    setTimeout(() => mapa.invalidateSize(), 120);
  }, [geometria, concessoes, concessaoSel, blocoSel, area]);

  useEffect(() => {
    const id = setTimeout(() => mapRef.current?.invalidateSize(), 200);
    return () => clearTimeout(id);
  }, [expandido]);

  const concActiva = concessoes.find((c) => c.codigo === concessaoSel) ?? null;
  const blocoActivo = concActiva?.blocos.find((b) => b.id === blocoSel) ?? null;
  const totalBlocos = concessoes.reduce((s, c) => s + c.blocos.length, 0);

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <MapIcon className="h-4 w-4 text-primary" /> Mapa da área, concessões e blocos
        </h2>
        <PortalBadge tom="azul">{concessoes.length} recortes</PortalBadge>
        {totalBlocos > 0 && <PortalBadge tom="verde">{totalBlocos} blocos</PortalBadge>}
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setExpandido((v) => !v)}>
          {expandido ? <Minimize2 className="mr-1.5 h-3.5 w-3.5" /> : <Maximize2 className="mr-1.5 h-3.5 w-3.5" />}
          {expandido ? "Reduzir" : "Ampliar"}
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Clique numa concessão ou num bloco no mapa ou na lista para ver o detalhe.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div
          ref={container}
          className={cn("w-full overflow-hidden rounded-lg border border-border", expandido ? "h-[620px]" : "h-[380px]")}
        />
        <div className="space-y-2">
          {concessoes.map((c, i) => {
            const cor = CORES[i % CORES.length];
            const sel = concessaoSel === c.codigo;
            return (
              <div key={c.codigo} className={cn("rounded-lg border transition-colors", sel ? "border-primary bg-primary/5" : "border-border")}>
                <button
                  type="button"
                  onClick={() => {
                    setConcessaoSel(sel ? null : c.codigo);
                    setBlocoSel(null);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-muted/50"
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: cor }} />
                    <span className="text-sm font-semibold">{c.codigo}</span>
                    <span className="ml-auto text-[11px] text-muted-foreground">{c.areaHa.toLocaleString("pt-AO")} ha</span>
                  </span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {c.tipo} · {c.estado}
                  </span>
                </button>
                {sel && c.blocos.length > 0 && (
                  <div className="space-y-1 border-t border-border px-3 py-2">
                    {c.blocos.map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setBlocoSel(blocoSel === b.id ? null : b.id)}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-left text-xs transition-colors",
                          blocoSel === b.id ? "bg-primary/10 font-semibold" : "hover:bg-muted/60",
                        )}
                      >
                        <span className="flex items-center justify-between">
                          <span>{b.nome}</span>
                          <span className="text-[11px] text-muted-foreground">{b.areaHa.toLocaleString("pt-AO")} ha</span>
                        </span>
                        <span className="block text-[11px] text-muted-foreground">{b.especies} · {b.estado}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {concessoes.length === 0 && (
            <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum recorte atribuído sobre esta área-mãe.
            </p>
          )}
        </div>
      </div>

      {blocoActivo && concActiva && (
        <motion.div
          key={blocoActivo.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-border p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold">
              {blocoActivo.nome} · {concActiva.codigo} · {blocoActivo.especies}
            </p>
            <EstadoBadge estado={blocoActivo.estado} />
          </div>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
            <Detalhe label="Área" valor={`${blocoActivo.areaHa.toLocaleString("pt-AO")} ha`} />
            <Detalhe label="Volume contratado" valor={m3(blocoActivo.volumeContratadoM3)} />
            <Detalhe label="Já consumido" valor={m3(blocoActivo.volumeConsumidoM3)} />
            <Detalhe label="Disponível" valor={m3(blocoActivo.volumeContratadoM3 - blocoActivo.volumeConsumidoM3)} />
          </dl>
          <InventarioBloco inventario={blocoActivo.inventario} />
        </motion.div>
      )}
    </div>
  );
}

function rotulo(centro: L.LatLng, cor: string, texto: string) {
  return L.marker(centro, {
    icon: L.divIcon({
      className: "",
      html: `<span style="background:${cor};color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap">${texto}</span>`,
    }),
  });
}

function Detalhe({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{valor}</dd>
    </div>
  );
}
