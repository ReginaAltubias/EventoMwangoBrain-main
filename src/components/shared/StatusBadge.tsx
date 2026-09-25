import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: string }) {
  const key = status.toLowerCase();
  const tone = key.includes("activ") || key.includes("resolvida") || key.includes("liquid") ? "bg-success/12 text-success border-success/20" : key.includes("susp") || key.includes("análise") || key.includes("pendente") ? "bg-warning-soft text-warning border-warning/20" : key.includes("ban") || key.includes("elimin") ? "bg-destructive/10 text-destructive border-destructive/20" : "bg-element text-muted-foreground border-border";
  return <Badge variant="outline" className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold capitalize", tone)}>{status}</Badge>;
}