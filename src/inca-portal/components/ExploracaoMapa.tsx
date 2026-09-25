import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Map as MapIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/portal/components/Badges";
import * as inca from "@/mocks/inca";
import { cn } from "@/lib/utils";

const CORES = ["hsl(191 76% 36%)", "hsl(39 52% 52%)", "hsl(152 60% 34%)", "hsl(0 72% 48%)"];

const contorno = (lat: number, lng: number, area: number): [number, number][] => {
  const raio = 0.008 + Math.sqrt(area) * 0.002;
  return Array.from({ length: 12 }, (_, index) => {
    const angulo = (Math.PI * 2 * index) / 12;
    const variacao = 0.82 + ((index * 7) % 4) * 0.06;
    return [lat + Math.sin(angulo) * raio * variacao, lng + Math.cos(angulo) * raio * variacao * 1.2];
  });
};

const sectores = (polygon: [number, number][], quantidade: number): [number, number][][] => {
  const centro: [number, number] = [polygon.reduce((total, [lat]) => total + lat, 0) / polygon.length, polygon.reduce((total, [, lng]) => total + lng, 0) / polygon.length];
  return Array.from({ length: quantidade }, (_, index) => {
    const inicio = Math.floor((index * polygon.length) / quantidade);
    const fim = Math.floor(((index + 1) * polygon.length) / quantidade);
    return [centro, ...Array.from({ length: fim - inicio + 1 }, (__, offset) => polygon[(inicio + offset) % polygon.length])];
  });
};

export function ExploracaoMapa({ farmId }: { farmId: string }) {
  const farm = inca.farms.find((item) => item.id === farmId);
  const plots = useMemo(() => inca.plots.filter((item) => item.farmId === farmId), [farmId]);
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const [selected, setSelected] = useState(plots[0]?.id ?? "");

  const geometry = useMemo(() => {
    if (!farm) return null;
    const polygon = contorno(farm.location.latitude ?? -10.806, farm.location.longitude ?? 14.348, farm.area);
    return { polygon, plots: sectores(polygon, plots.length) };
  }, [farm, plots.length]);

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = L.map(mapNode.current, { scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "&copy; OpenStreetMap" }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer || !farm || !geometry) return;
    layer.clearLayers();
    const boundary = L.polygon(geometry.polygon, { color: "hsl(151 45% 22%)", weight: 3, fillColor: "hsl(151 45% 22%)", fillOpacity: 0.1, dashArray: "7 4" })
      .bindTooltip(`<strong>${farm.name}</strong><br>${farm.area.toLocaleString("pt-AO")} ha`);
    boundary.addTo(layer);
    geometry.plots.forEach((polygon, index) => {
      const plot = plots[index];
      const active = plot.id === selected;
      L.polygon(polygon, { color: CORES[index % CORES.length], weight: active ? 4 : 2, fillColor: CORES[index % CORES.length], fillOpacity: active ? 0.48 : 0.28 })
        .bindTooltip(`<strong>Parcela ${plot.code}</strong><br>${plot.area} ha · ${plot.harvests.length} colheita(s)`, { sticky: true })
        .on("click", () => setSelected(plot.id))
        .addTo(layer);
    });
    map.fitBounds(boundary.getBounds(), { padding: [26, 26] });
    window.setTimeout(() => map.invalidateSize(), 120);
  }, [farm, geometry, plots, selected]);

  if (!farm) return null;
  const plot = plots.find((item) => item.id === selected) ?? plots[0];
  const coffee = inca.coffees.find((item) => item.id === plot?.coffeeId);

  return <section className="card-elevated rounded-xl p-5">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-semibold"><MapIcon className="h-4 w-4 text-primary" /> Mapa da exploração e parcelas</h2><p className="mt-1 text-xs text-muted-foreground">Seleccione uma parcela para consultar a área, o café plantado e as colheitas.</p></div><EstadoBadge estado={farm.status === "Validated" ? "Validada" : "Aguarda validação"} /></div>
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
      <div ref={mapNode} className="h-[430px] overflow-hidden rounded-lg border" />
      <div className="space-y-2">{plots.map((item, index) => <Button key={item.id} variant="outline" onClick={() => setSelected(item.id)} className={cn("h-auto w-full justify-start px-3 py-3 text-left", item.id === selected && "border-primary bg-primary/5")}><span className="mr-3 h-3 w-3 rounded-sm" style={{ backgroundColor: CORES[index % CORES.length] }} /><span><strong className="block text-sm">Parcela {item.code}</strong><span className="text-xs font-normal text-muted-foreground">{item.area} ha · {item.harvests.length} colheita(s)</span></span></Button>)}</div>
    </div>
    {plot && <div className="mt-4 grid gap-4 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-4"><div><p className="text-xs text-muted-foreground">Parcela</p><p className="font-semibold">{plot.code} · {plot.area} ha</p></div><div><p className="text-xs text-muted-foreground">Café</p><p className="font-semibold">{coffee?.name ?? "—"}</p></div><div><p className="text-xs text-muted-foreground">Plantação</p><p className="font-semibold">{plot.plantingYear} · {plot.shadePercentage}% sombra</p></div><div><p className="text-xs text-muted-foreground">Produção registada</p><p className="font-semibold">{plot.harvests.reduce((sum, item) => sum + item.quantity, 0).toLocaleString("pt-AO")} kg</p></div></div>}
  </section>;
}