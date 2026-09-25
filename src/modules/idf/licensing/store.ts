import { useSyncExternalStore } from "react";
import { registry } from "@/modules/idf/registry/store";
import type {
  ApicultureLicense,
  FaunaSpeciesStatus,
  ForestryLicense,
  LicensingKind,
  LicensingRecord,
  LicensingStatus,
  PfnlLicense,
  SupervenientRevocation,
} from "@/modules/idf/licensing/types";

/** Estado local do módulo Licenciamento — 100% mock, sem chamadas a API. */

const uid = () => Math.random().toString(36).slice(2, 10);
export const newId = uid;

/* ------------------------------------------------------- Dados de referência */

/** Calendário de campanhas publicado (mock). */
export const CAMPAIGN_YEARS = [2025, 2026, 2027];

/** Províncias com suspensão administrativa activa (mock). */
export const SUSPENDED_PROVINCES = ["Cabinda", "Cuando"];

export interface ProcessingUnitRef {
  id: string;
  name: string;
  province: string;
  type: "Serração" | "Unidade de carbonização" | "Fábrica de mobiliário";
}

export const PROCESSING_UNITS: ProcessingUnitRef[] = [
  { id: "UT-01", name: "Serração Kwanza — Sumbe", province: "Cuanza Sul", type: "Serração" },
  { id: "UT-02", name: "Madeirotec — Viana", province: "Luanda", type: "Fábrica de mobiliário" },
  { id: "UT-03", name: "Serração do Moxico — Luena", province: "Moxico", type: "Serração" },
  { id: "UC-01", name: "Unidade de Carbonização do Bié — Camacupa", province: "Bié", type: "Unidade de carbonização" },
  { id: "UC-02", name: "Unidade de Carbonização do Uíge — Songo", province: "Uíge", type: "Unidade de carbonização" },
];

/** Coeficiente de conversão lenha→carvão (m³ de lenha por tonelada de carvão). */
export const FIREWOOD_TO_CHARCOAL_COEFFICIENT = 6.5;

/** Lotes de lenha já licenciada, para carvão com origem rastreável (mock). */
export const LICENSED_FIREWOOD_LOTS = [
  { id: "LN-2026-014", label: "LN-2026-014 · Bié · 320 m³" },
  { id: "LN-2026-021", label: "LN-2026-021 · Uíge · 180 m³" },
];

export const COMMUNES = [
  "Camacupa (Bié)",
  "Chinguar (Bié)",
  "Mussende (Cuanza Sul)",
  "Songo (Uíge)",
  "Luchazes (Moxico)",
  "Muconda (Lunda Sul)",
];

export interface FaunaSpeciesRef {
  code: string;
  name: string;
  status: FaunaSpeciesStatus;
  /** Período de defeso (MM-DD), bloqueante para a espécie. */
  closedSeason: { from: string; to: string } | null;
}

export const FAUNA_SPECIES: FaunaSpeciesRef[] = [
  { code: "FAU-01", name: "Palanca-negra-gigante", status: "Proibida", closedSeason: null },
  { code: "FAU-02", name: "Elefante-africano", status: "Proibida", closedSeason: null },
  { code: "FAU-03", name: "Búfalo-cafre", status: "Condicionada", closedSeason: { from: "11-01", to: "02-28" } },
  { code: "FAU-04", name: "Pacaça", status: "Condicionada", closedSeason: { from: "10-15", to: "01-15" } },
  { code: "FAU-05", name: "Gazela-cinzenta", status: "Livre", closedSeason: null },
  { code: "FAU-06", name: "Franga-do-mato", status: "Livre", closedSeason: null },
];

/** Áreas de conservação ambiental (mock) — usadas para aviso de sobreposição. */
export const CONSERVATION_AREA_KEYWORDS = ["Maiombe", "KAZA", "RAMSAR", "Parque"];

export const SUPPORT_SPECIES = ["Mussivi", "Girassonde", "Pau-ferro", "Eucalipto", "Mulemba"];

/* ------------------------------------------------------------------ Estado */

export interface LicensingState {
  records: LicensingRecord[];
  /** RN-16 — prorrogação geral da campanha (extensão em lote). */
  generalExtension: { active: boolean; extraDays: number };
}

