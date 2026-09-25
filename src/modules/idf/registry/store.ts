import { useSyncExternalStore } from "react";
import type {
  AreaRegistryDto,
  EnforcementRecordDto,
  FieldOfficerDto,
  LngLat,
  QuotaMatrixRowDto,
  RecognizedEntityDto,
  StandaloneLicenseDto,
  TransporterDto,
} from "@/modules/idf/registry/types";

/** Área esférica de um polígono em hectares — sempre calculada, nunca introduzida. */
export const polygonAreaHectares = (polygon: LngLat[]): number => {
  if (polygon.length < 3) return 0;
  const R = 6378137;
  const rad = Math.PI / 180;
  let total = 0;
  for (let i = 0; i < polygon.length; i += 1) {
    const [x1, y1] = polygon[i];
    const [x2, y2] = polygon[(i + 1) % polygon.length];
    total += (x2 - x1) * rad * (2 + Math.sin(y1 * rad) + Math.sin(y2 * rad));
  }
  return Math.abs((total * R * R) / 2) / 10000;
};

export const polygonCentroid = (polygon: LngLat[]): LngLat => {
  if (!polygon.length) return [17.87, -11.2];
  const sum = polygon.reduce<LngLat>((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
  return [sum[0] / polygon.length, sum[1] / polygon.length];
};

const uid = () => Math.random().toString(36).slice(2, 10);

const box = (lng: number, lat: number, d = 0.12): LngLat[] => [
  [lng - d, lat - d],
  [lng + d, lat - d],
  [lng + d * 0.7, lat + d],
  [lng - d, lat + d * 0.8],
];

const area = (
  code: string,
  designation: string,
  province: string,
  municipality: string,
  polygon: LngLat[],
  verdict: AreaRegistryDto["verdict"],
  overlaps: AreaRegistryDto["overlaps"],
  legalSituation: string,
): AreaRegistryDto => ({
  id: uid(),
  code,
  designation,
  province,
  municipality,
  polygon,
  areaHectares: Math.round(polygonAreaHectares(polygon)),
  legalSituation,
  sketchFile: null,
  descriptiveMemoryFile: null,
  overlaps,
  verdict,
  createdAt: new Date().toISOString(),
});

export interface RegistryState {
  areas: AreaRegistryDto[];
  entities: RecognizedEntityDto[];
  transporters: TransporterDto[];
  officers: FieldOfficerDto[];
  licenses: StandaloneLicenseDto[];
  quotaMatrix: QuotaMatrixRowDto[];
  enforcement: EnforcementRecordDto[];
}

const seed = (): RegistryState => ({
  areas: [
    area("ARE-2026-001", "Mata do Cuanza — Bloco A", "Cuanza Sul", "Mussende", box(15.4, -10.5), "Conforme", [
      { layer: "Áreas protegidas (INBAC)", verdict: "Conforme", note: "Sem intersecção.", overlapHectares: 0 },
      { layer: "Cadastro mineiro", verdict: "Conforme", note: "Sem intersecção.", overlapHectares: 0 },
    ], "Terreno do domínio privado do Estado, livre de ónus."),
    area("ARE-2026-002", "Floresta do Moxico — Lote 14", "Moxico", "Luchazes", box(21.8, -12.6), "ConformeComReserva", [
      { layer: "Corredor de fauna KAZA", verdict: "ConformeComReserva", note: "Sobreposição parcial a norte.", overlapHectares: 320 },
      { layer: "Áreas protegidas (INBAC)", verdict: "Conforme", note: "Sem intersecção.", overlapHectares: 0 },
    ], "Terreno comunitário com acordo de uso assinado."),
    area("ARE-2026-003", "Maiombe — Sector Norte", "Cabinda", "Belize", box(12.6, -4.6, 0.08), "NaoConforme", [
      { layer: "Parque Nacional do Maiombe", verdict: "NaoConforme", note: "Sobreposição integral com área de protecção total.", overlapHectares: 1450 },
    ], "Terreno integrado em área de conservação."),
    area("ARE-2026-004", "Planalto do Bié — Bloco C", "Bié", "Camacupa", box(17.5, -12.0), "Conforme", [
      { layer: "Cadastro agrícola", verdict: "Conforme", note: "Sem intersecção.", overlapHectares: 0 },
    ], "Concessão de terra rural registada."),
    area("ARE-2026-005", "Uíge — Mata do Zombo", "Uíge", "Songo", box(15.1, -7.3), "ConformeComReserva", [
      { layer: "Cadastro agrícola", verdict: "ConformeComReserva", note: "Sobreposição com perímetro cafeícola.", overlapHectares: 96 },
    ], "Terreno com uso agrícola parcial declarado."),
    area("ARE-2026-006", "Lunda Sul — Bloco Chitato", "Lunda Sul", "Muconda", box(20.9, -9.8), "Conforme", [
      { layer: "Cadastro mineiro", verdict: "Conforme", note: "Sem intersecção.", overlapHectares: 0 },
    ], "Terreno do domínio privado do Estado."),
    area("ARE-2026-007", "Cuando — Margem do Cuito", "Cuando", "Dirico", box(20.2, -17.9), "NaoConforme", [
      { layer: "Zona húmida RAMSAR", verdict: "NaoConforme", note: "Área integralmente em zona húmida protegida.", overlapHectares: 2100 },
    ], "Terreno em zona húmida sob protecção internacional."),
  ],
  entities: [
    {
      id: uid(),
      name: "Verde Angola Consultores, Lda.",
      taxIdentificationNumber: "5417004321",
      scopes: ["Inventário florestal", "Plano de gestão", "Zoneamento"],
      staff: [
        { id: uid(), name: "Amélia Kiala", education: "Eng.ª Florestal", licenceNumber: "OEA-3421", yearsOfExperience: 12 },
        { id: uid(), name: "Nuno Bengui", education: "Eng.º Ambiental", licenceNumber: "OEA-2988", yearsOfExperience: 8 },
      ],
      academicCertificates: null,
      registryValidUntil: "2027-03-31",
      status: "Activo",
    },
    {
      id: uid(),
      name: "Instituto Técnico Miombo",
      taxIdentificationNumber: "5417118820",
      scopes: ["Inventário florestal", "Plano de exploração", "Estudo faunístico"],
      staff: [{ id: uid(), name: "Teresa Domingos", education: "Bióloga", licenceNumber: "OB-1120", yearsOfExperience: 15 }],
      academicCertificates: null,
      registryValidUntil: "2026-12-31",
      status: "Activo",
    },
    {
      id: uid(),
      name: "GeoFloresta Serviços, S.A.",
      taxIdentificationNumber: "5410092233",
      scopes: ["Zoneamento", "EIA", "Plano de gestão"],
      staff: [{ id: uid(), name: "Paulo Sampaio", education: "Geógrafo", licenceNumber: "OG-0455", yearsOfExperience: 20 }],
      academicCertificates: null,
      registryValidUntil: "2028-06-30",
      status: "Activo",
    },
    {
      id: uid(),
      name: "Apilanga — Estudos Apícolas",
      taxIdentificationNumber: "5401774411",
      scopes: ["Estudo apícola", "Estudo faunístico"],
      staff: [{ id: uid(), name: "Joana Cassule", education: "Eng.ª Agrónoma", licenceNumber: "OEA-5510", yearsOfExperience: 6 }],
      academicCertificates: null,
      registryValidUntil: "2027-01-15",
      status: "Activo",
    },
    {
      id: uid(),
      name: "Consultec Florestal, Lda.",
      taxIdentificationNumber: "5411220098",
      scopes: ["Inventário florestal", "Plano de gestão"],
      staff: [{ id: uid(), name: "Hélder Muanza", education: "Eng.º Florestal", licenceNumber: "OEA-1877", yearsOfExperience: 10 }],
      academicCertificates: null,
      registryValidUntil: "2026-02-28",
      status: "Suspenso",
    },
    {
      id: uid(),
      name: "EcoSul Estudos Ambientais",
      taxIdentificationNumber: "5419983311",
      scopes: ["EIA", "Zoneamento"],
      staff: [{ id: uid(), name: "Isabel Nzita", education: "Eng.ª Ambiental", licenceNumber: "OEA-2211", yearsOfExperience: 9 }],
      academicCertificates: null,
      registryValidUntil: "2025-11-30",
      status: "Caducado",
    },
  ],
  transporters: [
    {
      id: uid(),
      name: "Translog Angola, Lda.",
      taxIdentificationNumber: "5417330011",
      transportLicenceFile: null,
      vehicles: [
        { id: uid(), plate: "LD-45-77-AB", type: "Camião porta-toros", tareTons: 12, capacityTons: 30, regime: "Próprio", status: "Activo" },
        { id: uid(), plate: "LD-90-12-CD", type: "Semi-reboque", tareTons: 9, capacityTons: 26, regime: "Contratado", status: "Activo" },
      ],
    },
    {
      id: uid(),
      name: "Rodoflora Transportes",
      taxIdentificationNumber: "5411229987",
      transportLicenceFile: null,
      vehicles: [
        { id: uid(), plate: "MX-11-03-EF", type: "Camião porta-toros", tareTons: 13, capacityTons: 32, regime: "Próprio", status: "Activo" },
        { id: uid(), plate: "MX-22-08-GH", type: "Camião de caixa aberta", tareTons: 7, capacityTons: 15, regime: "Próprio", status: "Suspenso" },
      ],
    },
    {
      id: uid(),
      name: "Cuanza Cargas, S.A.",
      taxIdentificationNumber: "5410098877",
      transportLicenceFile: null,
      vehicles: [{ id: uid(), plate: "CS-33-19-IJ", type: "Semi-reboque", tareTons: 10, capacityTons: 28, regime: "Contratado", status: "Activo" }],
    },
    {
      id: uid(),
      name: "Bié Logística Florestal",
      taxIdentificationNumber: "5418844220",
      transportLicenceFile: null,
      vehicles: [{ id: uid(), plate: "BI-05-64-KL", type: "Camião porta-toros", tareTons: 12, capacityTons: 30, regime: "Próprio", status: "Apreendido" }],
    },
    {
      id: uid(),
      name: "Uíge Trans Madeira",
      taxIdentificationNumber: "5412007766",
      transportLicenceFile: null,
      vehicles: [{ id: uid(), plate: "UG-77-41-MN", type: "Camião de caixa aberta", tareTons: 6, capacityTons: 14, regime: "Contratado", status: "Activo" }],
    },
    {
      id: uid(),
      name: "Kalandula Frota, Lda.",
      taxIdentificationNumber: "5413355990",
      transportLicenceFile: null,
      vehicles: [{ id: uid(), plate: "ML-18-52-OP", type: "Semi-reboque", tareTons: 11, capacityTons: 27, regime: "Próprio", status: "Activo" }],
    },
  ],
  officers: [
    { id: uid(), name: "Domingos Kapenda", type: "Fiscal residente", concessionCode: "CON-CS-2025-001", swearingDate: "2024-05-12", mobileDevice: "IDF-TAB-011", credentialValidUntil: "2027-05-12", status: "Activo" },
    { id: uid(), name: "Esperança Tchivinda", type: "Fiscal privativo juramentado", concessionCode: "CON-CS-2025-001", swearingDate: "2024-09-03", mobileDevice: "IDF-TAB-024", credentialValidUntil: "2026-09-03", status: "Activo" },
    { id: uid(), name: "Manuel Sacala", type: "Fiscal residente", concessionCode: "CON-MX-2025-014", swearingDate: "2023-11-20", mobileDevice: "IDF-TAB-007", credentialValidUntil: "2026-01-31", status: "Caducado" },
    { id: uid(), name: "Ana Ndolo", type: "Fiscal do IDF", concessionCode: "", swearingDate: "2022-02-14", mobileDevice: "IDF-TAB-002", credentialValidUntil: "2027-02-14", status: "Activo" },
    { id: uid(), name: "Jorge Bumba", type: "Fiscal do IDF", concessionCode: "", swearingDate: "2023-06-01", mobileDevice: "IDF-TAB-015", credentialValidUntil: "2026-06-01", status: "Activo" },
    { id: uid(), name: "Lúcia Mateus", type: "Fiscal privativo juramentado", concessionCode: "CON-MX-2025-014", swearingDate: "2025-01-09", mobileDevice: "IDF-TAB-031", credentialValidUntil: "2028-01-09", status: "Suspenso" },
  ],
  licenses: [
    {
      id: uid(),
      kind: "Exploração florestal",
      licenseNumber: "LEF-2026-0001",
      applicantId: "",
      applicantName: "Madeiras do Kwanza, Lda.",
      campaignYear: 2026,
      province: "Cuanza Sul",
      areaRegistryId: "",
      species: [{ id: uid(), speciesCode: "PTE", speciesName: "Pau-ferro", volumeM3: 480 }],
      destination: "Transformação própria",
      processingUnit: "Serração Kwanza — Sumbe",
      quotaBalanceM3: 3200,
      feeAmount: 1_440_000,
      validUntil: "2026-12-31",
      status: "Activa",
    },
    {
      id: uid(),
      kind: "Lenha, carvão e PFNL",
      licenseNumber: "LCP-2026-0004",
      applicantId: "",
      applicantName: "Cooperativa Agroflorestal do Bié",
      campaignYear: 2026,
      province: "Bié",
      areaRegistryId: "",
      species: [{ id: uid(), speciesCode: "MSS", speciesName: "Mussivi", volumeM3: 120 }],
      destination: "Mercado interno",
      processingUnit: "",
      quotaBalanceM3: 900,
      feeAmount: 360_000,
      validUntil: "2026-08-31",
      status: "Aguarda pagamento",
    },
  ],
  quotaMatrix: [
    { id: uid(), year: 2026, province: "Cuanza Sul", speciesCode: "PTE", speciesName: "Pau-ferro", product: "Madeira em toro", totalVolumeM3: 12000, madangReserveM3: 3600, allocatedM3: 5400 },
    { id: uid(), year: 2026, province: "Cuanza Sul", speciesCode: "MSS", speciesName: "Mussivi", product: "Madeira em toro", totalVolumeM3: 8000, madangReserveM3: 2000, allocatedM3: 3100 },
    { id: uid(), year: 2026, province: "Moxico", speciesCode: "GRD", speciesName: "Girassonde", product: "Madeira em toro", totalVolumeM3: 15000, madangReserveM3: 4500, allocatedM3: 9200 },
    { id: uid(), year: 2026, province: "Moxico", speciesCode: "PTE", speciesName: "Pau-ferro", product: "Madeira serrada", totalVolumeM3: 6000, madangReserveM3: 1200, allocatedM3: 2400 },
    { id: uid(), year: 2026, province: "Bié", speciesCode: "MSS", speciesName: "Mussivi", product: "Lenha e carvão", totalVolumeM3: 4000, madangReserveM3: 800, allocatedM3: 1500 },
    { id: uid(), year: 2026, province: "Uíge", speciesCode: "GRD", speciesName: "Girassonde", product: "Madeira em toro", totalVolumeM3: 7000, madangReserveM3: 2100, allocatedM3: 2600 },
    { id: uid(), year: 2025, province: "Cuanza Sul", speciesCode: "PTE", speciesName: "Pau-ferro", product: "Madeira em toro", totalVolumeM3: 11000, madangReserveM3: 3300, allocatedM3: 10800 },
  ],
  enforcement: [
    { id: uid(), code: "PRC-2026-001", operatorId: "", operatorName: "Madeiras do Kwanza, Lda.", openedAt: "2026-02-11", subject: "Corte fora do talhão autorizado", phase: "Em prazo de defesa", underAppeal: false, fineAmount: 4_500_000 },
    { id: uid(), code: "PRC-2026-002", operatorId: "", operatorName: "Cooperativa Agroflorestal do Bié", openedAt: "2026-01-28", subject: "Guia de trânsito sem correspondência de volume", phase: "Multa liquidada", underAppeal: false, fineAmount: 1_200_000 },
    { id: uid(), code: "PRC-2025-047", operatorId: "", operatorName: "Serrações Unidas do Moxico", openedAt: "2025-10-04", subject: "Transporte de toro para fora da província", phase: "Condenado", underAppeal: true, fineAmount: 8_000_000 },
    { id: uid(), code: "PRC-2025-032", operatorId: "", operatorName: "Madeiras do Kwanza, Lda.", openedAt: "2025-06-19", subject: "Falta de fiscal residente", phase: "Sanado", underAppeal: false, fineAmount: 950_000 },
    { id: uid(), code: "PRC-2025-018", operatorId: "", operatorName: "Cooperativa Agroflorestal do Bié", openedAt: "2025-03-08", subject: "Auto sem elementos suficientes", phase: "Arquivado", underAppeal: false, fineAmount: 0 },
    { id: uid(), code: "PRC-2024-115", operatorId: "", operatorName: "Serrações Unidas do Moxico", openedAt: "2024-12-02", subject: "Multa vencida não paga", phase: "Execução", underAppeal: false, fineAmount: 6_300_000 },
  ],
});

let state: RegistryState = seed();
const listeners = new Set<() => void>();

const emit = () => {
  state = { ...state };
  listeners.forEach((l) => l());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useRegistry = (): RegistryState => useSyncExternalStore(subscribe, () => state, () => state);

export const registry = {
  get: () => state,
  addArea: (item: Omit<AreaRegistryDto, "id" | "createdAt">) => {
    state.areas = [{ ...item, id: uid(), createdAt: new Date().toISOString() }, ...state.areas];
    emit();
  },
  addEntity: (item: Omit<RecognizedEntityDto, "id">) => {
    state.entities = [{ ...item, id: uid() }, ...state.entities];
    emit();
  },
  addTransporter: (item: Omit<TransporterDto, "id">) => {
    state.transporters = [{ ...item, id: uid() }, ...state.transporters];
    emit();
  },
  addOfficer: (item: Omit<FieldOfficerDto, "id">) => {
    state.officers = [{ ...item, id: uid() }, ...state.officers];
    emit();
  },
  addLicense: (item: Omit<StandaloneLicenseDto, "id">) => {
    state.licenses = [{ ...item, id: uid() }, ...state.licenses];
    emit();
  },
  advanceLicense: (id: string, status: StandaloneLicenseDto["status"]) => {
    state.licenses = state.licenses.map((l) => (l.id === id ? { ...l, status } : l));
    emit();
  },
  newId: uid,
};

/** Regra: concessão sem fiscal residente activo bloqueia emissão. */
export const hasResidentOfficer = (concessionCode: string) =>
  state.officers.some((o) => o.type === "Fiscal residente" && o.status === "Activo" && o.concessionCode === concessionCode);

/** Regra: operador com processo não sanado tem renovação bloqueada. */
export const blockingEnforcement = (operatorName: string) =>
  state.enforcement.filter((e) => e.operatorName === operatorName && e.phase !== "Sanado" && e.phase !== "Arquivado");

export const activeVehicles = () =>
  state.transporters.flatMap((t) => t.vehicles.filter((v) => v.status === "Activo").map((v) => ({ transporter: t, vehicle: v })));
