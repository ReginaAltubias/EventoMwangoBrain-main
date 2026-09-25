import { audit, mockFile, type AuditFields, type LocationDto } from "@/sigaflo/core/types";

/**
 * Fixtures do domínio INCA (café). Apenas leitura — nenhuma chamada de rede.
 * Cadeia: produtor → exploração → parcela → colheita → lote → transformação → embalagem → armazém.
 */

/* ------------------------------------------------------------------ tipos */

export interface CoffeeFarmer extends AuditFields {
  id: string;
  externalId: string;
  registryCode: string;
  coffeeProductionTime: string;
  coffeeActivityRank: string;
  estimatedMonthlyIncome: string;
  profile: {
    fullName: string;
    gender: "Masculino" | "Feminino";
    birthDate: string;
    phone: string;
    hasSpouse: boolean;
    hasChildren: boolean;
    educationLevel: string;
    identification: { type: string; number: string };
    location: LocationDto;
  };
  plantations: Array<{
    landTenureRegime: string;
    isRegistered: boolean;
    totalArea: number;
    coffeeArea: number;
    plantationAge: number;
    density: number;
    surveyDate: string;
    crops: string[];
  }>;
  survey: { koboSubmissionId: string; surveyDate: string; extensionLocationCode: string; signature: boolean };
}

export interface Farm extends AuditFields {
  id: string;
  coffeeFarmerId: string;
  coffeeFarmerName: string;
  code: string;
  name: string;
  area: number;
  workers: number;
  location: LocationDto;
  status: "PendingValidation" | "Validated" | "Rejected";
  plotsTotalArea: number;
  plots: Array<{ id: string; code: string; area: number }>;
  maintenances: Array<{ id: string; type: string; date: string }>;
}

export interface Plot extends AuditFields {
  id: string;
  farmId: string;
  farmName: string;
  coffeeId: string;
  code: string;
  area: number;
  plantingYear: number;
  shadePercentage: number;
  hasIrrigation: boolean;
  areaOverflowJustification?: string;
  harvests: Array<{ date: string; quantity: number; unit: string; qualityScore: number; status: string }>;
}

export interface Maintenance extends AuditFields {
  id: string;
  farmId: string;
  farmName: string;
  type: string;
  date: string;
  productsUsed: string[];
  quantity: number;
  cost: number;
  responsible: string;
}

export interface Harvest extends AuditFields {
  id: string;
  plotId: string;
  plotCode: string;
  farmId: string;
  farmName: string;
  code: string;
  date: string;
  quantity: number;
  unit: string;
  qualityScore: number;
  status: "Planned" | "InProgress" | "Completed" | "Cancelled";
  notes?: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  description: string;
}

export interface CoffeeSpecies {
  id: string;
  scientificName: string;
  commonName: string;
  description: string;
}

export interface CoffeeVariety {
  id: string;
  coffeeSpeciesId: string;
  varietyName: string;
  commonName: string;
  description: string;
  plantSizeId: string;
  maturationId: string;
  pestResistanceId: string;
  droughtResistanceId: string;
  sensoryProfile: string;
}

export interface Coffee {
  id: string;
  name: string;
  description: string;
  coffeeSpeciesId: string;
  coffeeVarietyId: string;
}

export interface TransformationStep {
  id: string;
  phaseName: string;
  featureName: string;
  order: number;
  isRequired: boolean;
  requiresPhoto: boolean;
  requiresReport: boolean;
  startedAt: string | null;
  finishedAt: string | null;
  executedBy: string | null;
  attachments: string[];
}

export interface TransformationHistory {
  action: string;
  oldStatus: string | null;
  newStatus: string;
  description: string;
  performedBy: string;
  performedAt: string;
}

export interface Transformation extends AuditFields {
  id: string;
  code: string;
  lotId: string;
  lotCode: string;
  coffeeId: string;
  transformationTypeId: string;
  transformationTypeVersionId: string;
  transformationTypeName: string;
  versionNumber: number;
  currentStepId: string | null;
  status: "Pendente" | "Em Progresso" | "Concluída" | "Cancelada";
  progress: number;
  startedAt: string | null;
  finishedAt: string | null;
  cancelledAt: string | null;
  responsibleUserId: string;
  notes?: string;
  steps: TransformationStep[];
  history: TransformationHistory[];
  reception?: { receivedWeightKg: number; humidity: number; temperature: number; visualDefectsNotes?: string };
  drying?: { method: "Sol" | "Secador mecânico"; startDate: string; endDate: string; finalHumidity: number };
  classification?: {
    screenSize: string;
    defectsCount: number;
    cuppingScore: number;
    aroma: number;
    acidity: number;
    body: number;
    flavor: number;
    finalGrade: "Especial" | "Superior" | "Corrente" | "Inferior";
  };
}

export interface PackagingType {
  id: string;
  code: string;
  name: string;
  capacityKg: number;
  unit: string;
  description: string;
  material: string;
}

export interface LotPackaging extends AuditFields {
  id: string;
  processingLotId: string;
  processingLotCode: string;
  packagingTypeId: string;
  code: string;
  qrCode: string;
  quantity: number;
  unitWeightKg: number;
  totalWeightKg: number;
  lotNumber: string;
  packagingDate: string;
  status: "Activa" | "Encerrada" | "Cancelada";
  notes?: string;
  packagingType: PackagingType;
}

export interface ProcessingLot extends AuditFields {
  id: string;
  code: string;
  qrCode: string;
  harvestId: string;
  harvestCode: string;
  coffeeId: string;
  coffeeCode: string;
  coffeeName: string;
  speciesName: string;
  varietyName: string;
  producerId: string;
  producerName: string;
  farmId: string;
  farmName: string;
  plotId: string;
  plotCode: string;
  initialQuantity: number;
  quantity: number;
  unit: string;
  humidity: number;
  temperature: number;
  status: "Rascunho" | "Recebido" | "Cancelado" | "Finalizado" | "Em Processamento" | "Consumido" | "Em Embalagem";
  isLocked: boolean;
  packagedWeightKg: number;
  availableWeightKg: number;
  transformationStatus: string;
  lastOperation: string;
  isEligibleForPackaging: boolean;
  transformationIds: string[];
  packageIds: string[];
  history: Array<{ id: string; operation: string; description: string; userId: string; date: string }>;
}

