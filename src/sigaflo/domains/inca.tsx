import {
  Boxes,
  Coffee,
  Factory,
  Leaf,
  LineChart,
  MapPinned,
  Package,
  Scale,
  Sprout,
  Tractor,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
import * as inca from "@/mocks/inca";
import type { DashboardData, DomainConfig, EntityConfig, MapArea, MapPoint, TraceChain } from "@/sigaflo/core/config";
import { StatusBadge, statusLabel } from "@/sigaflo/templates/StatusBadge";

const kg = (value: number) => `${value.toLocaleString("pt-AO")} kg`;
const aoa = (value: number) => `${value.toLocaleString("pt-AO")} AOA`;
const place = (l: { province: string; municipality: string; commune?: string }) =>
  [l.province, l.municipality, l.commune].filter(Boolean).join(" · ");

const bold = (text: string) => <span className="font-medium text-foreground">{text}</span>;

/* ------------------------------------------------------------- entidades */

const farmersEntity: EntityConfig<inca.CoffeeFarmer> = {
  key: "produtores",
  label: "Produtores",
  singular: "Produtor",
  group: "Base produtiva",
  icon: Users,
  rows: () => inca.farmers,
  id: (r) => r.id,
  title: (r) => r.profile.fullName,
  subtitle: (r) => r.registryCode,
  status: (r) => (r.isActive ? "Activo" : "Inactivo"),
  searchText: (r) => `${r.profile.fullName} ${r.registryCode} ${r.profile.location.province}`,
  filters: [
    {
      key: "provincia",
      label: "Província",
      options: [...new Set(inca.farmers.map((f) => f.profile.location.province))],
      match: (r, v) => r.profile.location.province === v,
    },
    {
      key: "rank",
      label: "Actividade",
      options: ["Principal", "Secundária"],
      match: (r, v) => r.coffeeActivityRank === v,
    },
  ],
  columns: [
    { key: "code", label: "Registo", render: (r) => bold(r.registryCode) },
    { key: "name", label: "Nome", render: (r) => r.profile.fullName },
    { key: "loc", label: "Localização", hideOnMobile: true, render: (r) => place(r.profile.location) },
    { key: "time", label: "Tempo de produção", hideOnMobile: true, render: (r) => r.coffeeProductionTime },
  ],
  sections: (r) => [
    {
      title: "Perfil do produtor",
      fields: [
        { label: "Nome completo", value: r.profile.fullName },
        { label: "Género", value: r.profile.gender },
        { label: "Data de nascimento", value: r.profile.birthDate },
        { label: "Telefone", value: r.profile.phone },
        { label: "Documento", value: `${r.profile.identification.type} ${r.profile.identification.number}` },
        { label: "Escolaridade", value: r.profile.educationLevel },
        { label: "Localização", value: place(r.profile.location) },
        { label: "Código de extensão", value: r.survey.extensionLocationCode },
        { label: "Rendimento estimado", value: r.estimatedMonthlyIncome },
      ],
    },
    {
      title: "Plantações declaradas",
      table: {
        columns: [
          { key: "regime", label: "Regime de posse", render: (p: any) => p.landTenureRegime },
          { key: "total", label: "Área total (ha)", render: (p: any) => p.totalArea },
          { key: "cafe", label: "Área de café (ha)", render: (p: any) => p.coffeeArea },
          { key: "idade", label: "Idade (anos)", render: (p: any) => p.plantationAge },
          { key: "dens", label: "Densidade", render: (p: any) => `${p.density} pl/ha` },
          { key: "crops", label: "Culturas", render: (p: any) => p.crops.join(", ") },
        ],
        rows: r.plantations,
      },
    },
    {
      title: "Explorações associadas",
      links: inca.farms
        .filter((f) => f.coffeeFarmerId === r.id)
        .map((f) => ({ label: `${f.code} — ${f.name}`, entity: "fazendas", id: f.id })),
    },
  ],
};

const farmsEntity: EntityConfig<inca.Farm> = {
  key: "fazendas",
  label: "Explorações agrícolas",
  singular: "Exploração",
  group: "Base produtiva",
  icon: Tractor,
  rows: () => inca.farms,
  id: (r) => r.id,
  title: (r) => r.name,
  subtitle: (r) => r.code,
  status: (r) => r.status,
  searchText: (r) => `${r.name} ${r.code} ${r.coffeeFarmerName} ${r.location.province}`,
  filters: [
    { key: "status", label: "Estado", options: ["Validada", "Aguarda validação", "Rejeitada"], match: (r, v) => ({ Validated: "Validada", PendingValidation: "Aguarda validação", Rejected: "Rejeitada" })[r.status] === v },
    {
      key: "provincia",
      label: "Província",
      options: [...new Set(inca.farms.map((f) => f.location.province))],
      match: (r, v) => r.location.province === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "name", label: "Exploração", render: (r) => r.name },
    { key: "farmer", label: "Produtor", hideOnMobile: true, render: (r) => r.coffeeFarmerName },
    { key: "area", label: "Área (ha)", render: (r) => r.area },
  ],
  sections: (r) => [
    {
      title: "Dados gerais",
      fields: [
        { label: "Código", value: r.code },
        { label: "Produtor", value: r.coffeeFarmerName },
        { label: "Área total", value: `${r.area} ha` },
        { label: "Área em parcelas", value: `${r.plotsTotalArea} ha` },
        { label: "Trabalhadores", value: r.workers },
        { label: "Localização", value: place(r.location) },
      ],
    },
    {
      title: "Parcelas",
      table: {
        columns: [
          { key: "code", label: "Código", render: (p: any) => p.code },
          { key: "area", label: "Área (ha)", render: (p: any) => p.area },
        ],
        rows: r.plots,
      },
    },
    {
      title: "Manutenções",
      table: {
        columns: [
          { key: "type", label: "Tipo", render: (m: any) => m.type },
          { key: "date", label: "Data", render: (m: any) => m.date },
        ],
        rows: r.maintenances,
      },
    },
    {
      title: "Ligações",
      links: [
        { label: `Produtor: ${r.coffeeFarmerName}`, entity: "produtores", id: r.coffeeFarmerId },
        ...inca.plots
          .filter((p) => p.farmId === r.id)
          .map((p) => ({ label: `Parcela ${p.code}`, entity: "parcelas", id: p.id })),
      ],
    },
  ],
};

const plotsEntity: EntityConfig<inca.Plot> = {
  key: "parcelas",
  label: "Parcelas",
  singular: "Parcela",
  group: "Base produtiva",
  icon: Sprout,
  rows: () => inca.plots,
  id: (r) => r.id,
  title: (r) => `Parcela ${r.code}`,
  subtitle: (r) => r.farmName,
  status: (r) => (r.isActive ? "Activa" : "Inactiva"),
  searchText: (r) => `${r.code} ${r.farmName}`,
  filters: [
    { key: "rega", label: "Rega", options: ["Com rega", "Sem rega"], match: (r, v) => (v === "Com rega") === r.hasIrrigation },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "farm", label: "Exploração", render: (r) => r.farmName },
    { key: "area", label: "Área (ha)", render: (r) => r.area },
    { key: "year", label: "Ano de plantação", hideOnMobile: true, render: (r) => r.plantingYear },
  ],
  sections: (r) => [
    {
      title: "Dados da parcela",
      fields: [
        { label: "Código", value: r.code },
        { label: "Exploração", value: r.farmName },
        { label: "Área", value: `${r.area} ha` },
        { label: "Ano de plantação", value: r.plantingYear },
        { label: "Sombreamento", value: `${r.shadePercentage}%` },
        { label: "Rega", value: r.hasIrrigation ? "Sim" : "Não" },
        { label: "Café", value: inca.coffees.find((c) => c.id === r.coffeeId)?.name ?? "—" },
        { label: "Justificação de excesso de área", value: r.areaOverflowJustification ?? "—", full: true },
      ],
    },
    {
      title: "Colheitas da parcela",
      table: {
        columns: [
          { key: "date", label: "Data", render: (h: any) => h.date },
          { key: "qty", label: "Quantidade", render: (h: any) => `${h.quantity} ${h.unit}` },
          { key: "score", label: "Qualidade", render: (h: any) => h.qualityScore },
          { key: "status", label: "Estado", render: (h: any) => <StatusBadge status={h.status} /> },
        ],
        rows: r.harvests,
      },
    },
    { title: "Ligações", links: [{ label: `Exploração: ${r.farmName}`, entity: "fazendas", id: r.farmId }] },
  ],
};

