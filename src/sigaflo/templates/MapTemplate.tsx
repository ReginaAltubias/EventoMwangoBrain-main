import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Layers3,
  MapPinned,
  MapPin,
  Maximize2,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/sigaflo/templates/StatusBadge";
import type { MapArea, MapLabels, MapPoint } from "@/sigaflo/core/config";
import { cn } from "@/lib/utils";

const ANGOLA_CENTER: [number, number] = [17.6, -12.1];
const ANGOLA_BOUNDS: [[number, number], [number, number]] = [[11.2, -18.2], [24.2, -4.1]];
const MARKER_CLASSES = ["inca-map-marker-primary", "inca-map-marker-accent", "inca-map-marker-info"];
const DOT_CLASSES = ["bg-primary", "bg-accent", "bg-info"];
const VERDICT_FILTERS = [
  { value: "all", label: "Todos os resultados" },
  { value: "Conforme", label: "Conforme" },
  { value: "ConformeComReserva", label: "Com reservas" },
  { value: "NaoConforme", label: "Não conforme" },
];

type SelectedItem = { type: "point"; item: MapPoint } | { type: "area"; item: MapArea };
type LayerGroups = { areas: L.LayerGroup; concessions: L.LayerGroup; blocks: L.LayerGroup; overlaps: L.LayerGroup; markers: L.LayerGroup };

const CONCESSION_COLOURS = ["#2563eb", "#7c3aed", "#0891b2", "#c2410c"];
const CONFLICT_COLOUR = "#c53030";
const verdictColour = (verdict: string) =>
  verdict === "Conforme" ? "#2f855a" : verdict === "ConformeComReserva" ? "#d69e2e" : CONFLICT_COLOUR;

const toLatLngs = (polygon: [number, number][]): [number, number][] =>
  polygon.map(([longitude, latitude]) => [latitude, longitude]);

const polygonBox = (polygon: [number, number][]) => {
  const longitudes = polygon.map(([longitude]) => longitude);
  const latitudes = polygon.map(([, latitude]) => latitude);
  return { west: Math.min(...longitudes), east: Math.max(...longitudes), south: Math.min(...latitudes), north: Math.max(...latitudes) };
};

const interpolatePoint = (
  bounds: ReturnType<typeof polygonBox>,
  x: number,
  y: number,
): [number, number] => [
  bounds.west + (bounds.east - bounds.west) * x,
  bounds.south + (bounds.north - bounds.south) * y,
];

const ORGANIC_SHAPES: [number, number][][] = [
  [[0.07, 0.26], [0.2, 0.08], [0.57, 0.03], [0.91, 0.2], [0.96, 0.61], [0.74, 0.92], [0.34, 0.96], [0.06, 0.7]],
  Array.from({ length: 14 }, (_, pointIndex) => {
    const angle = (Math.PI * 2 * pointIndex) / 14;
    const radius = pointIndex % 3 === 0 ? 0.47 : 0.42;
    return [0.5 + Math.cos(angle) * radius, 0.5 + Math.sin(angle) * radius] as [number, number];
  }),
  [[0.04, 0.18], [0.35, 0.03], [0.82, 0.12], [0.98, 0.43], [0.83, 0.76], [0.56, 0.96], [0.15, 0.83], [0.01, 0.51]],
  [[0.15, 0.04], [0.58, 0.08], [0.94, 0.29], [0.88, 0.66], [0.65, 0.94], [0.25, 0.89], [0.04, 0.56]],
];

/** Cria parcelas assimétricas e variadas dentro da área registada. */
const concessionPolygon = (area: MapArea, index: number): [number, number][] | null => {
  if ((area.polygon?.length ?? 0) < 3) return null;
  const areaBounds = polygonBox(area.polygon);
  const gapX = (areaBounds.east - areaBounds.west) * 0.075;
  const gapY = (areaBounds.north - areaBounds.south) * 0.075;
  const col = index % 2;
  const row = Math.floor(index / 2);
  const midX = (areaBounds.west + areaBounds.east) / 2;
  const midY = (areaBounds.south + areaBounds.north) / 2;
  const bounds = {
    west: col === 0 ? areaBounds.west + gapX : midX + gapX / 2,
    east: col === 0 ? midX - gapX / 2 : areaBounds.east - gapX,
    south: row === 0 ? midY + gapY / 2 : areaBounds.south + gapY,
    north: row === 0 ? areaBounds.north - gapY : midY - gapY / 2,
  };
  const template = ORGANIC_SHAPES[index % ORGANIC_SHAPES.length];
  return template.map(([x, y]) => interpolatePoint(bounds, x, y));
};

