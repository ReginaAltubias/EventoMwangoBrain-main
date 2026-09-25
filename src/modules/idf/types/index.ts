/** Tipos partilhados do módulo IDF (secção 5 da especificação). */

export interface AddressDto {
  street: string;
  commune?: string;
  municipality: string;
  province: string;
}

export interface CoordinateDto {
  latitude: number;
  longitude: number;
}

export interface ValidityPeriodDto {
  startDate: string;
  endDate: string;
}

export interface VolumeDto {
  value: number;
  unit: string;
}

export interface ReadOnlyDto {
  id: string;
  createdAt: string;
  updatedAt?: string;
  isActive: boolean;
  isDeleted: boolean;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalActive?: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PagedQuery {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

/** Erro no formato ProblemDetails (secção 6). */
export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

export class ApiError extends Error {
  problem: ProblemDetails;
  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title ?? "Erro inesperado");
    this.problem = problem;
  }
}

/** Referência a ficheiro carregado (nunca texto solto — regra 9.8). */
export interface FileReferenceDto {
  fileName: string;
  contentType: string;
  size: number;
  /** Data URL local enquanto não existe backend de armazenamento. */
  url: string;
}

/* ---------------------------------------------------------------- Operadores */

export type OperatorType = "Individual" | "Company" | "Cooperative" | "PublicEntity";

export type OperatorStatus =
  | "Draft"
  | "Submitted"
  | "TechnicalValidation"
  | "LegalValidation"
  | "Approved"
  | "Active"
  | "Rejected"
  | "Suspended";

export interface OperatorContactDto {
  name: string;
  email: string;
  phoneNumber?: string;
  isPrimary: boolean;
}

export interface OperatorDocumentDto {
  documentType: string;
  documentNumber: string;
  fileReference: FileReferenceDto | null;
}

export interface ForestOperatorDto extends ReadOnlyDto {
  legalName: string;
  taxIdentificationNumber: string;
  type: OperatorType;
  address: AddressDto;
  contacts: OperatorContactDto[];
  documents: OperatorDocumentDto[];
  status: OperatorStatus;
}

export interface CreateOperatorRequest {
  legalName: string;
  taxIdentificationNumber: string;
  type: OperatorType;
  address: AddressDto;
  contacts: OperatorContactDto[];
  documents: OperatorDocumentDto[];
}

/* --------------------------------------------------------------- Concessões */

export type ConcessionType = "ForestConcession" | "CommunityForest" | "Other";

export type ConcessionStatus =
  | "Draft"
  | "Submitted"
  | "UnderReview"
  | "Approved"
  | "Active"
  | "Rejected"
  | "Expired";

/** Via de atribuição do direito de concessão. */
export type ConcessionGrantRoute = "SimplifiedContracting" | "PublicTender";

export interface ConcessionDto extends ReadOnlyDto {
  forestOperatorId: string;
  code: string;
  type: ConcessionType;
  grantRoute?: ConcessionGrantRoute;
  validityPeriod: ValidityPeriodDto;
  /** Referência ao módulo Registo de Área (substitui a coordenada solta). */
  areaRegistryId?: string;
  areaHectares: number;
  center?: CoordinateDto;
  status: ConcessionStatus;
}

export interface CreateConcessionRequest {
  forestOperatorId: string;
  code: string;
  type: ConcessionType;
  grantRoute?: ConcessionGrantRoute;
  validityPeriod: ValidityPeriodDto;
  areaRegistryId?: string;
  areaHectares: number;
  center?: CoordinateDto;
}


/* ------------------------------------------------------------- Inventários */

export type InventoryStatus = "Draft" | "Submitted" | "Validated" | "Rejected";

export interface TreeDto {
  id: string;
  code: string;
  speciesCode: string;
  coordinate: CoordinateDto;
  diameter: number;
  height: number;
  volume: VolumeDto;
}

export interface ForestInventoryDto extends ReadOnlyDto {
  concessionId: string;
  code: string;
  surveyDate: string;
  responsible: string;
  /** Entidade reconhecida (âmbito: Inventário florestal) que elabora o documento. */
  preparedByEntityId?: string;
  trees: TreeDto[];
  status: InventoryStatus;
}