const harvestsEntity: EntityConfig<inca.Harvest> = {
  key: "colheitas",
  label: "Colheitas",
  singular: "Colheita",
  group: "Produção",
  icon: Leaf,
  rows: () => inca.harvests,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.farmName} · ${r.plotCode}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.farmName} ${r.plotCode}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Planeada", "Em progresso", "Concluída", "Cancelada"],
      match: (r, v) => ({ Planned: "Planeada", InProgress: "Em progresso", Completed: "Concluída", Cancelled: "Cancelada" })[r.status] === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "farm", label: "Exploração", render: (r) => r.farmName },
    { key: "plot", label: "Parcela", hideOnMobile: true, render: (r) => r.plotCode },
    { key: "qty", label: "Quantidade", render: (r) => kg(r.quantity) },
    { key: "date", label: "Data", hideOnMobile: true, render: (r) => r.date },
  ],
  sections: (r) => [
    {
      title: "Colheita",
      fields: [
        { label: "Código", value: r.code },
        { label: "Data", value: r.date },
        { label: "Quantidade", value: `${r.quantity} ${r.unit}` },
        { label: "Pontuação de qualidade", value: r.qualityScore },
        { label: "Exploração", value: r.farmName },
        { label: "Parcela", value: r.plotCode },
        { label: "Observações", value: r.notes ?? "—", full: true },
      ],
    },
    {
      title: "Ligações",
      links: [
        { label: `Parcela ${r.plotCode}`, entity: "parcelas", id: r.plotId },
        { label: `Exploração: ${r.farmName}`, entity: "fazendas", id: r.farmId },
        ...inca.processingLots
          .filter((l) => l.harvestId === r.id)
          .map((l) => ({ label: `Lote ${l.code}`, entity: "lotes", id: l.id })),
      ],
    },
  ],
};