/** Divide um polígono convexo em sectores internos, sem criar rectângulos artificiais. */
const blockPolygons = (polygon: [number, number][], count: number): [number, number][][] => {
  const centre: [number, number] = [
    polygon.reduce((sum, [longitude]) => sum + longitude, 0) / polygon.length,
    polygon.reduce((sum, [, latitude]) => sum + latitude, 0) / polygon.length,
  ];
  return Array.from({ length: count }, (_, index) => {
    const start = Math.floor((index * polygon.length) / count);
    const end = Math.floor(((index + 1) * polygon.length) / count);
    const boundary = Array.from({ length: Math.max(end - start, 1) + 1 }, (_, offset) => polygon[(start + offset) % polygon.length]);
    return [centre, ...boundary];
  });
};

/** Limites [[sul, oeste], [norte, este]] das áreas registadas, no formato do Leaflet. */
const areasBounds = (areas: MapArea[]): [[number, number], [number, number]] | null => {
  const coordinates = areas.flatMap((area) => area.polygon ?? []);
  if (!coordinates.length) return null;
  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);
  return [
    [Math.min(...latitudes), Math.min(...longitudes)],
    [Math.max(...latitudes), Math.max(...longitudes)],
  ];
};

export const MapTemplate = ({
  kinds,
  points,
  areas = [],
  labels = {},
}: {
  kinds: { kind: string; label: string }[];
  points: MapPoint[];
  areas?: MapArea[];
  labels?: MapLabels;
}) => {
  const text = {
    searchPlaceholder: labels.searchPlaceholder ?? "Pesquisar área, operador, concessão ou inspecção",
    areaSingular: labels.areaSingular ?? "Área",
    areaPlural: labels.areaPlural ?? "Áreas",
    subAreaSingular: labels.subAreaSingular ?? "Concessão",
    subAreaPlural: labels.subAreaPlural ?? "Concessões",
    blockSingular: labels.blockSingular ?? "Bloco",
    blockPlural: labels.blockPlural ?? "Blocos",
    ownerLabel: labels.ownerLabel ?? "Operador",
    occupiedLabel: labels.occupiedLabel ?? "Ocupada",
    availableLabel: labels.availableLabel ?? "Disponível",
    overlapLabel: labels.overlapLabel ?? "Análise de conflitos",
    overlapButtonLabel: labels.overlapButtonLabel ?? "Sobreposições",
  };
  const [active, setActive] = useState(["area"]);
  const [selected, setSelected] = useState<SelectedItem | null>(null);
  const [selectedConcessionId, setSelectedConcessionId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [province, setProvince] = useState("all");
  const [verdict, setVerdict] = useState("all");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [showOverlaps, setShowOverlaps] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(0);
  const surface = useRef<HTMLDivElement>(null);
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<LayerGroups | null>(null);
  const areasRef = useRef<MapArea[]>(areas);
  areasRef.current = areas;

  const provinces = useMemo(
    () => [...new Set([...points.map((point) => point.province), ...areas.map((area) => area.province)].filter((item): item is string => Boolean(item)))].sort(),
    [areas, points],
  );
  const visiblePoints = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-AO");
    return points.filter((point) => {
      const matchesType = active.includes(point.kind) && point.kind !== "area";
      const matchesProvince = province === "all" || point.province === province;
      const haystack = `${point.title} ${point.subtitle} ${point.province ?? ""} ${point.municipality ?? ""}`.toLocaleLowerCase("pt-AO");
      return matchesType && matchesProvince && (!term || haystack.includes(term));
    });
  }, [active, points, province, query]);
  const visibleAreas = useMemo(() => {
    const term = query.trim().toLocaleLowerCase("pt-AO");
    return areas
      .map((area) => ({ ...area, concessions: area.concessions ?? [], overlaps: area.overlaps ?? [] }))
      .filter((area) => {
        const haystack = `${area.code} ${area.title} ${area.province} ${area.municipality}`.toLocaleLowerCase("pt-AO");
        return active.includes("area") && (province === "all" || area.province === province) && (verdict === "all" || area.verdict === verdict) && (!term || haystack.includes(term));
      });
  }, [active, areas, province, query, verdict]);
  const resultCount = visiblePoints.length + visibleAreas.length;
  const overlapCount = visibleAreas.filter((area) => area.overlaps.some((overlap) => overlap.overlapHectares > 0)).length;
  const markerClassFor = (kind: string) => MARKER_CLASSES[Math.max(0, kinds.findIndex((item) => item.kind === kind)) % MARKER_CLASSES.length];
  const dotClassFor = (kind: string) => DOT_CLASSES[Math.max(0, kinds.findIndex((item) => item.kind === kind)) % DOT_CLASSES.length];

  const resetView = () => {
    const bounds = areasBounds(areasRef.current);
    if (bounds) map.current?.flyToBounds(bounds, { padding: [70, 70] });
    else map.current?.flyTo([ANGOLA_CENTER[1], ANGOLA_CENTER[0]], 5);
  };
  const clearFilters = () => {
    setActive(["area"]);
    setProvince("all");
    setVerdict("all");
    setQuery("");
    setShowOverlaps(true);
    setSelected(null);
    setSelectedConcessionId(null);
    resetView();
  };
  const focusPoint = (point: MapPoint) => {
    setSelected({ type: "point", item: point });
    setSelectedConcessionId(null);
    map.current?.flyTo([point.coordinate.latitude, point.coordinate.longitude], 9);
  };
  const focusArea = (area: MapArea) => {
    setSelected({ type: "area", item: area });
    setSelectedConcessionId(null);
    if (!area.polygon?.length) return;
    map.current?.flyToBounds(toLatLngs(area.polygon), { padding: [90, 90], maxZoom: 11 });
  };
  const toggleFullscreen = async () => {
    if (!surface.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await surface.current.requestFullscreen();
  };

  useEffect(() => {
    if (!container.current || map.current) return;
    const instance = L.map(container.current, {
      center: [ANGOLA_CENTER[1], ANGOLA_CENTER[0]],
      zoom: 5,
      zoomControl: false,
      attributionControl: true,
      maxBounds: [[-21, 8.5], [-1.5, 27]],
    });
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap contributors",
    }).addTo(instance);
    L.control.zoom({ position: "bottomleft" }).addTo(instance);
    map.current = instance;
    layers.current = {
      areas: L.layerGroup().addTo(instance),
      concessions: L.layerGroup().addTo(instance),
      blocks: L.layerGroup().addTo(instance),
      overlaps: L.layerGroup().addTo(instance),
      markers: L.layerGroup().addTo(instance),
    };
    const bounds = areasBounds(areasRef.current);
    if (bounds) instance.fitBounds(bounds, { padding: [70, 70] });
    setMapLoaded((value) => value + 1);
    return () => {
      const current = map.current;
      window.setTimeout(() => {
        if (container.current?.isConnected) return;
        current?.remove();
        if (map.current === current) map.current = null;
      }, 0);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      window.setTimeout(() => map.current?.invalidateSize(), 120);
    };
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => document.removeEventListener("fullscreenchange", onFullscreen);
  }, []);

  useEffect(() => {
    const groups = layers.current;
    if (!map.current || !mapLoaded || !groups) return;
    groups.areas.clearLayers();
    groups.concessions.clearLayers();
    groups.blocks.clearLayers();
    groups.overlaps.clearLayers();
    const drawableAreas = visibleAreas.filter((area) => (area.polygon?.length ?? 0) >= 3);
    drawableAreas.forEach((area) => {
      const colour = verdictColour(area.verdict);
      L.polygon(toLatLngs(area.polygon), { color: colour, weight: 3, fillColor: colour, fillOpacity: 0.22 })
        .bindTooltip(`${area.code} · ${area.areaHectares.toLocaleString("pt-AO")} ha`, { sticky: true })
        .on("click", () => focusArea(area))
        .addTo(groups.areas);
      if (!showOverlaps) return;
      area.concessions.forEach((concession, index) => {
        const polygon = concessionPolygon(area, index);
        if (!polygon) return;
        const colour = CONCESSION_COLOURS[index % CONCESSION_COLOURS.length];
        const isSelected = selectedConcessionId === concession.id;
        L.polygon(toLatLngs(polygon), { color: colour, weight: isSelected ? 4 : 2.5, fillColor: colour, fillOpacity: isSelected ? 0.5 : 0.28 })
          .bindTooltip(`<strong>${concession.code}</strong><br>${text.ownerLabel}: ${concession.operator}<br>${concession.occupiedHectares.toLocaleString("pt-AO")} ha · ${concession.blocks.length} ${text.blockPlural.toLowerCase()}`, { sticky: true })
          .on("click", () => {
            setSelected({ type: "area", item: area });
            setSelectedConcessionId(concession.id);
            map.current?.flyToBounds(toLatLngs(polygon), { padding: [150, 150], maxZoom: 14 });
          })
          .addTo(groups.concessions);
        if (!isSelected) return;
        blockPolygons(polygon, concession.blocks.length).forEach((blockPolygon, blockIndex) => {
          const block = concession.blocks[blockIndex];
          L.polygon(toLatLngs(blockPolygon), { color: colour, weight: 1.5, dashArray: "4 3", fillColor: colour, fillOpacity: blockIndex % 2 === 0 ? 0.14 : 0.24 })
            .bindTooltip(`<strong>${block.code}</strong><br>${concession.code}<br>${block.detail ?? `${block.hectares.toLocaleString("pt-AO")} ha`}`, { sticky: true })
            .addTo(groups.blocks);
        });
      });
      area.overlaps
        .filter((overlap) => overlap.overlapHectares > 0)
        .forEach((overlap, index) => {
          const polygon = concessionPolygon(area, index);
          if (!polygon) return;
          L.polygon(toLatLngs(polygon), { color: CONFLICT_COLOUR, weight: 2, dashArray: "6 4", fillColor: CONFLICT_COLOUR, fillOpacity: 0.45 })
            .bindTooltip(`${overlap.layer} · ${overlap.overlapHectares.toLocaleString("pt-AO")} ha em conflito`, { sticky: true })
            .addTo(groups.overlaps);
        });
    });
  }, [mapLoaded, selectedConcessionId, showOverlaps, visibleAreas]);

  useEffect(() => {
    const groups = layers.current;
    if (!map.current || !mapLoaded || !groups) return;
    groups.markers.clearLayers();
    visiblePoints.forEach((point) => {
      const icon = L.divIcon({
        className: "",
        html: `<span class="inca-map-marker ${markerClassFor(point.kind)}"></span>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
      L.marker([point.coordinate.latitude, point.coordinate.longitude], { icon, title: point.title })
        .on("click", () => setSelected({ type: "point", item: point }))
        .addTo(groups.markers);
    });
  }, [mapLoaded, visiblePoints]);

  const selectedArea = selected?.type === "area" ? selected.item : null;
  const selectedPoint = selected?.type === "point" ? selected.item : null;
  const selectedConcession = selectedArea?.concessions.find((concession) => concession.id === selectedConcessionId) ?? null;
  const positiveOverlaps = selectedArea?.overlaps.filter((overlap) => overlap.overlapHectares > 0) ?? [];
  const occupiedHectares = selectedArea?.concessions.reduce((total, concession) => total + concession.occupiedHectares, 0) ?? 0;
  const availableHectares = Math.max((selectedArea?.areaHectares ?? 0) - occupiedHectares, 0);
  const occupationPercent = selectedArea?.areaHectares ? Math.min((occupiedHectares / selectedArea.areaHectares) * 100, 100) : 0;

  return (
    <div ref={surface} className={cn("relative isolate min-h-[620px] overflow-hidden bg-muted", isFullscreen ? "h-screen" : "h-[calc(100vh-80px)]")}>
      <div ref={container} className="absolute inset-0" />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 right-3 top-3 z-10 flex flex-col gap-2 lg:left-5 lg:right-5 lg:top-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2 rounded-lg border bg-card/95 p-2 shadow-lg backdrop-blur-md lg:max-w-3xl lg:flex-row">
          <div className="relative min-w-0 flex-1 rounded-lg border bg-card/95 shadow-lg backdrop-blur-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
             <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} className="h-12 border-0 bg-transparent pl-10 pr-10 shadow-none focus-visible:ring-1" />
            {query && <Button variant="ghost" size="icon" onClick={() => setQuery("")} className="absolute right-1 top-1 h-10 w-10" aria-label="Limpar pesquisa"><X className="h-4 w-4" /></Button>}
          </div>
          <Select value={province} onValueChange={setProvince}>
            <SelectTrigger className="h-12 w-full border bg-card shadow-none lg:w-44"><MapPin className="mr-2 h-4 w-4 text-primary" /><SelectValue placeholder="Província" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas as províncias</SelectItem>{provinces.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={verdict} onValueChange={setVerdict}>
            <SelectTrigger className="h-12 w-full border bg-card shadow-none lg:w-48"><ShieldCheck className="mr-2 h-4 w-4 text-primary" /><SelectValue /></SelectTrigger>
            <SelectContent>{VERDICT_FILTERS.map((item) => <SelectItem key={item.value} value={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 self-end">
           <Button variant={showOverlaps ? "default" : "outline"} onClick={() => setShowOverlaps((value) => !value)} className={cn("h-11 gap-2 shadow-lg", !showOverlaps && "bg-card/95 backdrop-blur-md")}><Layers3 className="h-4 w-4" /><span className="hidden sm:inline">{text.overlapButtonLabel}</span><span className="text-xs opacity-75">{areas.reduce((total, area) => total + (area.concessions?.length ?? 0), 0)}</span></Button>
          <Button variant="outline" onClick={clearFilters} className="h-11 gap-2 bg-card/95 shadow-lg backdrop-blur-md"><RotateCcw className="h-4 w-4" /><span className="hidden sm:inline">Limpar</span></Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen} className="h-11 w-11 bg-card/95 shadow-lg backdrop-blur-md" aria-label={isFullscreen ? "Sair do ecrã completo" : "Ver em ecrã completo"}>{isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}</Button>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 top-[238px] z-10 flex max-w-[calc(100%-24px)] flex-wrap gap-2 sm:top-[178px] lg:left-5 lg:top-24">
        {kinds.map((kind, index) => {
          const enabled = active.includes(kind.kind);
          const count = kind.kind === "area" ? areas.length : points.filter((point) => point.kind === kind.kind).length;
          return <Button key={kind.kind} variant="outline" onClick={() => setActive((items) => enabled ? items.filter((item) => item !== kind.kind) : [...items, kind.kind])} className={cn("h-9 gap-2 bg-card/95 px-3 shadow-md backdrop-blur-md", !enabled && "opacity-55")}><span className={cn("h-2.5 w-2.5 rounded-full", DOT_CLASSES[index % DOT_CLASSES.length])} /><span>{kind.label}</span><span className="text-xs text-muted-foreground">{count}</span></Button>;
        })}
      </motion.div>

      <div className="absolute bottom-4 left-3 z-10 hidden rounded-lg border bg-card/95 p-3 shadow-lg backdrop-blur-md md:block lg:left-20">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold"><MapPinned className="h-4 w-4 text-primary" />Leitura territorial</div>
         <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm border-2 border-success bg-success/20" />{text.areaSingular}</span>
             <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-info" />{text.subAreaPlural}</span>
            <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-muted" />{text.availableLabel}</span>
           {overlapCount > 0 && <span className="flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-sm bg-destructive" />Conflito territorial</span>}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }} className="absolute bottom-20 left-3 z-20 w-[min(390px,calc(100%-24px))] overflow-hidden rounded-lg border bg-card/95 shadow-xl backdrop-blur-md lg:left-20">
            <div className="border-b p-4">
              <div className="flex items-start gap-3">
                <span className={cn("mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-primary-foreground", selectedPoint ? dotClassFor(selectedPoint.kind) : selectedArea?.verdict === "NaoConforme" ? "bg-destructive" : selectedArea?.verdict === "ConformeComReserva" ? "bg-warning" : "bg-success")}><MapPin className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1"><p className="font-display text-sm font-semibold">{selectedPoint?.title ?? selectedArea?.title}</p><p className="mt-0.5 text-xs text-muted-foreground">{selectedPoint?.subtitle ?? `${selectedArea?.code} · ${selectedArea?.areaHectares.toLocaleString("pt-AO")} ha`}</p></div>
                <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="-mr-2 -mt-2" aria-label="Fechar detalhe"><X className="h-4 w-4" /></Button>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">{(selectedPoint?.status || selectedArea?.verdict) && <StatusBadge status={selectedPoint?.status ?? selectedArea?.verdict ?? ""} />}<span className="rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground">{selectedPoint?.municipality ?? selectedArea?.municipality ?? "Município não indicado"}{(selectedPoint?.province ?? selectedArea?.province) ? ` · ${selectedPoint?.province ?? selectedArea?.province}` : ""}</span></div>
            </div>
            {selectedArea && (
              <div className="p-4">
                 <div className="mb-4 grid grid-cols-3 gap-2">
                   <div className="rounded-md bg-muted p-2.5"><p className="text-[10px] text-muted-foreground">Área total</p><strong className="mt-1 block text-xs">{selectedArea.areaHectares.toLocaleString("pt-AO")} ha</strong></div>
                    <div className="rounded-md bg-info/10 p-2.5"><p className="text-[10px] text-muted-foreground">{text.occupiedLabel}</p><strong className="mt-1 block text-xs text-info">{occupiedHectares.toLocaleString("pt-AO")} ha</strong></div>
                    <div className="rounded-md bg-success/10 p-2.5"><p className="text-[10px] text-muted-foreground">{text.availableLabel}</p><strong className="mt-1 block text-xs text-success">{availableHectares.toLocaleString("pt-AO")} ha</strong></div>
                 </div>
                 <div className="mb-4">
                    <div className="mb-1.5 flex justify-between text-[11px]"><span className="font-medium">Ocupação da {text.areaSingular.toLowerCase()}</span><strong>{occupationPercent.toLocaleString("pt-AO", { maximumFractionDigits: 1 })}%</strong></div>
                   <div className="h-2 overflow-hidden rounded-full bg-muted"><motion.div initial={{ width: 0 }} animate={{ width: `${occupationPercent}%` }} className="h-full rounded-full bg-info" /></div>
                 </div>
                 <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">{text.subAreaPlural} nesta {text.areaSingular.toLowerCase()}</p>
                    {selectedArea.concessions.length ? <div className="max-h-56 space-y-2 overflow-y-auto pr-1">{selectedArea.concessions.map((concession, index) => {
                      const concessionSelected = selectedConcessionId === concession.id;
                       return <Button key={concession.id} variant="ghost" onClick={() => setSelectedConcessionId(concessionSelected ? null : concession.id)} className={cn("h-auto w-full flex-col items-stretch rounded-md border p-3 text-left", concessionSelected ? "border-primary bg-primary/5" : "bg-card hover:bg-muted/60")}><span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate text-xs font-semibold" style={{ color: CONCESSION_COLOURS[index % CONCESSION_COLOURS.length] }}>{concession.code}</span><span className="block truncate text-[11px] font-normal text-muted-foreground">{concession.operator}</span></span><strong className="whitespace-nowrap text-xs">{concession.occupiedHectares.toLocaleString("pt-AO")} ha</strong></span>{concessionSelected && <motion.span initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 flex flex-wrap gap-1">{concession.blocks.map((block) => <span key={block.code} className="rounded border bg-muted px-1.5 py-0.5 text-[10px] font-medium">{block.code} · {block.detail ?? `${block.hectares.toLocaleString("pt-AO")} ha`}</span>)}</motion.span>}</Button>;
                    })}</div> : <p className="rounded-md bg-muted p-3 text-xs text-muted-foreground">Nenhuma {text.subAreaSingular.toLowerCase()} associada.</p>}
                    {!selectedConcession && selectedArea.concessions.length > 0 && <p className="mt-2 text-[10px] text-muted-foreground">Seleccione uma {text.subAreaSingular.toLowerCase()} para revelar as suas {text.blockPlural.toLowerCase()}.</p>}
                 </div>
                 {overlapCount > 0 && <><div className="mb-2 flex items-center justify-between"><p className="text-xs font-semibold uppercase text-muted-foreground">{text.overlapLabel}</p><span className="text-xs font-semibold">{positiveOverlaps.length} ocorrência(s)</span></div>
                 {positiveOverlaps.length ? <div className="space-y-2">{positiveOverlaps.map((overlap) => <div key={overlap.layer} className="rounded-md border border-destructive/20 bg-destructive/5 p-3"><div className="flex items-center justify-between gap-3"><span className="flex min-w-0 items-center gap-2 text-xs font-semibold"><AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />{overlap.layer}</span><strong className="whitespace-nowrap text-xs text-destructive">{overlap.overlapHectares.toLocaleString("pt-AO")} ha</strong></div><p className="mt-1 text-[11px] text-muted-foreground">{overlap.note}</p></div>)}</div> : <p className="rounded-md bg-success/10 p-3 text-xs text-success">Sem sobreposições registadas nesta área.</p>}
                 <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">As manchas de conflito são uma representação indicativa dos dados mock e não substituem validação cadastral.</p></>}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 right-3 z-10 flex items-end gap-2 xl:right-5">
        <AnimatePresence>{resultsOpen && <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="absolute bottom-14 right-0 flex h-[min(520px,58vh)] w-[min(360px,calc(100vw-48px))] flex-col overflow-hidden rounded-lg border bg-card/95 shadow-xl backdrop-blur-md xl:bottom-0 xl:right-14">
          <div className="flex items-center justify-between border-b p-4"><div><p className="font-display text-sm font-semibold">Registos territoriais</p><p className="text-xs text-muted-foreground">{resultCount} resultados · {overlapCount} com conflito</p></div><Button variant="ghost" size="icon" onClick={() => setResultsOpen(false)} aria-label="Fechar resultados"><PanelRightClose className="h-4 w-4" /></Button></div>
          <div className="flex-1 space-y-1.5 overflow-y-auto p-2">
            {visibleAreas.map((area) => <Button key={`area-${area.id}`} variant="ghost" onClick={() => focusArea(area)} className={cn("h-auto min-h-16 w-full justify-start gap-3 border border-transparent px-3 py-2 text-left", selectedArea?.id === area.id ? "border-primary/20 bg-primary/5" : "hover:bg-muted/80")}><span className={cn("h-8 w-1 shrink-0 rounded-full", area.verdict === "NaoConforme" ? "bg-destructive" : area.verdict === "ConformeComReserva" ? "bg-warning" : "bg-success")} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{area.title}</span><span className="block truncate text-xs font-normal text-muted-foreground">{area.code} · {area.areaHectares.toLocaleString("pt-AO")} ha</span></span>{area.overlaps.some((item) => item.overlapHectares > 0) && <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />}</Button>)}
            {visiblePoints.map((point) => <Button key={`${point.kind}-${point.id}`} variant="ghost" onClick={() => focusPoint(point)} className={cn("h-auto min-h-14 w-full justify-start gap-3 border border-transparent px-3 py-2 text-left", selectedPoint?.id === point.id && selectedPoint.kind === point.kind ? "border-primary/20 bg-primary/5" : "hover:bg-muted/80")}><MapPin className={cn("h-4 w-4 shrink-0", markerClassFor(point.kind).replace("inca-map-marker-", "text-"))} /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{point.title}</span><span className="block truncate text-xs font-normal text-muted-foreground">{point.subtitle}</span></span></Button>)}
            {resultCount === 0 && <div className="flex h-full flex-col items-center justify-center px-6 text-center"><MapPin className="mb-3 h-7 w-7 text-muted-foreground" /><p className="text-sm font-semibold">Nenhuma localização</p><p className="mt-1 text-xs text-muted-foreground">Altere ou limpe os filtros para ver outros registos.</p></div>}
          </div>
        </motion.aside>}</AnimatePresence>
        <Button variant={resultsOpen ? "default" : "outline"} onClick={() => setResultsOpen((value) => !value)} className={cn("h-11 gap-2 shadow-lg", !resultsOpen && "bg-card/95 backdrop-blur-md")}><PanelRightOpen className="h-4 w-4" /><span>{resultsOpen ? "Ocultar" : `Registos (${resultCount})`}</span></Button>
      </div>
    </div>
  );
};
