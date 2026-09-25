import type {
  ConcessionDto,
  DocumentTypeDto,
  EnforcementCaseDto,
  ExploitationOperationDto,
  ExportProcessDto,
  ForestCertificateDto,
  ForestInventoryDto,
  ForestLicenseDto,
  ForestLotDto,
  ForestOperatorDto,
  ForestQuotaDto,
  ForestSpeciesDto,
  InspectionDto,
  LogDto,
  ManagementPlanDto,
  PagedQuery,
  PagedResult,
  ReadOnlyDto,
  RevenueTransactionDto,
  TransitGuideDto,
  WarehouseDto,
} from "@/modules/idf/types";

/**
 * Camada de dados simulada (sem backend). Persistida em localStorage.
 * Substituível por chamadas Axios a `api/idf/*` quando o URL da API estiver disponível.
 */

const STORAGE_KEY = "idf.mockdb.v3";

export interface MockDb {
  operators: ForestOperatorDto[];
  concessions: ConcessionDto[];
  inventories: ForestInventoryDto[];
  managementPlans: ManagementPlanDto[];
  quotas: ForestQuotaDto[];
  licenses: ForestLicenseDto[];
  operations: ExploitationOperationDto[];
  logs: LogDto[];
  lots: ForestLotDto[];
  transitGuides: TransitGuideDto[];
  warehouses: WarehouseDto[];
  certificates: ForestCertificateDto[];
  inspections: InspectionDto[];
  exports: ExportProcessDto[];
  enforcementCases: EnforcementCaseDto[];
  revenueTransactions: RevenueTransactionDto[];
  documentTypes: DocumentTypeDto[];
  species: ForestSpeciesDto[];
}

const now = () => new Date().toISOString();