const maintenanceEntity: EntityConfig<inca.Maintenance> = {
  key: "manutencoes",
  label: "Manutenção agrícola",
  singular: "Manutenção",
  group: "Produção",
  icon: Wrench,
  rows: () => inca.maintenances,
  id: (r) => r.id,
  title: (r) => r.type,
  subtitle: (r) => r.farmName,
  searchText: (r) => `${r.type} ${r.farmName} ${r.responsible}`,
  columns: [
    { key: "type", label: "Tipo", render: (r) => bold(r.type) },
    { key: "farm", label: "Exploração", render: (r) => r.farmName },
    { key: "date", label: "Data", render: (r) => r.date },
    { key: "cost", label: "Custo", hideOnMobile: true, render: (r) => aoa(r.cost) },
  ],
  sections: (r) => [
    {
      title: "Intervenção",
      fields: [
        { label: "Tipo", value: r.type },
        { label: "Data", value: r.date },
        { label: "Exploração", value: r.farmName },
        { label: "Responsável", value: r.responsible },
        { label: "Quantidade", value: r.quantity },
        { label: "Custo", value: aoa(r.cost) },
        { label: "Produtos usados", value: r.productsUsed.join(", "), full: true },
      ],
    },
  ],
};

const lotsEntity: EntityConfig<inca.ProcessingLot> = {
  key: "lotes",
  label: "Lotes em processamento",
  singular: "Lote",
  group: "Processamento",
  icon: Coffee,
  rows: () => inca.processingLots,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.coffeeName} · ${r.producerName}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.coffeeName} ${r.producerName} ${r.qrCode}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Recebido", "Em Processamento", "Em Embalagem", "Finalizado", "Consumido", "Cancelado", "Rascunho"],
      match: (r, v) => r.status === v,
    },
    { key: "especie", label: "Espécie", options: ["Robusta", "Arábica"], match: (r, v) => r.speciesName === v },
  ],
  columns: [
    { key: "code", label: "Lote", render: (r) => bold(r.code) },
    { key: "coffee", label: "Café", render: (r) => r.coffeeName },
    { key: "producer", label: "Produtor", hideOnMobile: true, render: (r) => r.producerName },
    { key: "qty", label: "Quantidade", render: (r) => kg(r.quantity) },
  ],
  sections: (r) => [
    {
      title: "Identificação",
      fields: [
        { label: "Código", value: r.code },
        { label: "QR", value: r.qrCode },
        { label: "Café", value: `${r.coffeeName} (${r.speciesName} / ${r.varietyName})` },
        { label: "Colheita", value: r.harvestCode },
        { label: "Produtor", value: r.producerName },
        { label: "Exploração / parcela", value: `${r.farmName} · ${r.plotCode}` },
      ],
    },
    {
      title: "Massas e condições",
      fields: [
        { label: "Quantidade inicial", value: kg(r.initialQuantity) },
        { label: "Quantidade actual", value: kg(r.quantity) },
        { label: "Embalado", value: kg(r.packagedWeightKg) },
        { label: "Disponível", value: kg(r.availableWeightKg) },
        { label: "Humidade", value: `${r.humidity}%` },
        { label: "Temperatura", value: `${r.temperature} °C` },
        { label: "Última operação", value: r.lastOperation },
        { label: "Elegível para embalagem", value: r.isEligibleForPackaging ? "Sim" : "Não" },
        { label: "Bloqueado", value: r.isLocked ? "Sim" : "Não" },
      ],
    },
    {
      title: "Histórico do lote",
      table: {
        columns: [
          { key: "date", label: "Data", render: (h: any) => h.date },
          { key: "op", label: "Operação", render: (h: any) => h.operation },
          { key: "desc", label: "Descrição", render: (h: any) => h.description },
        ],
        rows: r.history,
      },
    },
    {
      title: "Ligações",
      links: [
        ...r.transformationIds.map((id) => ({
          label: `Transformação ${inca.findTransformation(id)?.code ?? id}`,
          entity: "transformacoes",
          id,
        })),
        ...r.packageIds.map((id) => ({
          label: `Embalagem ${inca.findPackaging(id)?.code ?? id}`,
          entity: "embalagens",
          id,
        })),
      ],
    },
  ],
};