export interface CoffeeWarehouse extends AuditFields {
  id: string;
  code: string;
  name: string;
  description: string;
  location: LocationDto;
  capacityKg: number;
  responsibleId: string;
  responsibleName: string;
  storedWeightKg: number;
  availableCapacityKg: number;
}

export interface WarehouseStorage {
  id: string;
  lotPackagingId: string;
  warehouseId: string;
  quantity: number;
  weightKg: number;
  entryDate: string;
  status: "Em stock" | "Retirado" | "Cancelado";
  temperature?: number;
  humidity?: number;
  warehouseCode: string;
  warehouseName: string;
  lotPackagingCode: string;
}

export interface WarehouseMovement {
  id: string;
  lotPackagingId: string;
  lotPackagingCode: string;
  movementType: "Entrada" | "Transferência" | "Saída" | "Ajuste";
  sourceWarehouseId?: string;
  destinationWarehouseId?: string;
  quantity: number;
  weightKg: number;
  movementDate: string;
  responsibleId: string;
  responsibleName: string;
  destination?: string;
  notes?: string;
}

export interface MarketDataPoint {
  id: string;
  indicatorId: string;
  indicatorCode: string;
  indicatorName: string;
  value: number;
  unitCode: string;
  unitSymbol: string;
  sourceCode: string;
  sourceName: string;
  locationScope: "Local" | "Regional";
  locationCode: string;
  locationName: string;
  referenceDate: string;
  notes?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  code: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  gender: string;
  identification: { type: string; number: string };
  contact: { email: string; phone: string };
  address: { street: string; municipality: string; province: string };
  roleId: string;
  role: Role;
}

/* --------------------------------------------------------------- fixtures */

const loc = (province: string, municipality: string, commune: string, lat: number, lng: number): LocationDto => ({
  province,
  municipality,
  commune,
  latitude: lat,
  longitude: lng,
  altitude: 900,
  accuracy: 5,
});

export const roles: Role[] = [
  { id: "role-1", name: "Extensionista", description: "Recolha de dados no terreno", code: "EXT" },
  { id: "role-2", name: "Técnico de processamento", description: "Gestão de lotes e transformações", code: "TPR" },
  { id: "role-3", name: "Gestor de armazém", description: "Stock e movimentos", code: "ARM" },
];

export const users: UserProfile[] = [
  {
    id: "usr-1",
    fullName: "Ana Kiluanje",
    firstName: "Ana",
    lastName: "Kiluanje",
    birthdate: "1989-04-11",
    gender: "Feminino",
    identification: { type: "BI", number: "003412987LA041" },
    contact: { email: "ana.kiluanje@inca.gov.ao", phone: "+244 923 110 220" },
    address: { street: "Rua do Amboim, 14", municipality: "Sumbe", province: "Cuanza Sul" },
    roleId: "role-1",
    role: roles[0],
  },
  {
    id: "usr-2",
    fullName: "Bento Muhongo",
    firstName: "Bento",
    lastName: "Muhongo",
    birthdate: "1984-09-02",
    gender: "Masculino",
    identification: { type: "BI", number: "001998321UE022" },
    contact: { email: "bento.muhongo@inca.gov.ao", phone: "+244 912 330 441" },
    address: { street: "Bairro Kimbango", municipality: "Uíge", province: "Uíge" },
    roleId: "role-2",
    role: roles[1],
  },
  {
    id: "usr-3",
    fullName: "Cátia Ndala",
    firstName: "Cátia",
    lastName: "Ndala",
    birthdate: "1992-12-19",
    gender: "Feminino",
    identification: { type: "BI", number: "004556210HU019" },
    contact: { email: "catia.ndala@inca.gov.ao", phone: "+244 933 887 001" },
    address: { street: "Av. da Caála, 3", municipality: "Huambo", province: "Huambo" },
    roleId: "role-3",
    role: roles[2],
  },
];

export const coffeeSpecies: CoffeeSpecies[] = [
  {
    id: "esp-rob",
    scientificName: "Coffea canephora",
    commonName: "Robusta",
    description: "Espécie dominante nas zonas baixas do Uíge e Cuanza Sul.",
  },
  {
    id: "esp-ara",
    scientificName: "Coffea arabica",
    commonName: "Arábica",
    description: "Cultivada nas terras altas do Huambo e Huíla.",
  },
];

export const plantSizes: CatalogItem[] = [
  { id: "ps-1", name: "Porte baixo", description: "Até 2 metros" },
  { id: "ps-2", name: "Porte médio", description: "2 a 3 metros" },
  { id: "ps-3", name: "Porte alto", description: "Mais de 3 metros" },
];

export const maturations: CatalogItem[] = [
  { id: "mt-1", name: "Precoce", description: "Maturação antecipada" },
  { id: "mt-2", name: "Média", description: "Maturação intermédia" },
  { id: "mt-3", name: "Tardia", description: "Maturação tardia" },
];

export const resistanceLevels: CatalogItem[] = [
  { id: "rs-1", name: "Baixa", description: "Pouca resistência" },
  { id: "rs-2", name: "Média", description: "Resistência intermédia" },
  { id: "rs-3", name: "Alta", description: "Boa resistência" },
];

