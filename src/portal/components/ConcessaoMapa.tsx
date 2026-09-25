import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion, useReducedMotion } from "framer-motion";
import { Map as MapIcon, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PortalBadge } from "@/portal/components/Badges";
import type { BlocoConcessao, ProcessoConcessao } from "@/portal/data/concessaoFluxo";
import { InventarioBloco } from "@/portal/components/InventarioBloco";
import { cn } from "@/lib/utils";

const m3 = (v: number) => `${v.toLocaleString("pt-AO")} m³`;

const BLOCK_COLOURS = ["#2563eb", "#7c3aed", "#0891b2", "#c2410c", "#15803d", "#b45309"];

/** Centros aproximados por província para posicionar a área da concessão. */
const PROVINCE_CENTRES: Record<string, [number, number]> = {
  moxico: [-13.0, 21.2],
  cabinda: [-5.15, 12.4],
  uíge: [-7.6, 15.05],
  uige: [-7.6, 15.05],
  bié: [-12.4, 17.0],
  bie: [-12.4, 17.0],
  malanje: [-9.55, 16.35],
  huambo: [-12.78, 15.74],
  "cuando cubango": [-15.0, 19.0],
  zaire: [-6.3, 13.4],
  bengo: [-8.6, 13.7],
  "lunda-norte": [-8.4, 20.4],
  "lunda-sul": [-10.3, 20.4],
};

const centreFor = (area: string): [number, number] => {
  const chave = area.toLowerCase();
  const encontrado = Object.keys(PROVINCE_CENTRES).find((p) => chave.includes(p));
  return encontrado ? PROVINCE_CENTRES[encontrado] : [-11.2, 17.9];
};

/** Contorno orgânico da área total, dimensionado pela área em hectares. */
const areaPolygon = (centre: [number, number], areaHa: number): [number, number][] => {
  const raio = Math.max(0.06, Math.min(0.45, Math.sqrt(areaHa) / 260));
  const pontos = 16;
  return Array.from({ length: pontos }, (_, i) => {
    const ang = (Math.PI * 2 * i) / pontos;
    const variacao = 0.78 + ((Math.sin(i * 2.3) + Math.cos(i * 1.7)) + 2) / 8;
    return [centre[0] + Math.sin(ang) * raio * variacao, centre[1] + Math.cos(ang) * raio * variacao * 1.25] as [number, number];
  });
};