const seed = (): LicensingState => ({
  generalExtension: { active: false, extraDays: 90 },
  records: [
    {
      id: uid(),
      kind: "forestry",
      licenseNumber: "LEF-2026-0001",
      applicantId: "",
      applicantName: "Madeiras do Kwanza, Lda.",
      applicantContact: "+244 923 000 111",
      province: "Cuanza Sul",
      productLabel: "Pau-ferro (toro)",
      quantityLabel: "480 m³",
      feeAmount: 1_440_000,
      paymentConfirmed: true,
      issuedAt: "2026-02-10",
      validUntil: "2026-12-31",
      verificationCode: "IDF·LEF·2026·0001·7QK4-A2LM",
      status: "Activa",
      createdAt: "2026-02-01T09:00:00.000Z",
      campaignYear: 2026,
      areaRegistryId: "",
      species: [{ id: uid(), speciesCode: "PTE", speciesName: "Pau-ferro", volumeM3: 480, treeCount: 96, fellingLimitTrees: 100 }],
      destination: "Transformação própria",
      processingUnitId: "UT-01",
    } satisfies ForestryLicense,
    {
      id: uid(),
      kind: "pfnl",
      licenseNumber: "LCP-2026-0004",
      applicantId: "",
      applicantName: "Associação Comunitária do Cuemba",
      applicantContact: "+244 936 771 220",
      province: "Bié",
      productLabel: "Carvão vegetal",
      quantityLabel: "60 Tonelada",
      feeAmount: 360_000,
      paymentConfirmed: false,
      issuedAt: null,
      validUntil: "2026-08-31",
      verificationCode: null,
      status: "Aguarda pagamento",
      createdAt: "2026-03-04T09:00:00.000Z",
      simplifiedApplicant: true,
      product: "Carvão vegetal",
      quantity: 60,
      unit: "Tonelada",
      locationMode: "commune",
      coordinate: null,
      commune: "Camacupa (Bié)",
      carbonizationUnitId: "UC-01",
      conversionCoefficient: FIREWOOD_TO_CHARCOAL_COEFFICIENT,
      sourceFirewoodLotId: "LN-2026-014",
    } satisfies PfnlLicense,
    {
      id: uid(),
      kind: "apiculture",
      licenseNumber: "LAP-2026-0002",
      applicantId: "",
      applicantName: "Joana Kalunga",
      applicantContact: "+244 927 118 004",
      province: "Uíge",
      productLabel: "Apiário — 40 colmeias",
      quantityLabel: "40 colmeias",
      feeAmount: 200_000,
      paymentConfirmed: true,
      issuedAt: "2026-01-20",
      validUntil: "2026-12-31",
      verificationCode: "IDF·LAP·2026·0002·M31X-B8PC",
      status: "Activa",
      createdAt: "2026-01-12T09:00:00.000Z",
      holderType: "Individual",
      coordinate: { latitude: -7.31, longitude: 15.11 },
      hiveCount: 40,
      hiveType: "Tradicional",
      supportSpecies: ["Mussivi"],
      landRegime: "Área comunitária",
      concessionAuthorizationFile: null,
      production: [{ id: uid(), product: "Mel", quantityKg: 620, year: 2025 }],
      apiaryRegistryNumber: "RAP-UG-2026-0002",
    } satisfies ApicultureLicense,
  ],
});

let state: LicensingState = seed();
const listeners = new Set<() => void>();

