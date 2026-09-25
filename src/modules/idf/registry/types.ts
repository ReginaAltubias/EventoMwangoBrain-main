/**
 * Tipos dos módulos normativos novos (Registo de Área, Entidades Reconhecidas,
 * Transportadores, Fiscais, Licenciamento independente e matriz de quotas).
 *
 * Tudo isto vive por agora em memória (mock). As interfaces estão desenhadas
 * para ligar directamente a uma API REST mais tarde.
 */

export type LngLat = [number, number];

export interface FileRef {
  fileName: string;
  contentType: string;
  size: number;
  url: string;
}

/* ------------------------------------------------------------ Registo de Área */

export type OverlapVerdict = "Conforme" | "ConformeComReserva" | "NaoConforme";

export interface OverlapLayerResult {
  layer: string;
  verdict: OverlapVerdict;
  note: string;
  overlapHectares: number;
}

export interface AreaRegistryDto {
  id: string;
  code: string;
  designation: string;
  polygon: LngLat[];
  areaHectares: number;
  province: string;
  municipality: string;
  legalSituation: string;
  sketchFile: FileRef | null;
  descriptiveMemoryFile: FileRef | null;
  overlaps: OverlapLayerResult[];
  verdict: OverlapVerdict;
  createdAt: string;
}

/* ------------------------------------------------- Entidades reconhecidas */

export const ENTITY_SCOPES = [
  "Inventário florestal",
  "Plano de gestão",
  "Plano de exploração",
  "Zoneamento",
  "EIA",
  "Estudo faunístico",
  "Estudo apícola",
] as const;

export type EntityScope = (typeof ENTITY_SCOPES)[number];

export type RecognizedEntityStatus = "Activo" | "Suspenso" | "Caducado";

export interface TechnicalStaffDto {
  id: string;
  name: string;
  education: string;
  licenceNumber: string;
  yearsOfExperience: number;
}

export interface RecognizedEntityDto {
  id: string;
  name: string;
  taxIdentificationNumber: string;
  scopes: EntityScope[];
  staff: TechnicalStaffDto[];
  academicCertificates: FileRef | null;
  registryValidUntil: string;
  status: RecognizedEntityStatus;
}

/* -------------------------------------------------- Transportadores e frota */

export type VehicleStatus = "Activo" | "Suspenso" | "Apreendido";
export type VehicleRegime = "Próprio" | "Contratado";

export interface VehicleDto {
  id: string;
  plate: string;
  type: string;
  tareTons: number;
  capacityTons: number;
  regime: VehicleRegime;
  status: VehicleStatus;
}

export interface TransporterDto {
  id: string;
  name: string;
  taxIdentificationNumber: string;
  transportLicenceFile: FileRef | null;
  vehicles: VehicleDto[];
}

/* ------------------------------------------- Fiscais e pontos de custódia */

export type OfficerType = "Fiscal residente" | "Fiscal privativo juramentado" | "Fiscal do IDF";
export type OfficerStatus = "Activo" | "Suspenso" | "Caducado";

export interface FieldOfficerDto {
  id: string;
  name: string;
  type: OfficerType;
  /** Código da concessão de afectação (obrigatório para residente/privativo). */
  concessionCode: string;
  swearingDate: string;
  mobileDevice: string;
  credentialValidUntil: string;
  status: OfficerStatus;
}

/* ------------------------------------------------------------ Licenciamento */

export type StandaloneLicenseKind = "Exploração florestal" | "Lenha, carvão e PFNL" | "Exploração faunística" | "Apícola";

export type StandaloneLicenseStatus =
  | "Rascunho"
  | "Submetido"
  | "Verificação de quota"
  | "Aguarda pagamento"
  | "Emitida"
  | "Activa"
  | "Expirada";

export type ProductDestination = "Mercado interno" | "Transformação própria" | "Transformação de terceiro";

export interface RequestedSpeciesDto {
  id: string;
  speciesCode: string;
  speciesName: string;
  volumeM3: number;
}

export interface StandaloneLicenseDto {
  id: string;
  kind: StandaloneLicenseKind;
  licenseNumber: string;
  applicantId: string;
  applicantName: string;
  campaignYear: number;
  province: string;
  areaRegistryId: string;
  species: RequestedSpeciesDto[];
  destination: ProductDestination;
  processingUnit: string;
  /** Calculados a partir dos dados mock. */
  quotaBalanceM3: number;
  feeAmount: number;
  validUntil: string;
  status: StandaloneLicenseStatus;
}

/* --------------------------------------------------- Matriz de quotas mock */

export interface QuotaMatrixRowDto {
  id: string;
  year: number;
  province: string;
  speciesCode: string;
  speciesName: string;
  product: string;
  totalVolumeM3: number;
  /** Reserva MADANG-EP — até 30% do volume da província. */
  madangReserveM3: number;
  allocatedM3: number;
}

/* ------------------------------------------------- Fiscalização (estados) */

export type EnforcementPhase =
  | "Auto levantado"
  | "Notificado"
  | "Em prazo de defesa"
  | "Em decisão"
  | "Arquivado"
  | "Condenado"
  | "Multa liquidada"
  | "Paga"
  | "Sanado"
  | "Não paga"
  | "Execução";

export interface EnforcementRecordDto {
  id: string;
  code: string;
  operatorId: string;
  operatorName: string;
  openedAt: string;
  subject: string;
  phase: EnforcementPhase;
  /** Recurso hierárquico é um estado paralelo possível após Condenado. */
  underAppeal: boolean;
  fineAmount: number;
}

/* ----------------------------------------- Concessão: fases e instrumentos */

export interface ConcessionSubPhaseDto {
  key: string;
  label: string;
  /** Prazo legal em dias associado à sub-fase. */
  deadlineDays: number;
  deadlineLabel: string;
}

export type InstrumentStatus = "Em falta" | "Submetido" | "Aprovado";

export interface TechnicalInstrumentDto {
  key: string;
  label: string;
  status: InstrumentStatus;
  file: FileRef | null;
}
