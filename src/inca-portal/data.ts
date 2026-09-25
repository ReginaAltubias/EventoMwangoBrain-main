import * as inca from "@/mocks/inca";
import { incaDomain } from "@/sigaflo/domains/inca";
import type { EntityConfig } from "@/sigaflo/core/config";

export const produtor = inca.farmers[0];
export const exploracoes = inca.farms.filter((item) => item.coffeeFarmerId === produtor.id);
export const exploracaoIds = new Set(exploracoes.map((item) => item.id));
export const parcelas = inca.plots.filter((item) => exploracaoIds.has(item.farmId));
export const parcelaIds = new Set(parcelas.map((item) => item.id));
export const colheitas = inca.harvests.filter((item) => parcelaIds.has(item.plotId));
export const lotes = inca.processingLots.filter((item) => item.producerId === produtor.id);
export const loteIds = new Set(lotes.map((item) => item.id));
export const transformacoes = inca.transformations.filter((item) => loteIds.has(item.lotId));
export const embalagens = inca.lotPackagings.filter((item) => loteIds.has(item.processingLotId));
export const embalagemIds = new Set(embalagens.map((item) => item.id));
export const stock = inca.warehouseStorages.filter((item) => embalagemIds.has(item.lotPackagingId));
export const movimentos = inca.warehouseMovements.filter((item) => embalagemIds.has(item.lotPackagingId));
export const manutencoes = inca.maintenances.filter((item) => exploracaoIds.has(item.farmId));

const rowsByEntity: Record<string, () => unknown[]> = {
  fazendas: () => exploracoes,
  parcelas: () => parcelas,
  colheitas: () => colheitas,
  manutencoes: () => manutencoes,
  lotes: () => lotes,
  transformacoes: () => transformacoes,
  embalagens: () => embalagens,
  stock: () => stock,
  movimentos: () => movimentos,
  mercado: () => inca.marketData,
  variedades: () => inca.coffeeVarieties,
};

export const entidadeProdutor = (key?: string): EntityConfig | undefined => {
  const entity = incaDomain.entities.find((item) => item.key === key);
  const rows = key ? rowsByEntity[key] : undefined;
  return entity && rows ? { ...entity, rows } : undefined;
};

export const documentosProdutor = [
  { id: "doc-1", nome: "Bilhete de Identidade", referencia: produtor.profile.identification.number, estado: "Validado" },
  { id: "doc-2", nome: "Comprovativo de registo do produtor", referencia: produtor.registryCode, estado: "Validado" },
  { id: "doc-3", nome: "Declaração de posse ou uso da terra", referencia: "DECL-2025-0148", estado: "Validado" },
  { id: "doc-4", nome: "Ficha de levantamento da exploração", referencia: produtor.survey.koboSubmissionId, estado: "Validado" },
  { id: "doc-5", nome: "Comprovativo bancário", referencia: "A actualizar", estado: "Actualização solicitada" },
];

export const notificacoesProdutor = [
  { id: "n1", tipo: "Colheita", texto: "A colheita COL-2026-002 foi validada com 3.100 kg.", data: "2026-09-18", lida: false },
  { id: "n2", tipo: "Documento", texto: "Actualize o comprovativo bancário no seu cadastro.", data: "2026-09-16", lida: false },
  { id: "n3", tipo: "Lote", texto: "O lote LOTE-2026-001 concluiu a transformação e está embalado.", data: "2026-09-12", lida: true },
  { id: "n4", tipo: "Mercado", texto: "Foi publicada uma nova referência de preço para café Robusta no Cuanza Sul.", data: "2026-09-09", lida: true },
];

export const formatarData = (value: string) => new Intl.DateTimeFormat("pt-AO").format(new Date(`${value.slice(0, 10)}T12:00:00`));
export const formatarKg = (value: number) => `${value.toLocaleString("pt-AO")} kg`;