const emit = () => {
  state = { ...state };
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useLicensing = (): LicensingState => useSyncExternalStore(subscribe, () => state, () => state);

export const licensing = {
  get: () => state,
  add: (record: LicensingRecord) => {
    state.records = [record, ...state.records];
    emit();
  },
  setStatus: (id: string, status: LicensingStatus) => {
    state.records = state.records.map((r) => (r.id === id ? { ...r, status } : r));
    emit();
  },
  confirmPayment: (id: string) => {
    state.records = state.records.map((r) =>
      r.id === id ? { ...r, paymentConfirmed: true, status: "Aguarda pagamento" as LicensingStatus } : r,
    );
    emit();
  },
  issue: (id: string) => {
    state.records = state.records.map((r) =>
      r.id === id && r.paymentConfirmed
        ? {
            ...r,
            status: "Emitida" as LicensingStatus,
            issuedAt: new Date().toISOString().slice(0, 10),
            verificationCode: verificationCode(r.licenseNumber),
          }
        : r,
    );
    emit();
  },
  updateBasics: (id: string, patch: Partial<Pick<LicensingRecord, "applicantName" | "applicantContact" | "province">>) => {
    state.records = state.records.map((r) => (r.id === id ? { ...r, ...patch } : r));
    emit();
  },
  setRevocation: (id: string, revocation: SupervenientRevocation) => {
    state.records = state.records.map((r) => (r.id === id && r.kind === "fauna" ? { ...r, revocation } : r));
    emit();
  },
  toggleGeneralExtension: (active: boolean) => {
    state.generalExtension = { ...state.generalExtension, active };
    emit();
  },
};

/* ---------------------------------------------------------------- Helpers */

export const verificationCode = (licenseNumber: string) =>
  `IDF·${licenseNumber.replace(/-/g, "·")}·${uid().slice(0, 4).toUpperCase()}-${uid().slice(0, 4).toUpperCase()}`;

export const nextLicenseNumber = (kind: LicensingKind, year: number) => {
  const prefix: Record<LicensingKind, string> = { forestry: "LEF", pfnl: "LCP", fauna: "LEA", apiculture: "LAP" };
  const count = state.records.filter((r) => r.kind === kind).length + 1;
  return `${prefix[kind]}-${year}-${String(count).padStart(4, "0")}`;
};

export const nextApiaryNumber = (province: string, year: number) => {
  const count = state.records.filter((r) => r.kind === "apiculture").length + 1;
  return `RAP-${province.slice(0, 2).toUpperCase()}-${year}-${String(count).padStart(4, "0")}`;
};

/** Saldo de quota mock por província + espécie + ano (matriz nacional). */
export const quotaBalance = (year: number, province: string, speciesCode?: string) =>
  registry
    .get()
    .quotaMatrix.filter(
      (row) =>
        row.year === year &&
        (!province || row.province === province) &&
        (!speciesCode || row.speciesCode === speciesCode),
    )
    .reduce((sum, row) => sum + (row.totalVolumeM3 - row.madangReserveM3 - row.allocatedM3), 0);

/** Saldo específico de lenha/carvão na província (linha própria da matriz). */
export const fuelwoodQuotaBalance = (year: number, province: string) =>
  registry
    .get()
    .quotaMatrix.filter((row) => row.year === year && row.province === province && row.product.includes("Lenha"))
    .reduce((sum, row) => sum + (row.totalVolumeM3 - row.madangReserveM3 - row.allocatedM3), 0);

/** Áreas elegíveis: parecer cadastral Conforme ou Conforme com reserva. */
export const eligibleAreas = (province?: string) =>
  registry
    .get()
    .areas.filter((a) => a.verdict !== "NaoConforme" && (!province || a.province === province));

export const isConservationOverlap = (areaId: string) => {
  const area = registry.get().areas.find((a) => a.id === areaId);
  if (!area) return false;
  return area.overlaps.some((o) => CONSERVATION_AREA_KEYWORDS.some((k) => o.layer.includes(k)) && o.overlapHectares > 0);
};

/** Entidades reconhecidas activas com âmbito "Estudo faunístico". */
export const faunaStudyEntities = () =>
  registry.get().entities.filter((e) => e.status === "Activo" && e.scopes.includes("Estudo faunístico"));

const monthDay = (date: string) => date.slice(5, 10);

/** Verifica se um intervalo cai dentro do defeso de alguma espécie seleccionada. */
export const closedSeasonConflicts = (speciesCodes: string[], from: string, to: string) => {
  if (!from || !to) return [];
  return FAUNA_SPECIES.filter((species) => {
    if (!species.closedSeason || !speciesCodes.includes(species.code)) return false;
    const closedSeason = species.closedSeason;
    if (!closedSeason) return false;
    const inRange = (value: string) => {
      const { from: cf, to: ct } = closedSeason;
      return cf <= ct ? value >= cf && value <= ct : value >= cf || value <= ct;
    };
    return inRange(monthDay(from)) || inRange(monthDay(to));
  });
};

/** Data de validade efectiva, considerando a prorrogação geral (RN-16). */
export const effectiveValidUntil = (record: LicensingRecord) => {
  if (!state.generalExtension.active) return record.validUntil;
  const date = new Date(`${record.validUntil}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + state.generalExtension.extraDays);
  return date.toISOString().slice(0, 10);
};
