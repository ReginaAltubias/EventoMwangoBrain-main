/**
 * Módulo LICENCIAMENTO — via independente de acesso ao direito de exploração
 * florestal (sem concessão plurianual). Não confundir com o módulo "Licenças"
 * (IDF_35), que trata da licença anual de corte dentro de uma concessão activa.
 *
 * Tudo em memória (mock). Interfaces desenhadas para ligar a uma API REST depois.
 */

import type { FileRef, LngLat } from "@/modules/idf/registry/types";

export type LicensingKind = "forestry" | "pfnl" | "fauna" | "apiculture";

export const LICENSING_KINDS: { kind: LicensingKind; label: string; process: string; simplified: boolean }[] = [
  { kind: "forestry", label: "Exploração Florestal", process: "PR-10", simplified: false },
  { kind: "pfnl", label: "Lenha, Carvão e PFNL", process: "PR-11", simplified: true },
  { kind: "fauna", label: "Recursos Faunísticos", process: "PR-12", simplified: false },
  { kind: "apiculture", label: "Apicultura", process: "PR-13", simplified: true },
];

/**
 * Sequência de estados proposta para implementação — a especificação de origem
 * não define máquina de estados própria para este módulo. Mantida simples.
 */
export type LicensingStatus =
  | "Rascunho"
  | "Submetido"
  | "Em verificação de pré-condições"
  | "Aguarda pagamento"
  | "Emitida"
  | "Activa"
  | "Expirada";

export const LICENSING_FLOW: LicensingStatus[] = [
  "Rascunho",
  "Submetido",
  "Em verificação de pré-condições",
  "Aguarda pagamento",
  "Emitida",
  "Activa",
  "Expirada",
];

/** Revogação superveniente — licenças emitidas podem ser revistas por decisão superior. */
export type SupervenientRevocation = "Nenhuma" | "Suspensa" | "Reduzida" | "Exportação proibida";

export interface BaseLicensingRecord {
  id: string;
  kind: LicensingKind;
  licenseNumber: string;
  /** Requerente por operador registado ou identificação simplificada. */
  applicantId: string;
  applicantName: string;
  applicantContact: string;
  province: string;
  /** Produto/tipo principal apresentado na listagem. */
  productLabel: string;
  /** Quantidade autorizada já formatada (ex.: "480 m³"). */
  quantityLabel: string;
  feeAmount: number;
  paymentConfirmed: boolean;
  issuedAt: string | null;
  validUntil: string;
  verificationCode: string | null;
  status: LicensingStatus;
  createdAt: string;
}

/* ------------------------------------------------- PR-10 Exploração florestal */

export type ProductDestinationOption = "Mercado interno" | "Transformação própria" | "Transformação de terceiro";

export interface SpeciesVolumeLine {
  id: string;
  speciesCode: string;
  speciesName: string;
  volumeM3: number;
  /** Quantidade de árvores a abater desta espécie. */
  treeCount: number;
  /** Limite máximo de abate autorizado para a espécie nesta licença (nº de árvores). */
  fellingLimitTrees: number;
}

export interface ForestryLicense extends BaseLicensingRecord {
  kind: "forestry";
  campaignYear: number;
  areaRegistryId: string;
  species: SpeciesVolumeLine[];
  destination: ProductDestinationOption;
  processingUnitId: string;
}

/* -------------------------------------------- PR-11 Lenha, carvão vegetal, PFNL */

export const PFNL_PRODUCTS = [
  "Lenha",
  "Carvão vegetal",
  "Mel silvestre",
  "Resina",
  "Fibra",
  "Planta medicinal",
  "Fruto",
  "Outro",
] as const;
export type PfnlProduct = (typeof PFNL_PRODUCTS)[number];

export const MEASURE_UNITS = ["m³", "Tonelada", "Saco normalizado", "Kg", "Unidade"] as const;
export type MeasureUnit = (typeof MEASURE_UNITS)[number];

export interface PfnlLicense extends BaseLicensingRecord {
  kind: "pfnl";
  /** true = identificação simplificada (nome + contacto, sem NIF). */
  simplifiedApplicant: boolean;
  product: PfnlProduct;
  quantity: number;
  unit: MeasureUnit;
  locationMode: "coordinates" | "commune";
  coordinate: { latitude: number; longitude: number } | null;
  commune: string;
  carbonizationUnitId: string;
  conversionCoefficient: number | null;
  sourceFirewoodLotId: string;
}

/* ------------------------------------------- PR-12 Recursos faunísticos */

export type FaunaSpeciesStatus = "Proibida" | "Condicionada" | "Livre";

export interface FaunaQuantityLine {
  id: string;
  speciesCode: string;
  speciesName: string;
  /** Número de exemplares ou peso, conforme a unidade escolhida. */
  quantity: number;
  unit: "Exemplares" | "Kg";
}

export const CAPTURE_METHODS = ["Captura viva", "Abate selectivo", "Armadilha autorizada", "Rede", "Outro"] as const;
export type CaptureMethod = (typeof CAPTURE_METHODS)[number];

export type FaunaDestination = "Consumo interno" | "Comercialização interna" | "Exportação";

export interface FaunaLicense extends BaseLicensingRecord {
  kind: "fauna";
  faunaSpecies: FaunaQuantityLine[];
  captureMethod: CaptureMethod;
  areaRegistryId: string;
  polygon: LngLat[];
  periodStart: string;
  periodEnd: string;
  destination: FaunaDestination;
  studyFile: FileRef | null;
  /** Entidade reconhecida com âmbito "Estudo faunístico". */
  studyEntityId: string;
  studyEntityNer: string;
  internationalConvention: boolean;
  conventionDetail: string;
  revocation: SupervenientRevocation;
}

/* ------------------------------------------------------ PR-13 Apicultura */

export type ApicultureHolderType = "Individual" | "Cooperativa" | "Empresa";
export const HIVE_TYPES = ["Tradicional", "Langstroth", "Kenyan", "Outra"] as const;
export type HiveType = (typeof HIVE_TYPES)[number];

export const LAND_REGIMES = [
  "Domínio público florestal",
  "Área concedida",
  "Terreno próprio",
  "Área comunitária",
] as const;
export type LandRegime = (typeof LAND_REGIMES)[number];

export const BEE_PRODUCTS = ["Mel", "Cera", "Própolis", "Pólen"] as const;
export type BeeProduct = (typeof BEE_PRODUCTS)[number];

export interface BeeProductionLine {
  id: string;
  product: BeeProduct;
  quantityKg: number;
  year: number;
}

export interface ApicultureLicense extends BaseLicensingRecord {
  kind: "apiculture";
  holderType: ApicultureHolderType;
  coordinate: { latitude: number; longitude: number } | null;
  hiveCount: number;
  hiveType: HiveType;
  supportSpecies: string[];
  landRegime: LandRegime;
  concessionAuthorizationFile: FileRef | null;
  production: BeeProductionLine[];
  apiaryRegistryNumber: string;
}

export type LicensingRecord = ForestryLicense | PfnlLicense | FaunaLicense | ApicultureLicense;