export const coffeeVarieties: CoffeeVariety[] = [
  {
    id: "var-1",
    coffeeSpeciesId: "esp-rob",
    varietyName: "Ambriz 1",
    commonName: "Ambriz",
    description: "Variedade tradicional angolana de robusta.",
    plantSizeId: "ps-3",
    maturationId: "mt-2",
    pestResistanceId: "rs-3",
    droughtResistanceId: "rs-2",
    sensoryProfile: "Corpo intenso, notas de cacau",
  },
  {
    id: "var-2",
    coffeeSpeciesId: "esp-rob",
    varietyName: "Kwilu 7",
    commonName: "Kwilu",
    description: "Robusta de produtividade elevada.",
    plantSizeId: "ps-2",
    maturationId: "mt-1",
    pestResistanceId: "rs-2",
    droughtResistanceId: "rs-3",
    sensoryProfile: "Amargo suave, notas de noz",
  },
  {
    id: "var-3",
    coffeeSpeciesId: "esp-ara",
    varietyName: "Catuaí Vermelho",
    commonName: "Catuaí",
    description: "Arábica de porte baixo para terras altas.",
    plantSizeId: "ps-1",
    maturationId: "mt-2",
    pestResistanceId: "rs-2",
    droughtResistanceId: "rs-1",
    sensoryProfile: "Acidez cítrica, aroma floral",
  },
  {
    id: "var-4",
    coffeeSpeciesId: "esp-ara",
    varietyName: "Caturra Amarelo",
    commonName: "Caturra",
    description: "Arábica adaptada ao planalto central.",
    plantSizeId: "ps-1",
    maturationId: "mt-3",
    pestResistanceId: "rs-1",
    droughtResistanceId: "rs-2",
    sensoryProfile: "Doçura acentuada, corpo médio",
  },
];

export const coffees: Coffee[] = [
  {
    id: "caf-1",
    name: "Robusta Ambriz — Amboim",
    description: "Café robusta do Amboim, sombreado.",
    coffeeSpeciesId: "esp-rob",
    coffeeVarietyId: "var-1",
  },
  {
    id: "caf-2",
    name: "Robusta Kwilu — Negage",
    description: "Robusta de produção intensiva no Uíge.",
    coffeeSpeciesId: "esp-rob",
    coffeeVarietyId: "var-2",
  },
  {
    id: "caf-3",
    name: "Arábica Catuaí — Caála",
    description: "Arábica de altitude do Huambo.",
    coffeeSpeciesId: "esp-ara",
    coffeeVarietyId: "var-3",
  },
  {
    id: "caf-4",
    name: "Arábica Caturra — Ganda",
    description: "Arábica da Ganda, colheita tardia.",
    coffeeSpeciesId: "esp-ara",
    coffeeVarietyId: "var-4",
  },
];

export const extensionLocations = [
  { code: "EXT-CS-AMB", location: loc("Cuanza Sul", "Amboim", "Gabela", -10.8, 14.35) },
  { code: "EXT-UI-NEG", location: loc("Uíge", "Negage", "Negage", -7.76, 15.27) },
  { code: "EXT-HU-CAA", location: loc("Huambo", "Caála", "Caála", -12.85, 15.56) },
  { code: "EXT-BE-GAN", location: loc("Benguela", "Ganda", "Ganda", -13.02, 14.66) },
];

export const farmers: CoffeeFarmer[] = [
  {
    ...audit(),
    id: "prd-1",
    externalId: "KOBO-88213",
    registryCode: "INCA-CS-0001",
    coffeeProductionTime: "12 anos",
    coffeeActivityRank: "Principal",
    estimatedMonthlyIncome: "180.000 AOA",
    profile: {
      fullName: "Joaquim Bengui",
      gender: "Masculino",
      birthDate: "1972-06-14",
      phone: "+244 923 445 118",
      hasSpouse: true,
      hasChildren: true,
      educationLevel: "Ensino secundário",
      identification: { type: "BI", number: "001223554CS033" },
      location: loc("Cuanza Sul", "Amboim", "Gabela", -10.802, 14.351),
    },
    plantations: [
      {
        landTenureRegime: "Direito consuetudinário",
        isRegistered: true,
        totalArea: 8.5,
        coffeeArea: 6.2,
        plantationAge: 14,
        density: 1100,
        surveyDate: "2025-08-14",
        crops: ["Café", "Banana", "Mandioca"],
      },
    ],
    survey: { koboSubmissionId: "KOBO-88213", surveyDate: "2025-08-14", extensionLocationCode: "EXT-CS-AMB", signature: true },
  },
  {
    ...audit(),
    id: "prd-2",
    externalId: "KOBO-88571",
    registryCode: "INCA-UI-0007",
    coffeeProductionTime: "22 anos",
    coffeeActivityRank: "Principal",
    estimatedMonthlyIncome: "320.000 AOA",
    profile: {
      fullName: "Esperança Zulumongo",
      gender: "Feminino",
      birthDate: "1966-02-27",
      phone: "+244 912 776 220",
      hasSpouse: false,
      hasChildren: true,
      educationLevel: "Ensino primário",
      identification: { type: "BI", number: "000887321UE011" },
      location: loc("Uíge", "Negage", "Negage", -7.762, 15.272),
    },
    plantations: [
      {
        landTenureRegime: "Título de propriedade",
        isRegistered: true,
        totalArea: 22,
        coffeeArea: 17.4,
        plantationAge: 25,
        density: 1250,
        surveyDate: "2025-09-02",
        crops: ["Café", "Feijão"],
      },
    ],
    survey: { koboSubmissionId: "KOBO-88571", surveyDate: "2025-09-02", extensionLocationCode: "EXT-UI-NEG", signature: true },
  },
  {
    ...audit(),
    id: "prd-3",
    externalId: "KOBO-89004",
    registryCode: "INCA-HU-0012",
    coffeeProductionTime: "6 anos",
    coffeeActivityRank: "Secundária",
    estimatedMonthlyIncome: "95.000 AOA",
    profile: {
      fullName: "Domingos Chissende",
      gender: "Masculino",
      birthDate: "1988-11-05",
      phone: "+244 933 004 771",
      hasSpouse: true,
      hasChildren: false,
      educationLevel: "Ensino médio agrário",
      identification: { type: "BI", number: "004112998HU027" },
      location: loc("Huambo", "Caála", "Calenga", -12.854, 15.561),
    },
    plantations: [
      {
        landTenureRegime: "Arrendamento",
        isRegistered: false,
        totalArea: 5,
        coffeeArea: 3.4,
        plantationAge: 6,
        density: 980,
        surveyDate: "2025-07-21",
        crops: ["Café", "Milho"],
      },
    ],
    survey: { koboSubmissionId: "KOBO-89004", surveyDate: "2025-07-21", extensionLocationCode: "EXT-HU-CAA", signature: false },
  },
  {
    ...audit({ isActive: false }),
    id: "prd-4",
    externalId: "KOBO-89230",
    registryCode: "INCA-BE-0003",
    coffeeProductionTime: "9 anos",
    coffeeActivityRank: "Secundária",
    estimatedMonthlyIncome: "120.000 AOA",
    profile: {
      fullName: "Teresa Kalunga",
      gender: "Feminino",
      birthDate: "1979-03-30",
      phone: "+244 924 551 908",
      hasSpouse: true,
      hasChildren: true,
      educationLevel: "Ensino primário",
      identification: { type: "BI", number: "002774110BG015" },
      location: loc("Benguela", "Ganda", "Ganda", -13.021, 14.663),
    },
    plantations: [
      {
        landTenureRegime: "Direito consuetudinário",
        isRegistered: false,
        totalArea: 4.2,
        coffeeArea: 2.6,
        plantationAge: 9,
        density: 890,
        surveyDate: "2025-06-11",
        crops: ["Café", "Batata-doce"],
      },
    ],
    survey: { koboSubmissionId: "KOBO-89230", surveyDate: "2025-06-11", extensionLocationCode: "EXT-BE-GAN", signature: true },
  },
];

