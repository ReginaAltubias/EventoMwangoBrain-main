import { getDb } from "@/modules/idf/data/mockDb";
import { registry } from "@/modules/idf/registry/store";
import { licensing } from "@/modules/idf/licensing/store";
import type { LicensingRecord } from "@/modules/idf/licensing/types";
import type {
  ConcessionDto,
  ExploitationOperationDto,
  ExportProcessDto,
  ForestCertificateDto,
  ForestInventoryDto,
  ForestLicenseDto,
  ForestLotDto,
  ForestOperatorDto,
  ForestQuotaDto,
  InspectionDto,
  LogDto,
  ManagementPlanDto,
  RevenueTransactionDto,
  TransitGuideDto,
  WarehouseDto,
} from "@/modules/idf/types";
import type {
  AreaRegistryDto,
  EnforcementRecordDto,
  FieldOfficerDto,
  RecognizedEntityDto,
  TransporterDto,
} from "@/modules/idf/registry/types";
import { statusLabel } from "@/sigaflo/templates/StatusBadge";

/**
 * Fixtures do domínio IDF (madeira), em modo apenas-leitura para o SIGAFLO.
 * Reaproveita o conjunto de dados simulados já existente — sem qualquer escrita.
 */

const alive = <T extends { isDeleted?: boolean }>(items: T[]) => items.filter((i) => !i.isDeleted);

export const REQUIRED_OPERATOR_DOCUMENTS = [
  "Pacto social",
  "Comprovativo de registo fiscal",
  "Declaração de sujeição às leis",
  "Declaração bancária de capacidade financeira",
  "Certidão de conformidade tributária",
  "Croquis",
  "Memória descritiva",
  "Relatório de espécies e produtos",
  "Estudo de viabilidade técnico-económica e financeira",
] as const;

const documentFileName = (label: string, nif: string) =>
  `${label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}-${nif}.pdf`;

const completeOperatorDocuments = (operator: ForestOperatorDto): ForestOperatorDto => ({
  ...operator,
  documents: REQUIRED_OPERATOR_DOCUMENTS.map((documentType, index) => {
    const existing = operator.documents.find((document) => document.documentType === documentType);
    return existing ?? {
      documentType,
      documentNumber: "",
      fileReference: {
        fileName: documentFileName(documentType, operator.taxIdentificationNumber),
        contentType: "application/pdf",
        size: 184_000 + index * 37_500,
        url: "#",
      },
    };
  }),
});

export const operators = (): ForestOperatorDto[] => alive(getDb().operators).map(completeOperatorDocuments);
export const concessions = (): ConcessionDto[] => alive(getDb().concessions);
export const inventories = (): ForestInventoryDto[] => alive(getDb().inventories);
export const managementPlans = (): ManagementPlanDto[] => alive(getDb().managementPlans);
export const quotas = (): ForestQuotaDto[] => alive(getDb().quotas);
export const licenses = (): ForestLicenseDto[] => alive(getDb().licenses);
export const operations = (): ExploitationOperationDto[] => alive(getDb().operations);
export const logs = (): LogDto[] => alive(getDb().logs);
export const lots = (): ForestLotDto[] => alive(getDb().lots);
export const transitGuides = (): TransitGuideDto[] => alive(getDb().transitGuides);
export const warehouses = (): WarehouseDto[] => alive(getDb().warehouses);
export const certificates = (): ForestCertificateDto[] => alive(getDb().certificates);
export const inspections = (): InspectionDto[] => alive(getDb().inspections);
export const exportProcesses = (): ExportProcessDto[] => alive(getDb().exports);
export const revenue = (): RevenueTransactionDto[] => alive(getDb().revenueTransactions);
export const species = () => getDb().species;
export const documentTypes = () => getDb().documentTypes;
export const enforcementCases = () => alive(getDb().enforcementCases);

export const areas = (): AreaRegistryDto[] => registry.get().areas;
export const recognizedEntities = (): RecognizedEntityDto[] => registry.get().entities;
export const transporters = (): TransporterDto[] => registry.get().transporters;
export const officers = (): FieldOfficerDto[] => registry.get().officers;
export const enforcementRecords = (): EnforcementRecordDto[] => registry.get().enforcement;
export const quotaMatrix = () => registry.get().quotaMatrix;
export const licensingRecords = (): LicensingRecord[] => licensing.get().records;

export const SUSPENDED_PROVINCES = ["Cabinda", "Cuando"];

/* -------------------------------------------------------------- selectores */

export const findOperator = (id?: string) => operators().find((o) => o.id === id);
export const findConcession = (id?: string) => concessions().find((c) => c.id === id);
export const findArea = (id?: string) => areas().find((a) => a.id === id);
export const findLot = (id?: string) => lots().find((l) => l.id === id);
export const findLog = (id?: string) => logs().find((l) => l.id === id);
export const findOperation = (id?: string) => operations().find((o) => o.id === id);
export const findLicense = (id?: string) => licenses().find((l) => l.id === id);
export const findQuota = (id?: string) => quotas().find((q) => q.id === id);
export const findInventory = (id?: string) => inventories().find((i) => i.id === id);
export const findExport = (id?: string) => exportProcesses().find((e) => e.id === id);

