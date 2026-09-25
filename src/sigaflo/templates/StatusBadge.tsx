import { cn } from "@/lib/utils";

const TONES: Record<string, string> = {
  success: "bg-success/15 text-success border-success/30",
  warning: "bg-warning/15 text-warning border-warning/30",
  danger: "bg-destructive/15 text-destructive border-destructive/30",
  info: "bg-info/15 text-info border-info/30",
  neutral: "bg-muted text-muted-foreground border-border",
  primary: "bg-primary/15 text-primary border-primary/30",
};

const GOOD = ["active", "activa", "activo", "approved", "validated", "completed", "issued", "emitida", "paid", "authorized", "conforme", "concluída", "finalizado", "em stock", "closed", "encerrada"];
const WARN = ["submitted", "underreview", "requested", "inprogress", "em progresso", "draft", "rascunho", "pending", "pendente", "liquidated", "open", "aberto", "planned", "recebido", "em processamento", "em embalagem", "pendingvalidation", "aguarda pagamento", "submetido", "conformecomreserva", "suspenso", "suspended", "underanalysis"];
const BAD = ["rejected", "rejeitado", "cancelled", "cancelada", "cancelado", "expired", "expirada", "naoconforme", "retirado"];

const LABELS: Record<string, string> = {
  active: "Activo",
  approved: "Aprovado",
  authorized: "Autorizado",
  cancelled: "Cancelado",
  closed: "Encerrado",
  completed: "Concluído",
  draft: "Rascunho",
  expired: "Expirado",
  inprogress: "Em progresso",
  issued: "Emitido",
  paid: "Pago",
  pending: "Pendente",
  liquidated: "Liquidado",
  pendingvalidation: "Aguarda validação",
  planned: "Planeado",
  rejected: "Rejeitado",
  open: "Aberto",
  requested: "Solicitado",
  submitted: "Submetido",
  suspended: "Suspenso",
  underanalysis: "Em análise",
  underreview: "Em apreciação",
  validated: "Validado",
  inactive: "Inactivo",
  revoked: "Revogado",
  pendingapproval: "Aguarda aprovação",
  pendingpayment: "Aguarda pagamento",
  underinspection: "Em inspecção",
  compliant: "Conforme",
  noncompliant: "Não conforme",
  partiallycompliant: "Conforme com reservas",
  registered: "Registado",
  inlot: "Integrado em lote",
  consumed: "Consumido",
  individual: "Individual",
  company: "Empresa",
  cooperative: "Cooperativa",
  publicentity: "Entidade pública",
  communityforest: "Floresta comunitária",
  forestconcession: "Concessão florestal",
  publictender: "Concurso público",
  simplifiedcontracting: "Contratação simplificada",
  roundwood: "Madeira em toro",
  sawnwood: "Madeira serrada",
  productinstorage: "Produto armazenado",
  entry: "Entrada",
  exit: "Saída",
  low: "Baixo",
  medium: "Médio",
  high: "Alto",
  concession: "Concessão",
  license: "Licença",
  transitguide: "Guia de trânsito",
  warehouse: "Entreposto",
  fine: "Multa",
  inspection: "Inspecção",
  exportprocess: "Processo de exportação",
  origin: "Origem",
  other: "Outro",
  phytosanitary: "Fitossanitário",
  legality: "Legalidade",
  sustainability: "Sustentabilidade",
  legalvalidation: "Validação jurídica",
  technicalvalidation: "Validação técnica",
};

export const statusLabel = (status?: string) => {
  if (!status) return "";
  const key = status.toLowerCase().replace(/[\s_-]+/g, "").trim();
  return LABELS[key] ?? status;
};

export const statusTone = (status?: string) => {
  const key = (status ?? "").toLowerCase().replace(/\s+/g, " ").trim();
  if (!key) return "neutral";
  if (GOOD.includes(key)) return "success";
  if (BAD.includes(key)) return "danger";
  if (WARN.includes(key)) return "warning";
  return "info";
};

export const StatusBadge = ({ status, className }: { status?: string; className?: string }) => {
  if (!status) return <span className="text-muted-foreground">—</span>;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        TONES[statusTone(status)],
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
};
