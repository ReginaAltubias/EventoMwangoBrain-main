import { cn } from "@/lib/utils";

// Badges de estado consistentes (verde=activo/aprovado, cinza=pendente,
// âmbar=em análise/aguarda, vermelho=rejeitado/suspenso, azul=submetido).
const tons: Record<string, string> = {
  verde: "bg-success/10 text-success border-success/20",
  cinza: "bg-muted text-muted-foreground border-border",
  ambar: "bg-warning/10 text-warning border-warning/25",
  vermelho: "bg-destructive/10 text-destructive border-destructive/20",
  azul: "bg-info/10 text-info border-info/20",
};

export type Tom = keyof typeof tons;

export function PortalBadge({ tom, children, className }: { tom: Tom; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold", tons[tom], className)}>
      {children}
    </span>
  );
}

export function tomEstado(estado: string): Tom {
  switch (estado) {
    case "Activo":
    case "Activa":
    case "Aprovado":
    case "Conforme":
    case "Válido":
    case "Paga":
    case "Concluída":
    case "Aberto":
    case "Adjudicada":
      return "verde";
    case "EmAnalise":
    case "Em análise":
    case "A expirar":
    case "Em avaliação":
    case "Em apreciação":
    case "Em emissão":
    case "Aguarda defesa do operador":
    case "A encerrar em breve":
    case "Conforme com reserva":
    case "A abrir":
      return "ambar";
    case "Suspenso":
    case "Expirado":
    case "Expirada":
    case "Rejeitado":
    case "Não conforme":
    case "Encerrado":
    case "Não adjudicada":
      return "vermelho";
    case "Submetido":
    case "Em trânsito":
    case "Em curso":
      return "azul";
    default:
      return "cinza";
  }
}

export function EstadoBadge({ estado, className }: { estado: string; className?: string }) {
  return <PortalBadge tom={tomEstado(estado)} className={className}>{estado === "EmAnalise" ? "Em análise" : estado}</PortalBadge>;
}