export interface RegisterTreeRequest {
  code: string;
  speciesCode: string;
  coordinate: CoordinateDto;
  diameter: number;
  height: number;
  volume: VolumeDto;
}

/* -------------------------------------------------------- Planos de Maneio */

export type ManagementPlanStatus = "Draft" | "Submitted" | "UnderReview" | "Approved" | "Rejected";

export interface CuttingAreaDto {
  id: string;
  code: string;
  areaHectares: number;
  plannedVolume: VolumeDto;
  cycleYear: number;
}

export interface ManagementPlanDto extends ReadOnlyDto {
  concessionId: string;
  code: string;
  title: string;
  /** Entidade reconhecida (âmbito: Plano de gestão) que elabora o documento. */
  preparedByEntityId?: string;
  validityPeriod: ValidityPeriodDto;
  technicalReport: FileReferenceDto | null;
  cuttingAreas: CuttingAreaDto[];
  status: ManagementPlanStatus;
}

/* -------------------------------------------------------------------- Quotas */

export type QuotaStatus = "Draft" | "Submitted" | "Approved" | "Consumed" | "Rejected";

export interface ForestQuotaDto extends ReadOnlyDto {
  concessionId: string;
  managementPlanId: string;
  inventoryId: string;
  code: string;
  year: number;
  authorizedVolume: VolumeDto;
  consumedVolume: VolumeDto;
  status: QuotaStatus;
}

/* ------------------------------------------------------------------ Licenças */

export type LicenseStatus = "Requested" | "Issued" | "Active" | "Suspended" | "Expired";

export interface ForestLicenseDto extends ReadOnlyDto {
  concessionId: string;
  quotaId: string;
  code: string;
  authorizedVolume: VolumeDto;
  feeAmount: number;
  validityPeriod: ValidityPeriodDto;
  revenueTransactionId?: string;
  status: LicenseStatus;
}

/* --------------------------------------------------------------- Exploração */

export type ExploitationStatus = "Draft" | "Active" | "Completed";

export interface HarvestedTreeDto {
  id: string;
  treeCode: string;
  speciesCode: string;
  volume: VolumeDto;
  harvestDate: string;
  coordinate?: CoordinateDto;
}

export interface ExploitationOperationDto extends ReadOnlyDto {
  licenseId: string;
  concessionId: string;
  code: string;
  startDate: string;
  teamLeader: string;
  harvestedTrees: HarvestedTreeDto[];
  status: ExploitationStatus;
}

/* ----------------------------------------------------------------- Produção */

export type LogStatus = "Registered" | "InLot";

export interface LogDto extends ReadOnlyDto {
  code: string;
  operationId: string;
  speciesCode: string;
  length: number;
  diameter: number;
  volume: VolumeDto;
  lotId?: string;
  status: LogStatus;
}

export type LotStatus = "Open" | "Closed";

export interface ForestLotDto extends ReadOnlyDto {
  code: string;
  concessionId: string;
  operationId: string;
  logIds: string[];
  totalVolume: VolumeDto;
  status: LotStatus;
}

/* --------------------------------------------------------- Guias de Trânsito */

export type TransitGuideStatus = "Draft" | "Issued" | "Completed";

export type TransitProductType = "RoundWood" | "SawnWood";

export interface TransitGuideDto extends ReadOnlyDto {
  lotId: string;
  guideNumber: string;
  productType: TransitProductType;
  origin: string;
  originProvince: string;
  destination: string;
  destinationProvince: string;
  transporter: string;
  vehiclePlate: string;
  departureDate: string;
  revenueTransactionId?: string;
  status: TransitGuideStatus;
}


/* -------------------------------------------------------------- Entrepostos */

export type WarehouseMovementType = "Entry" | "Exit";

export interface WarehouseMovementDto {
  id: string;
  type: WarehouseMovementType;
  lotId: string;
  volume: VolumeDto;
  movementDate: string;
  documentReference: FileReferenceDto | null;
}

