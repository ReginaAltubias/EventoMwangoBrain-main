import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Contrato dos templates genéricos do shell SIGAFLO (secção 2.2).
 * Cada domínio só fornece dados/colunas/campos — o layout é sempre o mesmo.
 */

export interface ColumnDef<T> {
  key: string;
  label: string;
  render: (row: T) => ReactNode;
  /** Coluna escondida em ecrãs pequenos. */
  hideOnMobile?: boolean;
}

export interface DetailField {
  label: string;
  value: ReactNode;
  full?: boolean;
}

export interface DetailTable {
  columns: { key: string; label: string; render: (row: never) => ReactNode }[];
  rows: unknown[];
}

export interface DetailSection {
  title: string;
  /** Agrupa várias secções no mesmo separador da ficha. */
  tab?: string;
  description?: string;
  content?: ReactNode;
  fields?: DetailField[];
  table?: { columns: { key: string; label: string; render: (row: any) => ReactNode }[]; rows: any[] };
  links?: { label: string; entity: string; id: string }[];
}

export interface ExpandedDetailRecord {
  key: string;
  label: string;
  title: string;
  subtitle?: string;
  status?: string;
  sections: DetailSection[];
  related: ExpandedDetailRecord[];
}

export interface FilterDef<T> {
  key: string;
  label: string;
  options: string[];
  match: (row: T, value: string) => boolean;
}

export interface EntityConfig<T = any> {
  key: string;
  label: string;
  singular: string;
  group: string;
  icon: LucideIcon;
  rows: () => T[];
  id: (row: T) => string;
  title: (row: T) => string;
  subtitle?: (row: T) => string;
  status?: (row: T) => string | undefined;
  searchText: (row: T) => string;
  columns: ColumnDef<T>[];
  filters?: FilterDef<T>[];
  sections: (row: T) => DetailSection[];
}

export type MapPointKind = string;

export interface MapPoint {
  id: string;
  kind: MapPointKind;
  title: string;
  subtitle: string;
  status?: string;
  coordinate: { latitude: number; longitude: number };
  province?: string;
  municipality?: string;
  link?: string;
}

export interface MapAreaOverlap {
  layer: string;
  verdict: string;
  note: string;
  overlapHectares: number;
}

export interface MapAreaConcession {
  id: string;
  code: string;
  operator: string;
  occupiedHectares: number;
  status: string;
  blocks: { code: string; hectares: number; detail?: string }[];
}

export interface MapLabels {
  searchPlaceholder?: string;
  areaSingular?: string;
  areaPlural?: string;
  subAreaSingular?: string;
  subAreaPlural?: string;
  blockSingular?: string;
  blockPlural?: string;
  ownerLabel?: string;
  occupiedLabel?: string;
  availableLabel?: string;
  overlapLabel?: string;
  overlapButtonLabel?: string;
}

export interface MapArea {
  id: string;
  code: string;
  title: string;
  province: string;
  municipality: string;
  areaHectares: number;
  verdict: string;
  polygon: [number, number][];
  concessions: MapAreaConcession[];
  overlaps: MapAreaOverlap[];
}

export interface KpiCard {
  label: string;
  value: number | string;
  icon: LucideIcon;
  tone: "primary" | "success" | "warning" | "info" | "accent" | "destructive";
  hint?: string;
}

export interface ChartBlock {
  title: string;
  type: "bar" | "pie" | "line";
  data: { name: string; value: number }[];
}

export interface DashboardData {
  cards: KpiCard[];
  charts: ChartBlock[];
  activity: { date: string; label: string; type: string }[];
}

export interface TraceNode {
  id: string;
  label: string;
  reference: string;
  detail?: string;
  link?: string;
}

export interface TraceChain {
  entryLabel: string;
  entryReference: string;
  nodes: TraceNode[];
}

export interface TraceEntryOption {
  id: string;
  label: string;
  hint: string;
}

export interface DomainConfig {
  key: string;
  label: string;
  short: string;
  description: string;
  icon: LucideIcon;
  available: boolean;
  entities: EntityConfig[];
  dashboard: () => DashboardData;
  mapKinds: { kind: string; label: string }[];
  mapPoints: () => MapPoint[];
  mapAreas?: () => MapArea[];
  mapLabels?: MapLabels;
  traceOptions?: () => TraceEntryOption[];
  trace?: (id: string) => TraceChain | null;
}