export const farms: Farm[] = [
  {
    ...audit(),
    id: "frm-1",
    coffeeFarmerId: "prd-1",
    coffeeFarmerName: "Joaquim Bengui",
    code: "FZ-CS-001",
    name: "Fazenda Kissanga",
    area: 8.5,
    workers: 12,
    location: loc("Cuanza Sul", "Amboim", "Gabela", -10.806, 14.348),
    status: "Validated",
    plotsTotalArea: 6.2,
    plots: [
      { id: "plt-1", code: "PAR-001", area: 3.4 },
      { id: "plt-2", code: "PAR-002", area: 2.8 },
    ],
    maintenances: [
      { id: "mnt-1", type: "Poda de formação", date: "2026-02-10" },
      { id: "mnt-2", type: "Adubação orgânica", date: "2026-03-18" },
    ],
  },
  {
    ...audit(),
    id: "frm-2",
    coffeeFarmerId: "prd-2",
    coffeeFarmerName: "Esperança Zulumongo",
    code: "FZ-UI-014",
    name: "Fazenda Kimbango",
    area: 22,
    workers: 31,
    location: loc("Uíge", "Negage", "Negage", -7.769, 15.279),
    status: "Validated",
    plotsTotalArea: 17.4,
    plots: [
      { id: "plt-3", code: "PAR-011", area: 9.2 },
      { id: "plt-4", code: "PAR-012", area: 8.2 },
    ],
    maintenances: [{ id: "mnt-3", type: "Controlo de pragas", date: "2026-01-25" }],
  },
  {
    ...audit(),
    id: "frm-3",
    coffeeFarmerId: "prd-3",
    coffeeFarmerName: "Domingos Chissende",
    code: "FZ-HU-032",
    name: "Fazenda Calenga",
    area: 5,
    workers: 6,
    location: loc("Huambo", "Caála", "Calenga", -12.861, 15.567),
    status: "PendingValidation",
    plotsTotalArea: 3.4,
    plots: [{ id: "plt-5", code: "PAR-021", area: 3.4 }],
    maintenances: [{ id: "mnt-4", type: "Limpeza de entrelinhas", date: "2026-04-02" }],
  },
  {
    ...audit({ isActive: false }),
    id: "frm-4",
    coffeeFarmerId: "prd-4",
    coffeeFarmerName: "Teresa Kalunga",
    code: "FZ-BE-008",
    name: "Fazenda Ganda Velha",
    area: 4.2,
    workers: 4,
    location: loc("Benguela", "Ganda", "Ganda", -13.028, 14.669),
    status: "Rejected",
    plotsTotalArea: 2.6,
    plots: [{ id: "plt-6", code: "PAR-031", area: 2.6 }],
    maintenances: [],
  },
];

export const plots: Plot[] = [
  {
    ...audit(),
    id: "plt-1",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    coffeeId: "caf-1",
    code: "PAR-001",
    area: 3.4,
    plantingYear: 2012,
    shadePercentage: 45,
    hasIrrigation: false,
    harvests: [{ date: "2026-05-12", quantity: 4200, unit: "kg", qualityScore: 84, status: "Completed" }],
  },
  {
    ...audit(),
    id: "plt-2",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    coffeeId: "caf-1",
    code: "PAR-002",
    area: 2.8,
    plantingYear: 2015,
    shadePercentage: 30,
    hasIrrigation: true,
    harvests: [{ date: "2026-05-20", quantity: 3100, unit: "kg", qualityScore: 81, status: "Completed" }],
  },
  {
    ...audit(),
    id: "plt-3",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    coffeeId: "caf-2",
    code: "PAR-011",
    area: 9.2,
    plantingYear: 2001,
    shadePercentage: 55,
    hasIrrigation: false,
    harvests: [{ date: "2026-06-01", quantity: 9800, unit: "kg", qualityScore: 79, status: "Completed" }],
  },
  {
    ...audit(),
    id: "plt-4",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    coffeeId: "caf-2",
    code: "PAR-012",
    area: 8.2,
    plantingYear: 2004,
    shadePercentage: 50,
    hasIrrigation: false,
    areaOverflowJustification: "Parcela repartida após levantamento GPS de 2025.",
    harvests: [{ date: "2026-06-14", quantity: 7600, unit: "kg", qualityScore: 82, status: "InProgress" }],
  },
  {
    ...audit(),
    id: "plt-5",
    farmId: "frm-3",
    farmName: "Fazenda Calenga",
    coffeeId: "caf-3",
    code: "PAR-021",
    area: 3.4,
    plantingYear: 2019,
    shadePercentage: 20,
    hasIrrigation: true,
    harvests: [{ date: "2026-06-22", quantity: 2400, unit: "kg", qualityScore: 88, status: "Planned" }],
  },
  {
    ...audit({ isActive: false }),
    id: "plt-6",
    farmId: "frm-4",
    farmName: "Fazenda Ganda Velha",
    coffeeId: "caf-4",
    code: "PAR-031",
    area: 2.6,
    plantingYear: 2016,
    shadePercentage: 15,
    hasIrrigation: false,
    harvests: [{ date: "2026-05-30", quantity: 1500, unit: "kg", qualityScore: 74, status: "Cancelled" }],
  },
];

