import type { ConcessionSubPhaseDto, TechnicalInstrumentDto } from "@/modules/idf/registry/types";

/** Sub-fases reais do procedimento de concessão (dados mock de apresentação). */
export const CONCESSION_SUBPHASES: ConcessionSubPhaseDto[] = [
  { key: "preliminary", label: "Em apreciação preliminar", deadlineDays: 5, deadlineLabel: "5 dias úteis" },
  { key: "survey-fee", label: "Aguarda liquidação de vistoria", deadlineDays: 5, deadlineLabel: "5 dias úteis" },
  { key: "survey-scheduled", label: "Vistoria agendada", deadlineDays: 10, deadlineLabel: "10 dias úteis" },
  { key: "survey-done", label: "Vistoria realizada", deadlineDays: 10, deadlineLabel: "10 dias úteis" },
  { key: "governor", label: "Aguarda parecer do Governador", deadlineDays: 10, deadlineLabel: "10 dias" },
  { key: "idf-dnf", label: "Em análise conjunta IDF/DNF", deadlineDays: 10, deadlineLabel: "10 dias úteis" },
  { key: "ministerial", label: "Aguarda despacho ministerial", deadlineDays: 10, deadlineLabel: "10 dias" },
  { key: "negotiation", label: "Em negociação contratual", deadlineDays: 180, deadlineLabel: "180 dias" },
  { key: "instruments", label: "Aguarda instrumentos técnicos", deadlineDays: 180, deadlineLabel: "180 dias" },
  { key: "contract", label: "Contrato celebrado", deadlineDays: 10, deadlineLabel: "10 dias" },
  { key: "published", label: "Publicado", deadlineDays: 10, deadlineLabel: "10 dias" },
  { key: "alvara", label: "Alvará emitido", deadlineDays: 10, deadlineLabel: "10 dias" },
];

export type ProcessPhaseKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H";

export interface ProcessPhaseDto {
  key: ProcessPhaseKey;
  label: string;
  deadlineLabel: string;
}

/** Fases A–H da tramitação da concessão. */
export const PROCESS_PHASES: ProcessPhaseDto[] = [
  { key: "A", label: "Submissão do requerimento", deadlineLabel: "9 anexos obrigatórios" },
  { key: "B", label: "Apreciação preliminar", deadlineLabel: "5 dias úteis" },
  { key: "C", label: "Emolumentos e vistoria técnica", deadlineLabel: "10 dias úteis" },
  { key: "D", label: "Parecer provincial", deadlineLabel: "10 dias" },
  { key: "E", label: "Análise conjunta IDF/DNF", deadlineLabel: "10 dias úteis" },
  { key: "F", label: "Decisão ministerial", deadlineLabel: "10 dias" },
  { key: "G", label: "Negociação e instrumentos técnicos", deadlineLabel: "180 dias" },
  { key: "H", label: "Celebração, publicação, alvará e activação", deadlineLabel: "5 dias úteis p/ publicação" },
];

/** Fase A — F-08: nove anexos obrigatórios. */
export const PHASE_A_ATTACHMENTS = [
  { key: "social-pact", label: "Pacto social" },
  { key: "tax-registration", label: "Comprovativo de registo fiscal" },
  { key: "law-declaration", label: "Declaração de sujeição às leis" },
  { key: "bank-declaration", label: "Declaração bancária de capacidade financeira" },
  { key: "tax-compliance", label: "Certidão de conformidade tributária" },
  { key: "sketch", label: "Croquis" },
  { key: "descriptive-memory", label: "Memória descritiva" },
  { key: "species-report", label: "Relatório de espécies e produtos" },
  { key: "feasibility-study", label: "Estudo de viabilidade técnico-económica e financeira" },
];

/** Fase G — encargos do Art. 167.º. */
export const PHASE_G_CHARGES = [
  { key: "exploitation-fee", label: "Taxa de exploração" },
  { key: "rent", label: "Renda" },
  { key: "bond", label: "Caução" },
  { key: "bonus", label: "Bónus" },
];

/** Os 8 instrumentos técnicos exigidos à concessão. */
export const TECHNICAL_INSTRUMENTS: TechnicalInstrumentDto[] = [
  { key: "management-plan", label: "Plano de gestão", status: "Em falta", file: null },
  { key: "inventory", label: "Inventário de exploração", status: "Em falta", file: null },
  { key: "exploitation-plan", label: "Plano de exploração", status: "Em falta", file: null },
  { key: "zoning", label: "Zoneamento em blocos", status: "Em falta", file: null },
  { key: "tracks-plan", label: "Plano de picadas/parque", status: "Em falta", file: null },
  { key: "stand-plan", label: "Plano de povoamento/repovoamento", status: "Em falta", file: null },
  { key: "social-addendum", label: "Adenda social", status: "Em falta", file: null },
  { key: "environmental-licence", label: "Licença ambiental", status: "Em falta", file: null },
];