const transformationsEntity: EntityConfig<inca.Transformation> = {
  key: "transformacoes",
  label: "Transformações",
  singular: "Transformação",
  group: "Processamento",
  icon: Factory,
  rows: () => inca.transformations,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.transformationTypeName} · lote ${r.lotCode}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.lotCode} ${r.transformationTypeName}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Pendente", "Em Progresso", "Concluída", "Cancelada"],
      match: (r, v) => r.status === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "lot", label: "Lote", render: (r) => r.lotCode },
    { key: "type", label: "Tipo", hideOnMobile: true, render: (r) => `${r.transformationTypeName} v${r.versionNumber}` },
    { key: "progress", label: "Progresso", render: (r) => `${r.progress}%` },
  ],
  sections: (r) => [
    {
      title: "Processo",
      fields: [
        { label: "Código", value: r.code },
        { label: "Tipo", value: `${r.transformationTypeName} (v${r.versionNumber})` },
        { label: "Lote", value: r.lotCode },
        { label: "Início", value: r.startedAt?.slice(0, 10) ?? "—" },
        { label: "Fim", value: r.finishedAt?.slice(0, 10) ?? "—" },
        { label: "Progresso", value: `${r.progress}%` },
        { label: "Notas", value: r.notes ?? "—", full: true },
      ],
    },
    {
      title: "Etapas",
      table: {
        columns: [
          { key: "order", label: "#", render: (s: any) => s.order },
          { key: "phase", label: "Fase", render: (s: any) => s.phaseName },
          { key: "feature", label: "Actividade", render: (s: any) => s.featureName },
          { key: "exec", label: "Executado por", render: (s: any) => s.executedBy ?? "—" },
          { key: "fim", label: "Concluída em", render: (s: any) => s.finishedAt?.slice(0, 10) ?? "—" },
        ],
        rows: r.steps,
      },
    },
    ...(r.reception
      ? [
          {
            title: "Dados de recepção",
            fields: [
              { label: "Peso recebido", value: kg(r.reception.receivedWeightKg) },
              { label: "Humidade", value: `${r.reception.humidity}%` },
              { label: "Temperatura", value: `${r.reception.temperature} °C` },
              { label: "Defeitos visuais", value: r.reception.visualDefectsNotes ?? "—", full: true },
            ],
          },
        ]
      : []),
    ...(r.drying
      ? [
          {
            title: "Secagem",
            fields: [
              { label: "Método", value: r.drying.method },
              { label: "Início", value: r.drying.startDate },
              { label: "Fim", value: r.drying.endDate },
              { label: "Humidade final", value: `${r.drying.finalHumidity}%` },
            ],
          },
        ]
      : []),
    ...(r.classification
      ? [
          {
            title: "Boletim de classificação",
            fields: [
              { label: "Crivo", value: r.classification.screenSize },
              { label: "Defeitos", value: r.classification.defectsCount },
              { label: "Prova de chávena", value: r.classification.cuppingScore },
              { label: "Aroma", value: r.classification.aroma },
              { label: "Acidez", value: r.classification.acidity },
              { label: "Corpo", value: r.classification.body },
              { label: "Sabor", value: r.classification.flavor },
              { label: "Grau final", value: <StatusBadge status={r.classification.finalGrade} /> },
            ],
          },
        ]
      : []),
    {
      title: "Histórico",
      table: {
        columns: [
          { key: "date", label: "Data", render: (h: any) => h.performedAt.slice(0, 10) },
          { key: "action", label: "Acção", render: (h: any) => h.action },
          { key: "status", label: "Novo estado", render: (h: any) => <StatusBadge status={h.newStatus} /> },
          { key: "by", label: "Por", render: (h: any) => h.performedBy },
        ],
        rows: r.history,
      },
    },
    { title: "Ligações", links: [{ label: `Lote ${r.lotCode}`, entity: "lotes", id: r.lotId }] },
  ],
};