export const newId = () =>
  globalThis.crypto?.randomUUID?.() ?? `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;

export const baseFields = (): ReadOnlyDto => ({
  id: newId(),
  createdAt: now(),
  isActive: true,
  isDeleted: false,
});

const m3 = (value: number) => ({ value, unit: "m3" });

const seed = (): MockDb => {
  const operatorA: ForestOperatorDto = {
    ...baseFields(),
    legalName: "Madeiras do Kwanza, Lda.",
    taxIdentificationNumber: "5417002391",
    type: "Company",
    address: { street: "Rua 11 de Novembro, 42", municipality: "Sumbe", province: "Cuanza Sul" },
    contacts: [
      { name: "Adélia Kiala", email: "adelia@madeiraskwanza.ao", phoneNumber: "+244 923 000 111", isPrimary: true },
    ],
    documents: [{ documentType: "ALVARA", documentNumber: "ALV-2024-0091", fileReference: null }],
    status: "Active",
  };
  const operatorB: ForestOperatorDto = {
    ...baseFields(),
    legalName: "Cooperativa Florestal do Moxico",
    taxIdentificationNumber: "5000998877",
    type: "Cooperative",
    address: { street: "Bairro Cazombo, s/n", municipality: "Luena", province: "Moxico" },
    contacts: [{ name: "Paulo Sacamboa", email: "paulo@coopmoxico.ao", isPrimary: true }],
    documents: [],
    status: "Submitted",
  };
  const operatorC: ForestOperatorDto = {
    ...baseFields(),
    legalName: "Serra Verde Exploração Florestal",
    taxIdentificationNumber: "5410771230",
    type: "Company",
    address: { street: "Av. Principal, 7", municipality: "Cabinda", province: "Cabinda" },
    contacts: [{ name: "Nuno Tati", email: "nuno@serraverde.ao", phoneNumber: "+244 912 445 220", isPrimary: true }],
    documents: [],
    status: "Draft",
  };

  const operatorD: ForestOperatorDto = {
    ...baseFields(),
    legalName: "Bengo Timber & Serragem, Lda.",
    taxIdentificationNumber: "5412334455",
    type: "Company",
    address: { street: "Estrada de Caxito, km 8", municipality: "Caxito", province: "Bengo" },
    contacts: [{ name: "Esperança Domingos", email: "esperanca@bengotimber.ao", phoneNumber: "+244 934 778 220", isPrimary: true }],
    documents: [{ documentType: "ALVARA", documentNumber: "ALV-2023-0144", fileReference: null }],
    status: "Suspended",
  };

  const concessionA: ConcessionDto = {
    ...baseFields(),
    forestOperatorId: operatorA.id,
    code: "CON-CS-2025-001",
    type: "ForestConcession",
    validityPeriod: { startDate: "2025-01-15", endDate: "2030-01-14" },
    areaHectares: 12500,
    center: { latitude: -11.2058, longitude: 13.8437 },
    status: "Active",
  };
  const concessionB: ConcessionDto = {
    ...baseFields(),
    forestOperatorId: operatorB.id,
    code: "CON-MX-2025-014",
    type: "CommunityForest",
    validityPeriod: { startDate: "2025-06-01", endDate: "2028-05-31" },
    areaHectares: 4300,
    center: { latitude: -11.7833, longitude: 19.9167 },
    status: "Submitted",
  };

  const inventoryA: ForestInventoryDto = {
    ...baseFields(),
    concessionId: concessionA.id,
    code: "INV-2025-001",
    surveyDate: "2025-03-04",
    responsible: "Eng.ª Teresa Muanza",
    status: "Validated",
    trees: [
      {
        id: newId(),
        code: "ARV-0001",
        speciesCode: "PTE",
        coordinate: { latitude: -11.2071, longitude: 13.8402 },
        diameter: 68,
        height: 24,
        volume: m3(4.2),
      },
      {
        id: newId(),
        code: "ARV-0002",
        speciesCode: "GRD",
        coordinate: { latitude: -11.2094, longitude: 13.8455 },
        diameter: 54,
        height: 19,
        volume: m3(2.8),
      },
    ],
  };

  const planA: ManagementPlanDto = {
    ...baseFields(),
    concessionId: concessionA.id,
    code: "PMF-2025-001",
    title: "Plano de maneio quinquenal — Cuanza Sul",
    validityPeriod: { startDate: "2025-02-01", endDate: "2030-01-31" },
    technicalReport: null,
    status: "Approved",
    cuttingAreas: [
      { id: newId(), code: "AC-01", areaHectares: 850, plannedVolume: m3(3200), cycleYear: 2026 },
      { id: newId(), code: "AC-02", areaHectares: 640, plannedVolume: m3(2400), cycleYear: 2027 },
    ],
  };

  const quotaA: ForestQuotaDto = {
    ...baseFields(),
    concessionId: concessionA.id,
    managementPlanId: planA.id,
    inventoryId: inventoryA.id,
    code: "QT-2026-001",
    year: 2026,
    authorizedVolume: m3(3200),
    consumedVolume: m3(940),
    status: "Approved",
  };

  const revenueLicense: RevenueTransactionDto = {
    ...baseFields(),
    code: "REC-2026-0001",
    sourceType: "License",
    sourceId: "",
    description: "Taxa de emissão de licença de exploração",
    amount: 4500000,
    currency: "AOA",
    paymentProof: null,
    status: "Paid",
    paidAt: now(),
  };

  const licenseA: ForestLicenseDto = {
    ...baseFields(),
    concessionId: concessionA.id,
    quotaId: quotaA.id,
    code: "LIC-2026-001",
    authorizedVolume: m3(1500),
    feeAmount: 4500000,
    validityPeriod: { startDate: "2026-01-10", endDate: "2026-12-31" },
    revenueTransactionId: revenueLicense.id,
    status: "Active",
  };
  revenueLicense.sourceId = licenseA.id;

  const operationA: ExploitationOperationDto = {
    ...baseFields(),
    licenseId: licenseA.id,
    concessionId: concessionA.id,
    code: "EXP-2026-001",
    startDate: "2026-02-02",
    teamLeader: "Mateus Chivukuvuku",
    status: "Active",
    harvestedTrees: [
      {
        id: newId(),
        treeCode: "ARV-0001",
        speciesCode: "PTE",
        volume: m3(4.2),
        harvestDate: "2026-02-06",
        coordinate: { latitude: -11.2071, longitude: 13.8402 },
      },
    ],
  };

  const logA: LogDto = {
    ...baseFields(),
    code: "TOR-2026-0001",
    operationId: operationA.id,
    speciesCode: "PTE",
    length: 6.2,
    diameter: 62,
    volume: m3(2.1),
    status: "Registered",
  };
  const logB: LogDto = {
    ...baseFields(),
    code: "TOR-2026-0002",
    operationId: operationA.id,
    speciesCode: "PTE",
    length: 5.4,
    diameter: 58,
    volume: m3(1.8),
    status: "Registered",
  };

  const warehouseA: WarehouseDto = {
    ...baseFields(),
    code: "ENT-LDA-01",
    name: "Entreposto do Porto de Luanda",
    address: { street: "Zona Portuária, Armazém 4", municipality: "Luanda", province: "Luanda" },
    physicalStock: 0,
    documentaryStock: 0,
    movements: [],
    status: "Active",
  };

  const lotA: ForestLotDto = {
    ...baseFields(),
    code: "LOT-2026-0001",
    concessionId: concessionA.id,
    operationId: operationA.id,
    logIds: [logA.id, logB.id],
    totalVolume: m3(3.9),
    status: "Closed",
  };
  const lotB: ForestLotDto = {
    ...baseFields(),
    code: "LOT-2026-0002",
    concessionId: concessionA.id,
    operationId: operationA.id,
    logIds: [],
    totalVolume: m3(12.4),
    status: "Open",
  };
  logA.lotId = lotA.id;
  logA.status = "InLot";
  logB.lotId = lotA.id;
  logB.status = "InLot";

  const guideA: TransitGuideDto = {
    ...baseFields(),
    lotId: lotA.id,
    guideNumber: "GT-2026-0001",
    productType: "RoundWood",
    origin: "Parque de toros — Concessão Cuanza Sul",
    originProvince: "Cuanza Sul",
    destination: "Entreposto do Porto de Luanda",
    destinationProvince: "Luanda",
    transporter: "Transflora, Lda.",
    vehiclePlate: "LD-42-18-AB",
    departureDate: "2026-03-04",
    status: "Issued",
  };
  const guideB: TransitGuideDto = {
    ...baseFields(),
    lotId: lotB.id,
    guideNumber: "GT-2026-0002",
    productType: "SawnWood",
    origin: "Serração de Sumbe",
    originProvince: "Cuanza Sul",
    destination: "Depósito de Benguela",
    destinationProvince: "Benguela",
    transporter: "Madeiras do Sul, Lda.",
    vehiclePlate: "BG-09-77-CD",
    departureDate: "2026-03-11",
    status: "Completed",
  };

  warehouseA.physicalStock = 3.9;
  warehouseA.documentaryStock = 3.9;
  warehouseA.movements = [
    { id: newId(), type: "Entry", lotId: lotA.id, volume: m3(3.9), movementDate: "2026-03-06", documentReference: null },
  ];

  const certificateA: ForestCertificateDto = {
    ...baseFields(),
    code: "CRT-2026-0001",
    type: "Origin",
    lotId: lotA.id,
    validityPeriod: { startDate: "2026-03-07", endDate: "2026-09-07" },
    status: "Issued",
  };
  const certificateB: ForestCertificateDto = {
    ...baseFields(),
    code: "CRT-2026-0002",
    type: "ProductInStorage",
    lotId: lotB.id,
    validityPeriod: { startDate: "2026-03-12", endDate: "2026-06-12" },
    coordinate: { latitude: -11.2071, longitude: 13.8402 },
    status: "Draft",
  };

  const inspectionA: InspectionDto = {
    ...baseFields(),
    code: "INS-2026-0001",
    targetType: "Concession",
    targetReference: concessionA.code,
    scheduledDate: "2026-03-18",
    inspectorName: "Ana Kiala",
    coordinate: { latitude: -11.1899, longitude: 13.8221 },
    findings: [
      {
        id: newId(),
        description: "Sinalização do parque de toros incompleta.",
        severity: "Low",
        photo: null,
        recordedAt: "2026-03-18",
      },
    ],
    status: "Completed",
  };
  const inspectionB: InspectionDto = {
    ...baseFields(),
    code: "INS-2026-0002",
    targetType: "Warehouse",
    targetReference: warehouseA.code,
    scheduledDate: "2026-04-02",
    inspectorName: "Domingos Neto",
    findings: [],
    status: "Draft",
  };

  const exportA: ExportProcessDto = {
    ...baseFields(),
    code: "EXP-INT-2026-0001",
    lotId: lotA.id,
    destinationCountry: "Portugal",
    buyer: "Madeiras Atlântico, S.A.",
    volume: m3(3.9),
    contractFile: null,
    status: "Submitted",
  };

  const fineRevenue: RevenueTransactionDto = {
    ...baseFields(),
    code: "REC-2026-0002",
    sourceType: "Fine",
    sourceId: "",
    description: "Multa por incumprimento de sinalização",
    amount: 850000,
    currency: "AOA",
    paymentProof: null,
    status: "Liquidated",
  };
  const guideRevenue: RevenueTransactionDto = {
    ...baseFields(),
    code: "REC-2026-0003",
    sourceType: "TransitGuide",
    sourceId: guideA.id,
    description: "Emolumento de guia de trânsito GT-2026-0001",
    amount: 120000,
    currency: "AOA",
    paymentProof: null,
    status: "Pending",
  };

  const enforcementA: EnforcementCaseDto = {
    ...baseFields(),
    code: "FIS-2026-0001",
    forestOperatorId: operatorA.id,
    openedDate: "2026-03-19",
    inspectionId: inspectionA.id,
    violations: [
      {
        id: newId(),
        description: "Ausência de sinalização obrigatória no parque de toros.",
        legalArticle: "Art. 84.º do Regulamento Florestal",
        occurredAt: "2026-03-18",
        evidence: null,
      },
    ],
    fines: [
      { id: newId(), description: "Coima base", amount: 850000, dueDate: "2026-04-19", revenueTransactionId: fineRevenue.id },
    ],
    status: "UnderAnalysis",
  };
  fineRevenue.sourceId = enforcementA.id;

  return {
    operators: [operatorA, operatorB, operatorC, operatorD],
    concessions: [concessionA, concessionB],
    inventories: [inventoryA],
    managementPlans: [planA],
    quotas: [quotaA],
    licenses: [licenseA],
    operations: [operationA],
    logs: [logA, logB],
    lots: [lotA, lotB],
    transitGuides: [guideA, guideB],
    warehouses: [warehouseA],
    certificates: [certificateA, certificateB],
    inspections: [inspectionA, inspectionB],
    exports: [exportA],
    enforcementCases: [enforcementA],
    revenueTransactions: [revenueLicense, fineRevenue, guideRevenue],

    documentTypes: [
      { ...baseFields(), code: "ALVARA", name: "Alvará comercial", isRequired: true },
      { ...baseFields(), code: "NIF", name: "Cartão de contribuinte", isRequired: true },
      { ...baseFields(), code: "ESTATUTOS", name: "Estatutos da sociedade", isRequired: false },
      { ...baseFields(), code: "CERT_AMB", name: "Certificado ambiental", isRequired: false },
    ],
    species: [
      { ...baseFields(), code: "PTE", commonName: "Pau-ferro", scientificName: "Swartzia fistuloides" },
      { ...baseFields(), code: "MSS", commonName: "Mussivi", scientificName: "Guibourtia coleosperma" },
      { ...baseFields(), code: "GRD", commonName: "Girassonde", scientificName: "Pterocarpus angolensis" },
    ],
  };
};

let db: MockDb | null = null;

const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // armazenamento indisponível — mantém apenas em memória
  }
};

const load = (): MockDb => {
  if (db) return db;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      db = { ...seed(), ...(JSON.parse(raw) as MockDb) };
      return db;
    }
  } catch {
    // ignora — recomeça com seed
  }
  db = seed();
  persist();
  return db;
};

export const getDb = () => load();

export const saveDb = () => persist();

export const resetDb = () => {
  db = seed();
  persist();
};

/** Simula latência de rede. */
export const delay = (ms = 260) => new Promise((resolve) => setTimeout(resolve, ms));

export const paginate = <T,>(items: T[], query: PagedQuery = {}): PagedResult<T> => {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;
  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    totalCount,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
};

export const sortRecent = <T extends { createdAt: string }>(items: T[]) =>
  [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