/** Ocupação de uma área registada pelas concessões associadas. */
const RELEASED = ["Rejected", "Expired", "Cancelled"];
export const areaOccupancy = (areaId: string, totalHectares: number) => {
  const linked = concessions().filter((c) => c.areaRegistryId === areaId);
  const occupied = linked
    .filter((c) => !RELEASED.includes(c.status))
    .reduce((sum, c) => sum + (c.areaHectares || 0), 0);
  return {
    totalHectares,
    occupiedHectares: occupied,
    availableHectares: Math.max(totalHectares - occupied, 0),
    usagePercent: totalHectares > 0 ? (occupied / totalHectares) * 100 : 0,
    concessions: linked,
  };
};

/* ----------------------------------------------------------- rastreabilidade */

export interface TraceNodeDto {
  id: string;
  label: string;
  reference: string;
  detail?: string;
  link?: string;
}

export interface TraceabilityChainDto {
  entryPoint: "Log" | "ForestLot" | "ExportProcess";
  entryId: string;
  nodes: TraceNodeDto[];
}

/** Cadeia Operador → Concessão → Árvore → Toro → Lote → Guia → Entreposto → Exportação. */
export const getTraceabilityChain = (entryId: string): TraceabilityChainDto | null => {
  const lot = findLot(entryId) ?? lots().find((l) => l.logIds.includes(entryId));
  const log = findLog(entryId);
  const exportProcess = findExport(entryId);
  const resolvedLot = lot ?? (exportProcess ? findLot(exportProcess.lotId) : undefined);
  if (!resolvedLot && !log) return null;

  const operation = findOperation(resolvedLot?.operationId ?? log?.operationId);
  const concession = findConcession(resolvedLot?.concessionId ?? operation?.concessionId);
  const operator = findOperator(concession?.forestOperatorId);
  const tree = operation?.harvestedTrees[0];
  const lotLogs = resolvedLot ? logs().filter((l) => resolvedLot.logIds.includes(l.id)) : log ? [log] : [];
  const guide = resolvedLot ? transitGuides().find((g) => g.lotId === resolvedLot.id) : undefined;
  const warehouse = resolvedLot
    ? warehouses().find((w) => w.movements.some((m) => m.lotId === resolvedLot.id))
    : undefined;
  const exp = exportProcess ?? (resolvedLot ? exportProcesses().find((e) => e.lotId === resolvedLot.id) : undefined);

  const nodes: TraceNodeDto[] = [];
  if (operator)
    nodes.push({
      id: operator.id,
      label: "Operador",
      reference: operator.legalName,
      detail: `NIF ${operator.taxIdentificationNumber} · ${statusLabel(operator.status)}`,
      link: `/madeira/operadores/${operator.id}`,
    });
  if (concession)
    nodes.push({
      id: concession.id,
      label: "Concessão",
      reference: concession.code,
      detail: `${concession.areaHectares.toLocaleString("pt-AO")} ha · ${statusLabel(concession.status)}`,
      link: `/madeira/concessoes/${concession.id}`,
    });
  if (operation)
    nodes.push({
      id: operation.id,
      label: "Exploração",
      reference: operation.code,
      detail: `Chefe de equipa: ${operation.teamLeader}`,
      link: `/madeira/exploracao/${operation.id}`,
    });
  if (tree)
    nodes.push({ id: tree.id, label: "Árvore abatida", reference: tree.treeCode, detail: `${tree.volume.value} m³ · ${tree.speciesCode}` });
  lotLogs.slice(0, 3).forEach((l) =>
    nodes.push({
      id: l.id,
      label: "Toro",
      reference: l.code,
      detail: `${l.volume.value} m³ · Ø ${l.diameter} cm`,
      link: `/madeira/toros/${l.id}`,
    }),
  );
  if (resolvedLot)
    nodes.push({
      id: resolvedLot.id,
      label: "Lote",
      reference: resolvedLot.code,
      detail: `${resolvedLot.totalVolume.value} m³ · ${statusLabel(resolvedLot.status)}`,
      link: `/madeira/lotes/${resolvedLot.id}`,
    });
  if (guide)
    nodes.push({
      id: guide.id,
      label: "Guia de trânsito",
      reference: guide.guideNumber,
      detail: `${guide.originProvince} → ${guide.destinationProvince}`,
      link: `/madeira/guias/${guide.id}`,
    });
  if (warehouse)
    nodes.push({
      id: warehouse.id,
      label: "Entreposto",
      reference: warehouse.name,
      detail: `Stock físico ${warehouse.physicalStock} m³`,
      link: `/madeira/entrepostos/${warehouse.id}`,
    });
  if (exp)
    nodes.push({
      id: exp.id,
      label: "Exportação",
      reference: exp.code,
      detail: `${exp.destinationCountry} · ${exp.buyer}`,
      link: `/madeira/exportacao/${exp.id}`,
    });

  return {
    entryPoint: exportProcess ? "ExportProcess" : resolvedLot ? "ForestLot" : "Log",
    entryId,
    nodes,
  };
};