export const maintenances: Maintenance[] = [
  {
    ...audit(),
    id: "mnt-1",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    type: "Poda de formação",
    date: "2026-02-10",
    productsUsed: ["Tesoura de poda"],
    quantity: 3.4,
    cost: 45000,
    responsible: "Ana Kiluanje",
  },
  {
    ...audit(),
    id: "mnt-2",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    type: "Adubação orgânica",
    date: "2026-03-18",
    productsUsed: ["Estrume curtido", "Calcário"],
    quantity: 1200,
    cost: 180000,
    responsible: "Ana Kiluanje",
  },
  {
    ...audit(),
    id: "mnt-3",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    type: "Controlo de pragas",
    date: "2026-01-25",
    productsUsed: ["Fungicida cúprico"],
    quantity: 60,
    cost: 260000,
    responsible: "Bento Muhongo",
  },
  {
    ...audit(),
    id: "mnt-4",
    farmId: "frm-3",
    farmName: "Fazenda Calenga",
    type: "Limpeza de entrelinhas",
    date: "2026-04-02",
    productsUsed: ["Roçadora"],
    quantity: 3.4,
    cost: 38000,
    responsible: "Cátia Ndala",
  },
];

export const harvests: Harvest[] = [
  {
    ...audit(),
    id: "hrv-1",
    plotId: "plt-1",
    plotCode: "PAR-001",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    code: "COL-2026-001",
    date: "2026-05-12",
    quantity: 4200,
    unit: "kg",
    qualityScore: 84,
    status: "Completed",
    notes: "Colheita selectiva de cerejas maduras.",
  },
  {
    ...audit(),
    id: "hrv-2",
    plotId: "plt-2",
    plotCode: "PAR-002",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    code: "COL-2026-002",
    date: "2026-05-20",
    quantity: 3100,
    unit: "kg",
    qualityScore: 81,
    status: "Completed",
  },
  {
    ...audit(),
    id: "hrv-3",
    plotId: "plt-3",
    plotCode: "PAR-011",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    code: "COL-2026-011",
    date: "2026-06-01",
    quantity: 9800,
    unit: "kg",
    qualityScore: 79,
    status: "Completed",
  },
  {
    ...audit(),
    id: "hrv-4",
    plotId: "plt-4",
    plotCode: "PAR-012",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    code: "COL-2026-012",
    date: "2026-06-14",
    quantity: 7600,
    unit: "kg",
    qualityScore: 82,
    status: "InProgress",
  },
  {
    ...audit(),
    id: "hrv-5",
    plotId: "plt-5",
    plotCode: "PAR-021",
    farmId: "frm-3",
    farmName: "Fazenda Calenga",
    code: "COL-2026-021",
    date: "2026-06-22",
    quantity: 2400,
    unit: "kg",
    qualityScore: 88,
    status: "Planned",
  },
  {
    ...audit({ isActive: false }),
    id: "hrv-6",
    plotId: "plt-6",
    plotCode: "PAR-031",
    farmId: "frm-4",
    farmName: "Fazenda Ganda Velha",
    code: "COL-2026-031",
    date: "2026-05-30",
    quantity: 1500,
    unit: "kg",
    qualityScore: 74,
    status: "Cancelled",
    notes: "Cancelada por não conformidade documental.",
  },
];

export const packagingTypes: PackagingType[] = [
  {
    id: "emb-1",
    code: "SAC60",
    name: "Saca de juta 60 kg",
    capacityKg: 60,
    unit: "saca",
    description: "Saca padrão de exportação",
    material: "Juta",
  },
  {
    id: "emb-2",
    code: "BIG500",
    name: "Big bag 500 kg",
    capacityKg: 500,
    unit: "big bag",
    description: "Embalagem a granel",
    material: "Polipropileno",
  },
];

const step = (
  id: string,
  phaseName: string,
  featureName: string,
  order: number,
  done: boolean,
  executedBy: string,
): TransformationStep => ({
  id,
  phaseName,
  featureName,
  order,
  isRequired: true,
  requiresPhoto: order === 1,
  requiresReport: featureName === "Boletim de classificação",
  startedAt: done ? "2026-06-02T07:00:00.000Z" : null,
  finishedAt: done ? "2026-06-04T15:00:00.000Z" : null,
  executedBy: done ? executedBy : null,
  attachments: done ? [mockFile(`${id}-registo.pdf`).url] : [],
});

