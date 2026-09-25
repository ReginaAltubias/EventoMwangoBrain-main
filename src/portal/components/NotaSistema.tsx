import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Nota de fidelidade à fonte: discreta, mas nunca desaparece.
export function NotaSistema({ texto }: { texto: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-warning/40 bg-warning/10 text-warning">
          <Info className="h-3 w-3" />
          <span className="sr-only">Nota</span>
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{texto}</TooltipContent>
    </Tooltip>
  );
}