const packagingEntity: EntityConfig<inca.LotPackaging> = {
  key: "embalagens",
  label: "Embalagens",
  singular: "Embalagem",
  group: "Processamento",
  icon: Package,
  rows: () => inca.lotPackagings,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.packagingType.name} · lote ${r.processingLotCode}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.qrCode} ${r.lotNumber} ${r.processingLotCode}`,
  filters: [
    { key: "status", label: "Estado", options: ["Activa", "Encerrada", "Cancelada"], match: (r, v) => r.status === v },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "lot", label: "Lote", render: (r) => r.processingLotCode },
    { key: "type", label: "Tipo", hideOnMobile: true, render: (r) => r.packagingType.name },
    { key: "weight", label: "Peso total", render: (r) => kg(r.totalWeightKg) },
  ],
  sections: (r) => [
    {
      title: "Embalagem",
      fields: [
        { label: "Código", value: r.code },
        { label: "QR", value: r.qrCode },
        { label: "N.º de lote", value: r.lotNumber },
        { label: "Data", value: r.packagingDate },
        { label: "Tipo", value: `${r.packagingType.name} (${r.packagingType.material})` },
        { label: "Unidades", value: `${r.quantity} × ${r.unitWeightKg} kg` },
        { label: "Peso total", value: kg(r.totalWeightKg) },
        { label: "Notas", value: r.notes ?? "—", full: true },
      ],
    },
    {
      title: "Posição em armazém",
      table: {
        columns: [
          { key: "arm", label: "Armazém", render: (s: any) => s.warehouseName },
          { key: "qtd", label: "Unidades", render: (s: any) => s.quantity },
          { key: "peso", label: "Peso", render: (s: any) => kg(s.weightKg) },
          { key: "estado", label: "Estado", render: (s: any) => <StatusBadge status={s.status} /> },
        ],
        rows: inca.warehouseStorages.filter((s) => s.lotPackagingId === r.id),
      },
    },
    { title: "Ligações", links: [{ label: `Lote ${r.processingLotCode}`, entity: "lotes", id: r.processingLotId }] },
  ],
};

const warehousesEntity: EntityConfig<inca.CoffeeWarehouse> = {
  key: "armazens",
  label: "Armazéns",
  singular: "Armazém",
  group: "Armazém",
  icon: Warehouse,
  rows: () => inca.coffeeWarehouses,
  id: (r) => r.id,
  title: (r) => r.name,
  subtitle: (r) => r.code,
  status: (r) => (r.isActive ? "Activo" : "Inactivo"),
  searchText: (r) => `${r.name} ${r.code} ${r.location.province}`,
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "name", label: "Armazém", render: (r) => r.name },
    { key: "loc", label: "Localização", hideOnMobile: true, render: (r) => place(r.location) },
    { key: "stock", label: "Stock", render: (r) => kg(r.storedWeightKg) },
  ],
  sections: (r) => [
    {
      title: "Armazém",
      fields: [
        { label: "Código", value: r.code },
        { label: "Nome", value: r.name },
        { label: "Responsável", value: r.responsibleName },
        { label: "Localização", value: place(r.location) },
        { label: "Capacidade", value: kg(r.capacityKg) },
        { label: "Stock armazenado", value: kg(r.storedWeightKg) },
        { label: "Capacidade disponível", value: kg(r.availableCapacityKg) },
      ],
    },
    {
      title: "Stock actual",
      table: {
        columns: [
          { key: "emb", label: "Embalagem", render: (s: any) => s.lotPackagingCode },
          { key: "qtd", label: "Unidades", render: (s: any) => s.quantity },
          { key: "peso", label: "Peso", render: (s: any) => kg(s.weightKg) },
          { key: "data", label: "Entrada", render: (s: any) => s.entryDate },
        ],
        rows: inca.warehouseStorages.filter((s) => s.warehouseId === r.id),
      },
    },
  ],
};

const storageEntity: EntityConfig<inca.WarehouseStorage> = {
  key: "stock",
  label: "Posições de stock",
  singular: "Posição de stock",
  group: "Armazém",
  icon: Boxes,
  rows: () => inca.warehouseStorages,
  id: (r) => r.id,
  title: (r) => `${r.lotPackagingCode} @ ${r.warehouseName}`,
  status: (r) => r.status,
  searchText: (r) => `${r.lotPackagingCode} ${r.warehouseName}`,
  columns: [
    { key: "emb", label: "Embalagem", render: (r) => bold(r.lotPackagingCode) },
    { key: "arm", label: "Armazém", render: (r) => r.warehouseName },
    { key: "peso", label: "Peso", render: (r) => kg(r.weightKg) },
    { key: "data", label: "Entrada", hideOnMobile: true, render: (r) => r.entryDate },
  ],
  sections: (r) => [
    {
      title: "Posição",
      fields: [
        { label: "Embalagem", value: r.lotPackagingCode },
        { label: "Armazém", value: `${r.warehouseName} (${r.warehouseCode})` },
        { label: "Unidades", value: r.quantity },
        { label: "Peso", value: kg(r.weightKg) },
        { label: "Entrada", value: r.entryDate },
        { label: "Temperatura", value: r.temperature ? `${r.temperature} °C` : "—" },
        { label: "Humidade", value: r.humidity ? `${r.humidity}%` : "—" },
      ],
    },
    { title: "Ligações", links: [{ label: "Ver embalagem", entity: "embalagens", id: r.lotPackagingId }] },
  ],
};

const movementsEntity: EntityConfig<inca.WarehouseMovement> = {
  key: "movimentos",
  label: "Movimentos de armazém",
  singular: "Movimento",
  group: "Armazém",
  icon: Scale,
  rows: () => inca.warehouseMovements,
  id: (r) => r.id,
  title: (r) => `${r.movementType} — ${r.lotPackagingCode}`,
  status: (r) => r.movementType,
  searchText: (r) => `${r.lotPackagingCode} ${r.movementType} ${r.responsibleName}`,
  filters: [
    {
      key: "tipo",
      label: "Tipo",
      options: ["Entrada", "Transferência", "Saída", "Ajuste"],
      match: (r, v) => r.movementType === v,
    },
  ],
  columns: [
    { key: "date", label: "Data", render: (r) => bold(r.movementDate) },
    { key: "emb", label: "Embalagem", render: (r) => r.lotPackagingCode },
    { key: "peso", label: "Peso", render: (r) => kg(r.weightKg) },
    { key: "resp", label: "Responsável", hideOnMobile: true, render: (r) => r.responsibleName },
  ],
  sections: (r) => [
    {
      title: "Movimento",
      fields: [
        { label: "Tipo", value: r.movementType },
        { label: "Data", value: r.movementDate },
        { label: "Embalagem", value: r.lotPackagingCode },
        { label: "Unidades", value: r.quantity },
        { label: "Peso", value: kg(r.weightKg) },
        { label: "Origem", value: inca.findCoffeeWarehouse(r.sourceWarehouseId)?.name ?? "—" },
        { label: "Destino", value: inca.findCoffeeWarehouse(r.destinationWarehouseId)?.name ?? r.destination ?? "—" },
        { label: "Responsável", value: r.responsibleName },
        { label: "Notas", value: r.notes ?? "—", full: true },
      ],
    },
  ],
};

const marketEntity: EntityConfig<inca.MarketDataPoint> = {
  key: "mercado",
  label: "Mercado",
  singular: "Indicador",
  group: "Referência",
  icon: LineChart,
  rows: () => inca.marketData,
  id: (r) => r.id,
  title: (r) => r.indicatorName,
  subtitle: (r) => r.locationName,
  searchText: (r) => `${r.indicatorName} ${r.locationName} ${r.sourceName}`,
  columns: [
    { key: "ind", label: "Indicador", render: (r) => bold(r.indicatorName) },
    { key: "val", label: "Valor", render: (r) => `${r.value.toLocaleString("pt-AO")} ${r.unitSymbol}` },
    { key: "loc", label: "Local", render: (r) => r.locationName },
    { key: "date", label: "Referência", hideOnMobile: true, render: (r) => r.referenceDate },
  ],
  sections: (r) => [
    {
      title: "Indicador de mercado",
      fields: [
        { label: "Código", value: r.indicatorCode },
        { label: "Indicador", value: r.indicatorName },
        { label: "Valor", value: `${r.value.toLocaleString("pt-AO")} ${r.unitSymbol}` },
        { label: "Fonte", value: r.sourceName },
        { label: "Âmbito", value: r.locationScope },
        { label: "Local", value: r.locationName },
        { label: "Data de referência", value: r.referenceDate },
        { label: "Notas", value: r.notes ?? "—", full: true },
      ],
    },
  ],
};

const varietiesEntity: EntityConfig<inca.CoffeeVariety> = {
  key: "variedades",
  label: "Espécies e variedades",
  singular: "Variedade",
  group: "Referência",
  icon: Coffee,
  rows: () => inca.coffeeVarieties,
  id: (r) => r.id,
  title: (r) => r.varietyName,
  subtitle: (r) => inca.coffeeSpecies.find((s) => s.id === r.coffeeSpeciesId)?.commonName,
  searchText: (r) => `${r.varietyName} ${r.commonName}`,
  columns: [
    { key: "name", label: "Variedade", render: (r) => bold(r.varietyName) },
    {
      key: "sp",
      label: "Espécie",
      render: (r) => inca.coffeeSpecies.find((s) => s.id === r.coffeeSpeciesId)?.commonName ?? "—",
    },
    { key: "prof", label: "Perfil sensorial", hideOnMobile: true, render: (r) => r.sensoryProfile },
  ],
  sections: (r) => {
    const sp = inca.coffeeSpecies.find((s) => s.id === r.coffeeSpeciesId);
    const cat = (id: string, list: inca.CatalogItem[]) => list.find((c) => c.id === id)?.name ?? "—";
    return [
      {
        title: "Variedade",
        fields: [
          { label: "Nome", value: r.varietyName },
          { label: "Nome comum", value: r.commonName },
          { label: "Espécie", value: `${sp?.commonName} (${sp?.scientificName})` },
          { label: "Porte", value: cat(r.plantSizeId, inca.plantSizes) },
          { label: "Maturação", value: cat(r.maturationId, inca.maturations) },
          { label: "Resistência a pragas", value: cat(r.pestResistanceId, inca.resistanceLevels) },
          { label: "Resistência à seca", value: cat(r.droughtResistanceId, inca.resistanceLevels) },
          { label: "Perfil sensorial", value: r.sensoryProfile, full: true },
          { label: "Descrição", value: r.description, full: true },
        ],
      },
    ];
  },
};

const usersEntity: EntityConfig<inca.UserProfile> = {
  key: "utilizadores",
  label: "Utilizadores e perfis",
  singular: "Utilizador",
  group: "Referência",
  icon: Users,
  rows: () => inca.users,
  id: (r) => r.id,
  title: (r) => r.fullName,
  subtitle: (r) => r.role.name,
  searchText: (r) => `${r.fullName} ${r.role.name} ${r.contact.email}`,
  columns: [
    { key: "name", label: "Nome", render: (r) => bold(r.fullName) },
    { key: "role", label: "Perfil", render: (r) => r.role.name },
    { key: "email", label: "Email", hideOnMobile: true, render: (r) => r.contact.email },
  ],
  sections: (r) => [
    {
      title: "Utilizador",
      fields: [
        { label: "Nome", value: r.fullName },
        { label: "Perfil", value: `${r.role.name} (${r.role.code})` },
        { label: "Email", value: r.contact.email },
        { label: "Telefone", value: r.contact.phone },
        { label: "Documento", value: `${r.identification.type} ${r.identification.number}` },
        { label: "Endereço", value: `${r.address.street}, ${r.address.municipality} — ${r.address.province}` },
      ],
    },
  ],
};

/* ------------------------------------------------------------- agregados */

const dashboard = (): DashboardData => {
  const totalHarvest = inca.harvests.reduce((sum, h) => sum + h.quantity, 0);
  const processed = inca.processingLots.reduce((sum, l) => sum + l.quantity, 0);
  const packaged = inca.lotPackagings.reduce((sum, p) => sum + p.totalWeightKg, 0);
  const stored = inca.warehouseStorages.reduce((sum, s) => sum + s.weightKg, 0);

  const bySpecies = ["Robusta", "Arábica"].map((name) => ({
    name,
    value: inca.processingLots.filter((l) => l.speciesName === name).reduce((sum, l) => sum + l.quantity, 0),
  }));

  const byStatus = [...new Set(inca.processingLots.map((l) => l.status))].map((name) => ({
    name,
    value: inca.processingLots.filter((l) => l.status === name).length,
  }));

  const byProvince = [...new Set(inca.farms.map((f) => f.location.province))].map((name) => ({
    name,
    value: inca.farms.filter((f) => f.location.province === name).reduce((sum, f) => sum + f.area, 0),
  }));

  const monthly = ["Abr", "Mai", "Jun"].map((name, index) => ({
    name,
    value: inca.harvests
      .filter((h) => Number(h.date.slice(5, 7)) === index + 4)
      .reduce((sum, h) => sum + h.quantity, 0),
  }));

  return {
    cards: [
      { label: "Produtores", value: inca.farmers.length, icon: Users, tone: "primary" },
      { label: "Explorações", value: inca.farms.length, icon: Tractor, tone: "success" },
      { label: "Parcelas", value: inca.plots.length, icon: Sprout, tone: "info" },
      { label: "Colheitas", value: inca.harvests.length, icon: Leaf, tone: "accent" },
      { label: "Café colhido", value: kg(totalHarvest), icon: Coffee, tone: "primary" },
      { label: "Em processamento", value: kg(processed), icon: Factory, tone: "warning" },
      { label: "Embalado", value: kg(packaged), icon: Package, tone: "info" },
      { label: "Em armazém", value: kg(stored), icon: Warehouse, tone: "success" },
    ],
    charts: [
      { title: "Peso processado por espécie (kg)", type: "bar", data: bySpecies },
      { title: "Lotes por estado", type: "pie", data: byStatus },
      { title: "Área de exploração por província (ha)", type: "bar", data: byProvince },
      { title: "Colheita por mês (kg)", type: "line", data: monthly },
    ],
    activity: [
      ...inca.processingLots.flatMap((lot) =>
        lot.history.map((h) => ({ date: h.date, label: `${lot.code}: ${h.description}`, type: h.operation })),
      ),
      ...inca.warehouseMovements.map((m) => ({
        date: m.movementDate,
        label: `${m.movementType} de ${m.lotPackagingCode} (${kg(m.weightKg)})`,
        type: "Armazém",
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8),
  };
};

const mapPoints = (): MapPoint[] => [
  ...inca.farmers
    .filter((p) => p.profile.location.latitude && p.profile.location.longitude)
    .map((p) => ({
      id: p.id,
      kind: "farmer",
      title: p.profile.fullName,
      subtitle: `${p.registryCode} · ${p.profile.location.municipality ?? ""}, ${p.profile.location.province}`,
      status: p.isActive ? "Activo" : "Inactivo",
      coordinate: { latitude: p.profile.location.latitude ?? 0, longitude: p.profile.location.longitude ?? 0 },
      province: p.profile.location.province,
      municipality: p.profile.location.municipality,
    })),
  ...inca.coffeeWarehouses.map((w) => ({
    id: w.id,
    kind: "warehouse",
    title: w.name,
    subtitle: `${w.code} · ${kg(w.storedWeightKg)}`,
    coordinate: { latitude: w.location.latitude ?? 0, longitude: w.location.longitude ?? 0 },
    province: w.location.province,
    municipality: w.location.municipality,
  })),
];

const farmPolygon = (longitude: number, latitude: number, area: number, index: number): [number, number][] => {
  const radius = 0.018 + Math.sqrt(area) * 0.0022;
  const points = index % 2 === 0 ? 9 : 11;
  return Array.from({ length: points }, (_, pointIndex) => {
    const angle = (Math.PI * 2 * pointIndex) / points;
    const variation = 0.76 + ((pointIndex * 7 + index * 3) % 5) * 0.06;
    return [
      longitude + Math.cos(angle) * radius * variation,
      latitude + Math.sin(angle) * radius * variation * 0.78,
    ];
  });
};

const mapAreas = (): MapArea[] => inca.farms.map((farm, farmIndex) => {
  const farmPlots = inca.plots.filter((plot) => plot.farmId === farm.id);
  return {
    id: farm.id,
    code: farm.code,
    title: farm.name,
    province: farm.location.province,
    municipality: farm.location.municipality,
    areaHectares: farm.area,
    verdict: farm.status === "Validated" ? "Conforme" : farm.status === "Rejected" ? "NaoConforme" : "ConformeComReserva",
    polygon: farmPolygon(farm.location.longitude ?? 17.87, farm.location.latitude ?? -11.2, farm.area, farmIndex),
    concessions: farmPlots.map((plot) => {
      const plotHarvests = inca.harvests.filter((harvest) => harvest.plotId === plot.id);
      return {
        id: plot.id,
        code: plot.code,
        operator: farm.coffeeFarmerName,
        occupiedHectares: plot.area,
        status: plot.isActive ? "Activo" : "Inactivo",
        blocks: plotHarvests.map((harvest) => ({
          code: harvest.code,
          hectares: plot.area / Math.max(plotHarvests.length, 1),
          detail: `${harvest.quantity.toLocaleString("pt-AO")} ${harvest.unit} · ${statusLabel(harvest.status)}`,
        })),
      };
    }),
    overlaps: [],
  };
});

const trace = (code: string): TraceChain | null => {
  const data = inca.getPackageTraceability(code);
  if (!data) return null;
  const lot = inca.findLot(data.lot.id)!;
  return {
    entryLabel: "Embalagem",
    entryReference: data.packaging.code,
    nodes: [
      {
        id: lot.producerId,
        label: "Produtor",
        reference: lot.producerName,
        detail: lot.farmName,
        link: `/cafe/produtores/${lot.producerId}`,
      },
      { id: lot.farmId, label: "Exploração", reference: lot.farmName, link: `/cafe/fazendas/${lot.farmId}` },
      { id: lot.plotId, label: "Parcela", reference: lot.plotCode, link: `/cafe/parcelas/${lot.plotId}` },
      {
        id: lot.harvestId,
        label: "Colheita",
        reference: lot.harvestCode,
        detail: kg(lot.initialQuantity),
        link: `/cafe/colheitas/${lot.harvestId}`,
      },
      {
        id: lot.id,
        label: "Lote em processamento",
        reference: lot.code,
        detail: `${lot.coffeeName} · ${statusLabel(lot.status)}`,
        link: `/cafe/lotes/${lot.id}`,
      },
      ...(data.transformation
        ? [
            {
              id: data.transformation.id,
              label: "Transformação",
              reference: data.transformation.code,
              detail: `${data.transformation.transformationTypeName} · ${statusLabel(data.transformation.status)}`,
              link: `/cafe/transformacoes/${data.transformation.id}`,
            },
          ]
        : []),
      {
        id: data.packaging.id,
        label: "Embalagem",
        reference: data.packaging.code,
        detail: `${data.packaging.quantity} × ${data.packaging.unitWeightKg} kg`,
        link: `/cafe/embalagens/${data.packaging.id}`,
      },
      ...(data.currentStorage
        ? [
            {
              id: data.currentStorage.warehouseId,
              label: "Armazém",
              reference: data.currentStorage.warehouseName,
              detail: `${kg(data.currentStorage.weightKg)} desde ${data.currentStorage.entryDate}`,
              link: `/cafe/armazens/${data.currentStorage.warehouseId}`,
            },
          ]
        : []),
      ...data.movements.map((m) => ({
        id: m.id,
        label: `Movimento — ${m.movementType}`,
        reference: m.movementDate,
        detail: `${kg(m.weightKg)} · ${m.responsibleName}`,
        link: `/cafe/movimentos/${m.id}`,
      })),
    ],
  };
};

export const incaDomain: DomainConfig = {
  key: "cafe",
  label: "Café — INCA",
  short: "Café",
  description: "Cadeia do café: produtor, exploração, parcela, colheita, processamento, embalagem e armazém.",
  icon: Coffee,
  available: true,
  entities: [
    farmersEntity,
    farmsEntity,
    plotsEntity,
    harvestsEntity,
    maintenanceEntity,
    lotsEntity,
    transformationsEntity,
    packagingEntity,
    warehousesEntity,
    storageEntity,
    movementsEntity,
    marketEntity,
    varietiesEntity,
    usersEntity,
  ],
  dashboard,
  mapKinds: [
    { kind: "area", label: "Explorações" },
    { kind: "farmer", label: "Produtores" },
    { kind: "warehouse", label: "Armazéns" },
  ],
  mapPoints,
  mapAreas,
  mapLabels: {
    searchPlaceholder: "Pesquisar exploração, parcela, produtor ou armazém",
    areaSingular: "Exploração",
    areaPlural: "Explorações",
    subAreaSingular: "Parcela",
    subAreaPlural: "Parcelas",
    blockSingular: "Colheita",
    blockPlural: "Colheitas",
    ownerLabel: "Produtor",
    occupiedLabel: "Em parcelas",
    availableLabel: "Sem parcela",
    overlapLabel: "Ocorrências territoriais",
    overlapButtonLabel: "Parcelas",
  },
  traceOptions: () =>
    inca.lotPackagings.map((p) => ({
      id: p.code,
      label: `${p.code} — ${p.processingLotCode}`,
      hint: `${p.packagingType.name} · ${kg(p.totalWeightKg)}`,
    })),
  trace,
};

export const incaMapIcon = MapPinned;