export const transformations: Transformation[] = [
  {
    ...audit(),
    id: "trf-1",
    code: "TRF-2026-001",
    lotId: "lot-1",
    lotCode: "LOTE-2026-001",
    coffeeId: "caf-1",
    transformationTypeId: "tt-1",
    transformationTypeVersionId: "ttv-1",
    transformationTypeName: "Via húmida",
    versionNumber: 2,
    currentStepId: null,
    status: "Concluída",
    progress: 100,
    startedAt: "2026-05-14T06:00:00.000Z",
    finishedAt: "2026-06-05T16:00:00.000Z",
    cancelledAt: null,
    responsibleUserId: "usr-2",
    notes: "Lote com boa uniformidade de secagem.",
    steps: [
      step("stp-1", "Recepção", "Recepção de cerejas", 1, true, "Bento Muhongo"),
      step("stp-2", "Secagem", "Secagem", 2, true, "Bento Muhongo"),
      step("stp-3", "Classificação", "Boletim de classificação", 3, true, "Cátia Ndala"),
    ],
    history: [
      {
        action: "Início",
        oldStatus: null,
        newStatus: "Em Progresso",
        description: "Transformação iniciada",
        performedBy: "Bento Muhongo",
        performedAt: "2026-05-14T06:00:00.000Z",
      },
      {
        action: "Conclusão",
        oldStatus: "Em Progresso",
        newStatus: "Concluída",
        description: "Boletim de classificação emitido",
        performedBy: "Cátia Ndala",
        performedAt: "2026-06-05T16:00:00.000Z",
      },
    ],
    reception: { receivedWeightKg: 4200, humidity: 54, temperature: 24, visualDefectsNotes: "2% de cerejas verdes" },
    drying: { method: "Sol", startDate: "2026-05-16", endDate: "2026-05-30", finalHumidity: 11.4 },
    classification: {
      screenSize: "16/18",
      defectsCount: 7,
      cuppingScore: 84.5,
      aroma: 8,
      acidity: 7.5,
      body: 8.5,
      flavor: 8,
      finalGrade: "Superior",
    },
  },
  {
    ...audit(),
    id: "trf-2",
    code: "TRF-2026-011",
    lotId: "lot-2",
    lotCode: "LOTE-2026-011",
    coffeeId: "caf-2",
    transformationTypeId: "tt-2",
    transformationTypeVersionId: "ttv-2",
    transformationTypeName: "Via seca",
    versionNumber: 1,
    currentStepId: "stp-6",
    status: "Em Progresso",
    progress: 60,
    startedAt: "2026-06-03T06:30:00.000Z",
    finishedAt: null,
    cancelledAt: null,
    responsibleUserId: "usr-2",
    steps: [
      step("stp-4", "Recepção", "Recepção de cerejas", 1, true, "Bento Muhongo"),
      step("stp-5", "Secagem", "Secagem", 2, true, "Bento Muhongo"),
      step("stp-6", "Classificação", "Boletim de classificação", 3, false, "Cátia Ndala"),
    ],
    history: [
      {
        action: "Início",
        oldStatus: null,
        newStatus: "Em Progresso",
        description: "Transformação iniciada",
        performedBy: "Bento Muhongo",
        performedAt: "2026-06-03T06:30:00.000Z",
      },
    ],
    reception: { receivedWeightKg: 9800, humidity: 57, temperature: 26 },
    drying: { method: "Secador mecânico", startDate: "2026-06-05", endDate: "2026-06-12", finalHumidity: 12 },
  },
  {
    ...audit(),
    id: "trf-3",
    code: "TRF-2026-021",
    lotId: "lot-3",
    lotCode: "LOTE-2026-021",
    coffeeId: "caf-3",
    transformationTypeId: "tt-1",
    transformationTypeVersionId: "ttv-1",
    transformationTypeName: "Via húmida",
    versionNumber: 2,
    currentStepId: "stp-7",
    status: "Pendente",
    progress: 0,
    startedAt: null,
    finishedAt: null,
    cancelledAt: null,
    responsibleUserId: "usr-3",
    steps: [step("stp-7", "Recepção", "Recepção de cerejas", 1, false, "Cátia Ndala")],
    history: [],
  },
];

export const lotPackagings: LotPackaging[] = [
  {
    ...audit(),
    id: "pkg-1",
    processingLotId: "lot-1",
    processingLotCode: "LOTE-2026-001",
    packagingTypeId: "emb-1",
    code: "EMB-2026-0001",
    qrCode: "QR-EMB-2026-0001",
    quantity: 30,
    unitWeightKg: 60,
    totalWeightKg: 1800,
    lotNumber: "L-2026-001-A",
    packagingDate: "2026-06-08",
    status: "Activa",
    packagingType: packagingTypes[0],
  },
  {
    ...audit(),
    id: "pkg-2",
    processingLotId: "lot-1",
    processingLotCode: "LOTE-2026-001",
    packagingTypeId: "emb-2",
    code: "EMB-2026-0002",
    qrCode: "QR-EMB-2026-0002",
    quantity: 2,
    unitWeightKg: 500,
    totalWeightKg: 1000,
    lotNumber: "L-2026-001-B",
    packagingDate: "2026-06-09",
    status: "Activa",
    packagingType: packagingTypes[1],
  },
  {
    ...audit(),
    id: "pkg-3",
    processingLotId: "lot-2",
    processingLotCode: "LOTE-2026-011",
    packagingTypeId: "emb-1",
    code: "EMB-2026-0011",
    qrCode: "QR-EMB-2026-0011",
    quantity: 40,
    unitWeightKg: 60,
    totalWeightKg: 2400,
    lotNumber: "L-2026-011-A",
    packagingDate: "2026-06-16",
    status: "Activa",
    packagingType: packagingTypes[0],
  },
  {
    ...audit({ isActive: false }),
    id: "pkg-4",
    processingLotId: "lot-2",
    processingLotCode: "LOTE-2026-011",
    packagingTypeId: "emb-1",
    code: "EMB-2026-0012",
    qrCode: "QR-EMB-2026-0012",
    quantity: 10,
    unitWeightKg: 60,
    totalWeightKg: 600,
    lotNumber: "L-2026-011-B",
    packagingDate: "2026-06-17",
    status: "Cancelada",
    notes: "Anulada por erro de pesagem.",
    packagingType: packagingTypes[0],
  },
];