/** Sectores internos (blocos) desenhados a partir do contorno da área. */
const blockPolygons = (poly: [number, number][], count: number): [number, number][][] => {
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

export function ConcessaoMapa({ p }: { p: ProcessoConcessao }) {
  const reduce = useReducedMotion();
  const blocos = useMemo(() => p.blocos ?? [], [p.blocos]);
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [seleccionado, setSeleccionado] = useState<string | null>(null);
  const [expandido, setExpandido] = useState(false);

  const geometria = useMemo(() => {
    const centre = centreFor(p.area);
    const contorno = areaPolygon(centre, p.areaHa);
    const sectores = blocos.length ? blockPolygons(contorno, blocos.length) : [];
    return { contorno, sectores };
  }, [p.area, p.areaHa, blocos.length]);

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
      fillOpacity: 0.1,
      dashArray: "6 4",
    }).bindTooltip(`<strong>${p.area}</strong><br>${p.areaHa.toLocaleString("pt-AO")} ha`, { sticky: true });
    camada.addLayer(areaLayer);

    geometria.sectores.forEach((sector, i) => {
      const bloco = blocos[i];
      const cor = BLOCK_COLOURS[i % BLOCK_COLOURS.length];
      const activo = seleccionado === bloco.id;
      const pct = bloco.volumeContratadoM3 > 0 ? Math.round((bloco.volumeConsumidoM3 / bloco.volumeContratadoM3) * 100) : 0;
      const poligono = L.polygon(sector, {
        color: cor,
        weight: activo ? 3.5 : 1.8,
        fillColor: cor,
        fillOpacity: activo ? 0.5 : 0.28,
      })
        .bindTooltip(
          `<strong>${bloco.nome}</strong><br>${bloco.areaHa.toLocaleString("pt-AO")} ha · ${bloco.especies}<br>Consumido: ${bloco.volumeConsumidoM3.toLocaleString("pt-AO")} m³ (${pct}%)`,
          { sticky: true },
        )
        .on("click", () => setSeleccionado((actual) => (actual === bloco.id ? null : bloco.id)));
      camada.addLayer(poligono);
      if (activo) {
        camada.addLayer(
          L.marker(poligono.getBounds().getCenter(), {
            icon: L.divIcon({
              className: "",
              html: `<span style="background:${cor};color:#fff;padding:2px 6px;border-radius:6px;font-size:10px;font-weight:700;white-space:nowrap">${bloco.nome}</span>`,
            }),
          }),
        );
      }
    });

    mapa.fitBounds(areaLayer.getBounds(), { padding: [24, 24] });
    setTimeout(() => mapa.invalidateSize(), 120);
  }, [geometria, blocos, seleccionado, p.area, p.areaHa]);

  useEffect(() => {
    const id = setTimeout(() => mapRef.current?.invalidateSize(), 200);
    return () => clearTimeout(id);
  }, [expandido]);

  const activo = blocos.find((b) => b.id === seleccionado) ?? null;

  return (
    <div className="card-elevated rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <MapIcon className="h-4 w-4 text-primary" /> Mapa da área e blocos
        </h2>
        <PortalBadge tom="azul">{blocos.length} blocos delimitados</PortalBadge>
        <Button size="sm" variant="outline" className="ml-auto" onClick={() => setExpandido((v) => !v)}>
          {expandido ? <Minimize2 className="mr-1.5 h-3.5 w-3.5" /> : <Maximize2 className="mr-1.5 h-3.5 w-3.5" />}
          {expandido ? "Reduzir" : "Ampliar"}
        </Button>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        Clique num bloco no mapa ou na lista para ver o detalhe do consumo e das espécies.
      </p>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_260px]">
        <div
          ref={container}
          className={cn("w-full overflow-hidden rounded-lg border border-border", expandido ? "h-[620px]" : "h-[380px]")}
        />
        <div className="space-y-2">
          {blocos.map((b, i) => {
            const cor = BLOCK_COLOURS[i % BLOCK_COLOURS.length];
            const sel = seleccionado === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => setSeleccionado(sel ? null : b.id)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left transition-colors",
                  sel ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: cor }} />
                  <span className="text-sm font-semibold">{b.nome}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground">{b.areaHa.toLocaleString("pt-AO")} ha</span>
                </span>
                <span className="mt-0.5 block text-[11px] text-muted-foreground">{b.estado}</span>
              </button>
            );
          })}
        </div>
      </div>

      {activo && (
        <motion.div
          key={activo.id}
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 rounded-lg border border-border p-4"
        >
          <p className="text-sm font-semibold">{activo.nome} · {activo.especies}</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-4">
            <DetalheBloco label="Área" valor={`${activo.areaHa.toLocaleString("pt-AO")} ha`} />
            <DetalheBloco label="Volume contratado" valor={m3(activo.volumeContratadoM3)} />
            <DetalheBloco label="Já consumido" valor={m3(activo.volumeConsumidoM3)} />
            <DetalheBloco label="Disponível" valor={m3(activo.volumeContratadoM3 - activo.volumeConsumidoM3)} />
          </dl>
          <InventarioBloco inventario={activo.inventario} />
        </motion.div>
      )}
    </div>
  );
}

function DetalheBloco({ label, valor }: { label: string; valor: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase text-muted-foreground">{label}</dt>
      <dd className="font-semibold">{valor}</dd>
    </div>
  );
}

export type { BlocoConcessao };
