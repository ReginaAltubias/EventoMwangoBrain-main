/**
 * Núcleo de dados partilhado do SIGAFLO (secção 3 do prompt unificado).
 * Implementado uma única vez e reaproveitado por todos os domínios (INCA, IDF, IDA).
 * Nunca há chamadas de rede: todos os dados vêm de fixtures locais.
 */

export interface AuditFields {
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface LocationDto {
  province: string;
  municipality: string;
  commune?: string;
  village?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  accuracy?: number;
}

export interface CoordinateDto {
  latitude: number;
  longitude: number;
}

export interface FileReferenceDto {
  fileName: string;
  contentType: string;
  size: number;
  /** Nos mocks é sempre um placeholder (mock://...), nunca um ficheiro real. */
  url: string;
}

export interface ValidityPeriodDto {
  startDate: string;
  endDate: string;
}

export interface VolumeDto {
  value: number;
  unit: string;
}

export interface PagedQuery {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
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

export interface ProblemDetails {
  title?: string;
  detail?: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/** Auditoria por omissão para fixtures. */
export const audit = (over: Partial<AuditFields> = {}): AuditFields => ({
  createdAt: "2026-01-12T08:00:00.000Z",
  createdBy: "Sistema SIGAFLO",
  updatedAt: "2026-05-20T10:30:00.000Z",
  updatedBy: "Sistema SIGAFLO",
  isActive: true,
  isDeleted: false,
  deletedAt: null,
  deletedBy: null,
  ...over,
});

export const mockFile = (fileName: string, size = 248_000): FileReferenceDto => ({
  fileName,
  contentType: fileName.endsWith(".pdf") ? "application/pdf" : "image/jpeg",
  size,
  url: `mock://documentos/${fileName}`,
});

/** Paginação em memória, comum a todas as listagens do shell. */
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

/** 21 províncias de Angola (divisão pós-2024). */
export const PROVINCES = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando",
  "Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Icolo e Bengo",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Moxico Leste",
  "Namibe",
  "Uíge",
  "Zaire",
] as const;