export const processingLots: ProcessingLot[] = [
  {
    ...audit(),
    id: "lot-1",
    code: "LOTE-2026-001",
    qrCode: "QR-LOTE-2026-001",
    harvestId: "hrv-1",
    harvestCode: "COL-2026-001",
    coffeeId: "caf-1",
    coffeeCode: "CAF-001",
    coffeeName: "Robusta Ambriz — Amboim",
    speciesName: "Robusta",
    varietyName: "Ambriz 1",
    producerId: "prd-1",
    producerName: "Joaquim Bengui",
    farmId: "frm-1",
    farmName: "Fazenda Kissanga",
    plotId: "plt-1",
    plotCode: "PAR-001",
    initialQuantity: 4200,
    quantity: 3400,
    unit: "kg",
    humidity: 11.4,
    temperature: 22,
    status: "Finalizado",
    isLocked: true,
    packagedWeightKg: 2800,
    availableWeightKg: 600,
    transformationStatus: "Concluída",
    lastOperation: "Embalagem",
    isEligibleForPackaging: true,
    transformationIds: ["trf-1"],
    packageIds: ["pkg-1", "pkg-2"],
    history: [
      { id: "h1", operation: "Recepção", description: "Lote recebido do produtor", userId: "usr-2", date: "2026-05-14" },
      { id: "h2", operation: "Transformação", description: "Via húmida concluída", userId: "usr-2", date: "2026-06-05" },
      { id: "h3", operation: "Embalagem", description: "30 sacas + 2 big bags", userId: "usr-3", date: "2026-06-09" },
    ],
  },
  {
    ...audit(),
    id: "lot-2",
    code: "LOTE-2026-011",
    qrCode: "QR-LOTE-2026-011",
    harvestId: "hrv-3",
    harvestCode: "COL-2026-011",
    coffeeId: "caf-2",
    coffeeCode: "CAF-002",
    coffeeName: "Robusta Kwilu — Negage",
    speciesName: "Robusta",
    varietyName: "Kwilu 7",
    producerId: "prd-2",
    producerName: "Esperança Zulumongo",
    farmId: "frm-2",
    farmName: "Fazenda Kimbango",
    plotId: "plt-3",
    plotCode: "PAR-011",
    initialQuantity: 9800,
    quantity: 8100,
    unit: "kg",
    humidity: 12,
    temperature: 24,
    status: "Em Embalagem",
    isLocked: false,
    packagedWeightKg: 2400,
    availableWeightKg: 5700,
    transformationStatus: "Em Progresso",
    lastOperation: "Embalagem parcial",
    isEligibleForPackaging: true,
    transformationIds: ["trf-2"],
    packageIds: ["pkg-3", "pkg-4"],
    history: [
      { id: "h4", operation: "Recepção", description: "Lote recebido", userId: "usr-2", date: "2026-06-03" },
      { id: "h5", operation: "Embalagem", description: "40 sacas embaladas", userId: "usr-3", date: "2026-06-16" },
    ],
  },
  {
    ...audit(),
    id: "lot-3",
    code: "LOTE-2026-021",
    qrCode: "QR-LOTE-2026-021",
    harvestId: "hrv-5",
    harvestCode: "COL-2026-021",
    coffeeId: "caf-3",
    coffeeCode: "CAF-003",
    coffeeName: "Arábica Catuaí — Caála",
    speciesName: "Arábica",
    varietyName: "Catuaí Vermelho",
    producerId: "prd-3",
    producerName: "Domingos Chissende",
    farmId: "frm-3",
    farmName: "Fazenda Calenga",
    plotId: "plt-5",
    plotCode: "PAR-021",
    initialQuantity: 2400,
    quantity: 2400,
    unit: "kg",
    humidity: 14,
    temperature: 20,
    status: "Recebido",
    isLocked: false,
    packagedWeightKg: 0,
    availableWeightKg: 2400,
    transformationStatus: "Pendente",
    lastOperation: "Recepção",
    isEligibleForPackaging: false,
    transformationIds: ["trf-3"],
    packageIds: [],
    history: [{ id: "h6", operation: "Recepção", description: "Lote recebido", userId: "usr-3", date: "2026-06-23" }],
  },
];

export const coffeeWarehouses: CoffeeWarehouse[] = [
  {
    ...audit(),
    id: "arm-1",
    code: "ARM-GAB-01",
    name: "Armazém da Gabela",
    description: "Armazém regional do Amboim",
    location: loc("Cuanza Sul", "Amboim", "Gabela", -10.845, 14.375),
    capacityKg: 250000,
    responsibleId: "usr-3",
    responsibleName: "Cátia Ndala",
    storedWeightKg: 2800,
    availableCapacityKg: 247200,
  },
  {
    ...audit(),
    id: "arm-2",
    code: "ARM-UIG-02",
    name: "Armazém do Uíge",
    description: "Recepção e expedição do Uíge",
    location: loc("Uíge", "Uíge", "Uíge", -7.611, 15.061),
    capacityKg: 400000,
    responsibleId: "usr-2",
    responsibleName: "Bento Muhongo",
    storedWeightKg: 2400,
    availableCapacityKg: 397600,
  },
];

export const warehouseStorages: WarehouseStorage[] = [
  {
    id: "stk-1",
    lotPackagingId: "pkg-1",
    warehouseId: "arm-1",
    quantity: 30,
    weightKg: 1800,
    entryDate: "2026-06-10",
    status: "Em stock",
    temperature: 21,
    humidity: 58,
    warehouseCode: "ARM-GAB-01",
    warehouseName: "Armazém da Gabela",
    lotPackagingCode: "EMB-2026-0001",
  },
  {
    id: "stk-2",
    lotPackagingId: "pkg-2",
    warehouseId: "arm-1",
    quantity: 2,
    weightKg: 1000,
    entryDate: "2026-06-10",
    status: "Em stock",
    temperature: 21,
    humidity: 58,
    warehouseCode: "ARM-GAB-01",
    warehouseName: "Armazém da Gabela",
    lotPackagingCode: "EMB-2026-0002",
  },
  {
    id: "stk-3",
    lotPackagingId: "pkg-3",
    warehouseId: "arm-2",
    quantity: 40,
    weightKg: 2400,
    entryDate: "2026-06-18",
    status: "Em stock",
    temperature: 23,
    humidity: 60,
    warehouseCode: "ARM-UIG-02",
    warehouseName: "Armazém do Uíge",
    lotPackagingCode: "EMB-2026-0011",
  },
];

