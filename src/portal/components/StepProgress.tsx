import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  passos: string[];
  actual: number; // 0-indexed
  onSelect?: (i: number) => void;
}

// Stepper horizontal numerado, no padrão usado na tramitação (1 —— 2 —— 3).
export function StepProgress({ passos, actual, onSelect }: Props) {
  return (
    <ol className="flex w-full items-start">
      {passos.map((nome, i) => {
        const concluido = i < actual;
        const corrente = i === actual;
        return (
          <li key={nome} className={cn("flex items-start", i < passos.length - 1 && "flex-1")}>
            <button
              type="button"
              onClick={() => onSelect?.(i)}
              disabled={!onSelect}
              className="group flex flex-col items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                  concluido && "border-success bg-success text-success-foreground",
                  corrente && "border-primary bg-primary text-primary-foreground shadow-md",
                  !concluido && !corrente && "border-border bg-card text-muted-foreground",
                )}
              >
                {concluido ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span
                className={cn(
                  "max-w-28 text-center text-[11px] font-medium leading-tight",
                  corrente ? "text-primary" : concluido ? "text-success" : "text-muted-foreground",
                )}
              >
                {nome}
              </span>
            </button>
            {i < passos.length - 1 && (
              <div className={cn("mx-1 mt-4 h-0.5 flex-1 rounded", i < actual ? "bg-success" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}
