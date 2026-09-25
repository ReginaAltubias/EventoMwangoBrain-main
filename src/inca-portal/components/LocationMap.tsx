import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import type { LocationDto } from "@/sigaflo/core/types";

interface LocationMapProps {
  location: LocationDto;
  title: string;
  description?: string;
  markerLabel?: string;
}

export function LocationMap({ location, title, description, markerLabel }: LocationMapProps) {
  const mapNode = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const latitude = location.latitude ?? -10.806;
  const longitude = location.longitude ?? 14.348;

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return;
    const map = L.map(mapNode.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: true,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 18,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    const markerIcon = L.divIcon({
      className: "",
      html: '<span class="inca-map-marker inca-map-marker-primary" aria-hidden="true"></span>',
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
    L.marker([latitude, longitude], { icon: markerIcon })
      .addTo(map)
      .bindTooltip(markerLabel ?? title, { direction: "top", offset: [0, -10] })
      .openTooltip();
    window.setTimeout(() => map.invalidateSize(), 120);
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [latitude, longitude, markerLabel, title]);

  return (
    <section className="card-elevated overflow-hidden rounded-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b p-5">
        <div>
          <h2 className="flex items-center gap-2 font-semibold">
            <MapPin className="h-4 w-4 text-primary" />
            {title}
          </h2>
          {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
        </div>
        <div className="rounded-lg bg-muted/45 px-4 py-2 text-right">
          <p className="text-sm font-semibold">{location.commune ?? location.municipality}</p>
          <p className="text-xs text-muted-foreground">{location.municipality} · {location.province}</p>
        </div>
      </div>
      <div ref={mapNode} className="h-[360px] w-full sm:h-[420px]" aria-label={`Mapa: ${title}`} />
    </section>
  );
}