export const warehouseMovements: WarehouseMovement[] = [
  {
    id: "mov-1",
    lotPackagingId: "pkg-1",
    lotPackagingCode: "EMB-2026-0001",
    movementType: "Entrada",
    destinationWarehouseId: "arm-1",
    quantity: 30,
    weightKg: 1800,
    movementDate: "2026-06-10",
    responsibleId: "usr-3",
    responsibleName: "Cátia Ndala",
  },
  {
    id: "mov-2",
    lotPackagingId: "pkg-2",
    lotPackagingCode: "EMB-2026-0002",
    movementType: "Entrada",
    destinationWarehouseId: "arm-1",
    quantity: 2,
    weightKg: 1000,
    movementDate: "2026-06-10",
    responsibleId: "usr-3",
    responsibleName: "Cátia Ndala",
  },
  {
    id: "mov-3",
    lotPackagingId: "pkg-3",
    lotPackagingCode: "EMB-2026-0011",
    movementType: "Entrada",
    destinationWarehouseId: "arm-2",
    quantity: 40,
    weightKg: 2400,
    movementDate: "2026-06-18",
    responsibleId: "usr-2",
    responsibleName: "Bento Muhongo",
  },
  {
    id: "mov-4",
    lotPackagingId: "pkg-1",
    lotPackagingCode: "EMB-2026-0001",
    movementType: "Transferência",
    sourceWarehouseId: "arm-1",
    destinationWarehouseId: "arm-2",
    quantity: 5,
    weightKg: 300,
    movementDate: "2026-06-25",
    responsibleId: "usr-3",
    responsibleName: "Cátia Ndala",
    destination: "Armazém do Uíge",
    notes: "Amostra para prova de chávena.",
  },
];

export const marketData: MarketDataPoint[] = [
  {
    id: "mkt-1",
    indicatorId: "ind-1",
    indicatorCode: "PRC-ROB",
    indicatorName: "Preço do robusta ao produtor",
    value: 2450,
    unitCode: "AOA_KG",
    unitSymbol: "AOA/kg",
    sourceCode: "INCA",
    sourceName: "Rede de extensão INCA",
    locationScope: "Local",
    locationCode: "CS-AMB",
    locationName: "Amboim",
    referenceDate: "2026-06-01",
  },
  {
    id: "mkt-2",
    indicatorId: "ind-1",
    indicatorCode: "PRC-ROB",
    indicatorName: "Preço do robusta ao produtor",
    value: 2600,
    unitCode: "AOA_KG",
    unitSymbol: "AOA/kg",
    sourceCode: "INCA",
    sourceName: "Rede de extensão INCA",
    locationScope: "Local",
    locationCode: "UI-NEG",
    locationName: "Negage",
    referenceDate: "2026-06-01",
  },
  {
    id: "mkt-3",
    indicatorId: "ind-2",
    indicatorCode: "PRC-ARA",
    indicatorName: "Preço do arábica ao produtor",
    value: 3900,
    unitCode: "AOA_KG",
    unitSymbol: "AOA/kg",
    sourceCode: "INCA",
    sourceName: "Rede de extensão INCA",
    locationScope: "Regional",
    locationCode: "HU",
    locationName: "Huambo",
    referenceDate: "2026-06-01",
  },
  {
    id: "mkt-4",
    indicatorId: "ind-3",
    indicatorCode: "EXP-VOL",
    indicatorName: "Volume exportado",
    value: 128,
    unitCode: "TON",
    unitSymbol: "t",
    sourceCode: "AGT",
    sourceName: "Administração Geral Tributária",
    locationScope: "Regional",
    locationCode: "AO",
    locationName: "Angola",
    referenceDate: "2026-05-31",
    notes: "Acumulado do ano.",
  },
];

/* -------------------------------------------------------------- selectores */

export const findFarmer = (id?: string) => farmers.find((f) => f.id === id);
export const findFarm = (id?: string) => farms.find((f) => f.id === id);
export const findPlot = (id?: string) => plots.find((p) => p.id === id);
export const findHarvest = (id?: string) => harvests.find((h) => h.id === id);
export const findLot = (id?: string) => processingLots.find((l) => l.id === id);
export const findPackaging = (idOrCode?: string) =>
  lotPackagings.find((p) => p.id === idOrCode || p.code === idOrCode || p.qrCode === idOrCode);
export const findTransformation = (id?: string) => transformations.find((t) => t.id === id);
export const findCoffeeWarehouse = (id?: string) => coffeeWarehouses.find((w) => w.id === id);

export interface PackageTraceability {
  packaging: LotPackaging;
  lot: { id: string; code: string; coffeeName: string; producerName: string; status: string };
  transformation: Transformation | null;
  currentStorage: WarehouseStorage | null;
  movements: WarehouseMovement[];
}

/** Rastreabilidade ponta-a-ponta por código de embalagem. */
export const getPackageTraceability = (code: string): PackageTraceability | null => {
  const packaging = findPackaging(code);
  if (!packaging) return null;
  const lot = findLot(packaging.processingLotId);
  if (!lot) return null;
  const transformation = transformations.find((t) => t.lotId === lot.id) ?? null;
  const currentStorage = warehouseStorages.find((s) => s.lotPackagingId === packaging.id) ?? null;
  return {
    packaging,
    lot: { id: lot.id, code: lot.code, coffeeName: lot.coffeeName, producerName: lot.producerName, status: lot.status },
    transformation,
    currentStorage,
    movements: warehouseMovements.filter((m) => m.lotPackagingId === packaging.id),
  };
};
