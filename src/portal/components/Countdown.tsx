import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

function restante(prazo: string) {
  const diff = Math.max(0, new Date(prazo).getTime() - Date.now());
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    min: Math.floor((diff % 3600000) / 60000),
    seg: Math.floor((diff % 60000) / 1000),
    encerrado: diff <= 0,
  };
}

export function Countdown({ prazo, compacto = false }: { prazo: string; compacto?: boolean }) {
  const [r, setR] = useState(() => restante(prazo));
  useEffect(() => {
    const t = setInterval(() => setR(restante(prazo)), 1000);
    return () => clearInterval(t);
  }, [prazo]);

  if (r.encerrado) {
    return <span className="text-xs font-semibold text-destructive">Prazo encerrado</span>;
  }

  const urgente = r.dias < 10;
  const cls = cn("inline-flex items-center gap-1.5 font-semibold", urgente ? "text-destructive" : "text-primary", compacto ? "text-xs" : "text-sm");

  if (compacto) {
    return (
      <span className={cls}>
        <Clock className="h-3.5 w-3.5" /> {r.dias}d {r.horas}h restantes
      </span>
    );
  }

  const blocos = [
    { v: r.dias, l: "dias" },
    { v: r.horas, l: "horas" },
    { v: r.min, l: "min" },
    { v: r.seg, l: "seg" },
  ];
  return (
    <div className="flex items-center gap-2">
      {blocos.map((b) => (
        <div key={b.l} className={cn("rounded-lg border px-3 py-2 text-center", urgente ? "border-destructive/30 bg-destructive/5" : "border-primary/25 bg-primary/5")}>
          <div className={cn("text-xl font-bold tabular-nums", urgente ? "text-destructive" : "text-primary")}>{String(b.v).padStart(2, "0")}</div>
          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{b.l}</div>
        </div>
      ))}
    </div>
  );
}