export interface WarehouseDto extends ReadOnlyDto {
  code: string;
  name: string;
  address: AddressDto;
  physicalStock: number;
  documentaryStock: number;
  movements: WarehouseMovementDto[];
  status: "Active" | "Suspended";
}

/* -------------------------------------------------------------- Certificados */

export type CertificateStatus = "Draft" | "Issued" | "Expired";

export type CertificateType = "Origin" | "Legality" | "Phytosanitary" | "Sustainability" | "ProductInStorage";

export interface ForestCertificateDto extends ReadOnlyDto {
  code: string;
  type: CertificateType;
  lotId: string;
  validityPeriod: ValidityPeriodDto;
  /** Obrigatório para "Produto em Estância". */
  coordinate?: CoordinateDto;
  revenueTransactionId?: string;
  status: CertificateStatus;
}


/* --------------------------------------------------------------- Inspecções */

export type InspectionStatus = "Draft" | "InProgress" | "Completed";

export interface InspectionFindingDto {
  id: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  photo: FileReferenceDto | null;
  recordedAt: string;
}

export interface InspectionDto extends ReadOnlyDto {
  code: string;
  targetType: "Concession" | "Warehouse" | "TransitGuide" | "Operator";
  targetReference: string;
  scheduledDate: string;
  inspectorName: string;
  coordinate?: CoordinateDto;
  findings: InspectionFindingDto[];
  status: InspectionStatus;
}

/* -------------------------------------------------------------- Exportação */

export type ExportStatus = "Draft" | "Submitted" | "Authorized" | "Rejected";

export interface ExportProcessDto extends ReadOnlyDto {
  code: string;
  lotId: string;
  destinationCountry: string;
  buyer: string;
  volume: VolumeDto;
  contractFile: FileReferenceDto | null;
  revenueTransactionId?: string;
  status: ExportStatus;
}

/* ------------------------------------------------------------ Fiscalização */

export type EnforcementStatus = "Open" | "UnderAnalysis" | "Closed";

export interface ViolationDto {
  id: string;
  description: string;
  legalArticle: string;
  occurredAt: string;
  evidence: FileReferenceDto | null;
}

export interface FineDto {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  revenueTransactionId?: string;
}

export interface EnforcementCaseDto extends ReadOnlyDto {
  code: string;
  forestOperatorId: string;
  openedDate: string;
  inspectionId?: string;
  violations: ViolationDto[];
  fines: FineDto[];
  status: EnforcementStatus;
}

/* ----------------------------------------------------------------- Receitas */

export type RevenueStatus = "Pending" | "Liquidated" | "Paid";

export type RevenueSource = "License" | "TransitGuide" | "Certificate" | "Export" | "Inspection" | "Fine";

export interface RevenueTransactionDto extends ReadOnlyDto {
  code: string;
  sourceType: RevenueSource;
  sourceId: string;
  description: string;
  amount: number;
  currency: string;
  paymentProof: FileReferenceDto | null;
  paidAt?: string;
  status: RevenueStatus;
}

/* ------------------------------------------------------------ Rastreabilidade */

export interface TraceabilityNode {
  id: string;
  label: string;
  reference: string;
  detail?: string;
  route?: string;
}

export interface TraceabilityChainDto {
  entryPoint: "Log" | "ForestLot" | "ExportProcess";
  entryId: string;
  operator?: TraceabilityNode;
  concession?: TraceabilityNode;
  tree?: TraceabilityNode;
  log?: TraceabilityNode;
  lot?: TraceabilityNode;
  transit?: TraceabilityNode;
  warehouse?: TraceabilityNode;
  export?: TraceabilityNode;
}

/* ------------------------------------------------------------ Administração */

export interface DocumentTypeDto extends ReadOnlyDto {
  code: string;
  name: string;
  isRequired: boolean;
}

export interface ForestSpeciesDto extends ReadOnlyDto {
  code: string;
  commonName: string;
  scientificName: string;
}

export interface IdfSummaryReportDto {
  operatorsCount: number;
  concessionsCount: number;
  licensesCount: number;
  lotsCount: number;
  exportsCount: number;
  inspectionsCount: number;
  revenueTotal: number;
}
