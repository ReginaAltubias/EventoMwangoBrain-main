// Fluxo real de 9 fases (F0–F8) da Concessão Florestal por Contratação Simplificada.
// Fonte: SIGAFLO — Fluxo Digital com Cobranças (Modelo TO-BE), Setembro de 2026.
// 100% frontend: tipos + dados mock. Nenhuma chamada a API real.

export type FaseId = "F0" | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8";

export type EstadoProcesso =
  | "Rascunho"
  | "Protocolado"
  | "Em apreciação preliminar"
  | "Aguarda pagamento P1"
  | "Pagamento P1 confirmado"
  | "Em vistoria"
  | "Parecer provincial emitido"
  | "Parecer técnico central emitido"
  | "Aguardando decisão"
  | "Deferido"
  | "Indeferido"
  | "Em reclamação"
  | "Em negociação contratual"
  | "Aguarda pagamento P2"
  | "Contrato celebrado"
  | "Aguarda pagamento P3"
  | "Publicado"
  | "Alvará emitido"
  | "Encerrado";

// Acções possíveis do operador (nunca mais do que estas 6 categorias).
export type AccaoOperador =
  | "consultar"
  | "submeter"
  | "pagar"
  | "negociar"
  | "assinar"
  | "reportar";

export interface DefinicaoFase {
  id: FaseId;
  nome: string;
  estados: EstadoProcesso[];
  prazoTexto: string;
  prazoDias: number | null; // null = sem prazo fixado / contínuo
  accoes: AccaoOperador[];
  notaSistema?: string;
}

export const NOTA_SISTEMA =
  "Regra de sistema proposta, sem base expressa no Art. 66.º — sujeita a validação com o IDF.";

export const FASES: DefinicaoFase[] = [
  { id: "F0", nome: "Pedido e Protocolo", estados: ["Rascunho", "Protocolado"], prazoTexto: "Imediato", prazoDias: null, accoes: ["submeter"] },
  {
    id: "F1",
    nome: "Apreciação Preliminar",
    estados: ["Em apreciação preliminar"],
    prazoTexto: "5 dias úteis",
    prazoDias: 5,
    accoes: ["consultar"],
    notaSistema: NOTA_SISTEMA,
  },
  {
    id: "F2",
    nome: "Cobrança e Vistoria Técnica",
    estados: ["Aguarda pagamento P1", "Pagamento P1 confirmado", "Em vistoria"],
    prazoTexto: "Sem prazo fixado",
    prazoDias: null,
    accoes: ["pagar"],
    notaSistema: NOTA_SISTEMA,
  },
  { id: "F3", nome: "Parecer Provincial", estados: ["Parecer provincial emitido"], prazoTexto: "Sem prazo fixado", prazoDias: null, accoes: ["consultar"] },
  { id: "F4", nome: "Análise Central", estados: ["Parecer técnico central emitido", "Aguardando decisão"], prazoTexto: "10 dias úteis", prazoDias: 10, accoes: ["consultar"] },
  { id: "F5", nome: "Decisão", estados: ["Deferido", "Indeferido", "Em reclamação"], prazoTexto: "10 dias para notificar", prazoDias: 10, accoes: ["consultar", "submeter"] },
  { id: "F6", nome: "Pós-Deferimento", estados: ["Em negociação contratual", "Aguarda pagamento P2"], prazoTexto: "180 dias", prazoDias: 180, accoes: ["negociar", "submeter", "pagar"] },
  {
    id: "F7",
    nome: "Contrato, Publicação e Alvará",
    estados: ["Contrato celebrado", "Aguarda pagamento P3", "Publicado", "Alvará emitido"],
    prazoTexto: "5 dias úteis para publicar",
    prazoDias: 5,
    accoes: ["assinar", "pagar"],
  },
  { id: "F8", nome: "Concessão Formalizada", estados: ["Encerrado"], prazoTexto: "Contínuo", prazoDias: null, accoes: ["reportar", "pagar"] },
];

export const indiceFase = (id: FaseId) => FASES.findIndex((f) => f.id === id);

// ---------- Cobranças (RUPE / CUT) ----------

export type CodigoCobranca = "P1" | "P2" | "P3" | "P4";
export type EstadoCobranca = "Pendente" | "Em validação" | "Paga";

export interface LinhaCobranca {
  codigo: string; // P1a, P1b, P2, P3, P4
  descricao: string;
  detalhe: string;
  valor: number | null; // null = "a confirmar"
}

export interface Parcela {
  n: number;
  valor: number;
  vencimento: string;
}

export interface PagamentoHistorico {
  id: string;
  data: string;
  valor: number | null;
  referencia: string;
}

export interface Cobranca {
  codigo: CodigoCobranca;
  fase: FaseId;
  titulo: string;
  baseLegal?: string;
  bloqueio: string;
  linhas: LinhaCobranca[];
  estado: EstadoCobranca;
  rupe?: string;
  comprovativo?: string;
  parcelas?: Parcela[];
  recibo?: string;
  contínua?: boolean;
  historico?: PagamentoHistorico[];
}

// Tarifas de vistoria por produto (Art. 66.º n.º 4 a/b, DEC 243/22)
export const TARIFA_VISTORIA: Record<string, { label: string; porHa: number | null; fixo: number | null }> = {
  madeira: { label: "Madeira", porHa: 100, fixo: null },
  carvao: { label: "Carvão ou lenha", porHa: 20, fixo: null },
  outros: { label: "Outros produtos", porHa: null, fixo: 5720 },
};

export const SUBSIDIO_DIA = 33125;
export const MAX_DIAS_VISTORIA = 10;

export function calcularP1a(areaHa: number, produto: keyof typeof TARIFA_VISTORIA) {
  const t = TARIFA_VISTORIA[produto];
  return t.fixo ?? areaHa * (t.porHa ?? 0);
}

export function calcularP1b(tecnicos: number, dias: number) {
  return tecnicos * Math.min(dias, MAX_DIAS_VISTORIA) * SUBSIDIO_DIA;
}

// Taxas de exploração de madeira em toro sem casca (Kz/m³), por qualidade
export const QUALIDADES_MADEIRA = [
  { classe: "A", valor: 3752 },
  { classe: "B", valor: 3100 },
  { classe: "C", valor: 2480 },
  { classe: "D", valor: 1860 },
  { classe: "E", valor: 1430 },
  { classe: "F", valor: 1007 },
];

// ---------- Documentos gerados ----------

export interface DocumentoProcesso {
  codigo: string; // D01..D10, R01..
  nome: string;
  emitidoEm?: string;
  detalhe?: string;
}

// ---------- Negociação (F6) ----------

export interface MensagemNegociacao {
  id: string;
  autor: "Requerente" | "Órgãos centrais do Ministério";
  data: string;
  texto: string;
}

// ---------- Instrumentos técnicos (D07) ----------

export interface Instrumento {
  id: string;
  nome: string;
  enviado: boolean;
}

export const INSTRUMENTOS_BASE: Instrumento[] = [
  { id: "i1", nome: "Plano de gestão", enviado: false },
  { id: "i2", nome: "Inventário florestal", enviado: false },
  { id: "i3", nome: "Plano de exploração", enviado: false },
  { id: "i4", nome: "Zoneamento", enviado: false },
  { id: "i5", nome: "Picadas", enviado: false },
  { id: "i6", nome: "Povoamento", enviado: false },
  { id: "i7", nome: "Adenda social", enviado: false },
  { id: "i8", nome: "Licença ambiental", enviado: false },
];

// ---------- Fiscais privativos (F8) ----------

export interface FiscalPrivativo {
  id: string;
  nome: string;
  documento: string;
  estado: "Pendente de juramentação pelo IDF" | "Juramentado";
}

// ---------- Processo ----------

export interface EspecieInventario {
  especie: string;
  arvores: number; // n.º de árvores inventariadas no bloco
  volumeM3: number; // volume estimado em m³ (madeira em toro sem casca)
}

export interface BlocoConcessao {
  id: string;
  nome: string; // Bloco A, Bloco B, ...
  areaHa: number;
  especies: string;
  volumeContratadoM3: number;
  volumeConsumidoM3: number;
  estado: "Em exploração" | "Por iniciar" | "Encerrado";
  inventario: EspecieInventario[]; // resumo das espécies de árvores do bloco
}

export interface OrigemConcurso {
  codigo: string; // CP-2026/02
  titulo: string;
  adjudicadoEm: string; // ISO
  lote: string;
  concorrentes: number;
}

export interface ProcessoConcessao {
  id: string;
  codigo: string;
  area: string;
  areaHa: number;
  origemConcurso?: OrigemConcurso;
  blocos?: BlocoConcessao[];
  produto: keyof typeof TARIFA_VISTORIA;
  tecnicos: number;
  diasVistoria: number;
  fase: FaseId;
  estado: EstadoProcesso;
  prazoInicio?: string; // ISO — início do prazo em curso
  diasDecorridos: number;
  documentos: DocumentoProcesso[];
  cobrancas: Cobranca[];
  negociacao: { estado: "Em curso" | "Concluída"; mensagens: MensagemNegociacao[] };
  instrumentos: Instrumento[];
  contrato?: { assinadoEm: string; hash: string };
  publicacao?: { data: string };
  alvara?: boolean;
  fiscaisRecrutados: boolean;
  fiscais: FiscalPrivativo[];
}

function cobrancaP1(areaHa: number, produto: keyof typeof TARIFA_VISTORIA, tecnicos: number, dias: number): Cobranca {
  const t = TARIFA_VISTORIA[produto];
  return {
    codigo: "P1",
    fase: "F2",
    titulo: "P1 — Vistoria técnica",
    baseLegal: "Art. 66.º n.º 4 a/b, DEC 243/22",
    bloqueio: "A vistoria técnica só é agendada após a confirmação deste pagamento (RN-COB-01).",
    estado: "Pendente",
    linhas: [
      {
        codigo: "P1a",
        descricao: "Taxa de vistoria técnica",
        detalhe: t.fixo ? `${t.label} — valor fixo` : `${areaHa.toLocaleString("pt-AO")} ha × ${t.porHa} Kz/ha (${t.label})`,
        valor: calcularP1a(areaHa, produto),
      },
      {
        codigo: "P1b",
        descricao: "Subsídio de deslocação",
        detalhe: `${tecnicos} técnicos × ${Math.min(dias, MAX_DIAS_VISTORIA)} dias × ${SUBSIDIO_DIA.toLocaleString("pt-AO")} Kz/dia (máx. 10 dias)`,
        valor: calcularP1b(tecnicos, dias),
      },
    ],
  };
}

const cobrancaP2: Cobranca = {
  codigo: "P2",
  fase: "F6",
  titulo: "P2 — Taxas de exploração, rendas, cauções e bónus",
  baseLegal: "DEC 243/22",
  bloqueio: "O contrato só é celebrado depois do dossiê completo (D07) e do pagamento P2 confirmado (RN-COB-04).",
  estado: "Pendente",
  linhas: [
    { codigo: "P2", descricao: "Taxa de exploração — madeira em toro sem casca", detalhe: "1.007 a 3.752 Kz/m³ conforme densidade/qualidade (A–F)", valor: null },
    { codigo: "P2", descricao: "Rendas", detalhe: "Valor a confirmar pela entidade concedente", valor: null },
    { codigo: "P2", descricao: "Cauções", detalhe: "Valor a confirmar pela entidade concedente", valor: null },
    { codigo: "P2", descricao: "Bónus", detalhe: "Valor a confirmar pela entidade concedente", valor: null },
  ],
};

const cobrancaP3: Cobranca = {
  codigo: "P3",
  fase: "F7",
  titulo: "P3 — Emissão de alvará e publicação",
  bloqueio: "O alvará e a planta (D10) só ficam disponíveis após a confirmação deste pagamento.",
  estado: "Pendente",
  linhas: [{ codigo: "P3", descricao: "Encargos de contrato, publicação e alvará", detalhe: "Cobrado ao Concessionário", valor: null }],
};

const cobrancaP4: Cobranca = {
  codigo: "P4",
  fase: "F8",
  titulo: "P4 — Estadia do fiscal residente",
  bloqueio: "Cobrança contínua enquanto a concessão se mantiver activa.",
  estado: "Pendente",
  contínua: true,
  linhas: [{ codigo: "P4", descricao: "Estadia do fiscal residente", detalhe: "Modalidade a definir", valor: null }],
  historico: [
    { id: "h1", data: "2026-07-05", valor: null, referencia: "RUPE 8841-2026-0715" },
    { id: "h2", data: "2026-08-05", valor: null, referencia: "RUPE 8841-2026-0822" },
  ],
};

const negociacaoBase = {
  estado: "Em curso" as const,
  mensagens: [
    {
      id: "m1",
      autor: "Órgãos centrais do Ministério" as const,
      data: "2026-08-20",
      texto: "Minuta contratual enviada para apreciação. Solicita-se pronúncia sobre as cláusulas de reflorestação e contrapartidas sociais.",
    },
    {
      id: "m2",
      autor: "Requerente" as const,
      data: "2026-08-27",
      texto: "Aceites as cláusulas de reflorestação. Proposta de faseamento das contrapartidas sociais em três anos.",
    },
    {
      id: "m3",
      autor: "Órgãos centrais do Ministério" as const,
      data: "2026-09-03",
      texto: "Faseamento admissível. Aguarda-se a submissão do dossiê pós-deferimento (D07) para fecho da negociação.",
    },
  ],
};

export const processosIniciais: ProcessoConcessao[] = [
  {
    id: "c2",
    codigo: "CONC-2026/004",
    area: "Área Florestal de Maquela · Uíge",
    areaHa: 12500,
    blocos: [
      { id: "b1", nome: "Bloco A", areaHa: 3800, especies: "Mussibi, Tola", volumeContratadoM3: 14200, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mussibi", arvores: 1180, volumeM3: 8600 },
        { especie: "Tola", arvores: 840, volumeM3: 5600 },
      ] },
      { id: "b2", nome: "Bloco B", areaHa: 3400, especies: "Girassonde", volumeContratadoM3: 12600, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Girassonde", arvores: 1640, volumeM3: 12600 },
      ] },
      { id: "b3", nome: "Bloco C", areaHa: 2900, especies: "Mubango, Panga-panga", volumeContratadoM3: 10800, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mubango", arvores: 720, volumeM3: 6900 },
        { especie: "Panga-panga", arvores: 410, volumeM3: 3900 },
      ] },
      { id: "b4", nome: "Bloco D", areaHa: 2400, especies: "Mussivi", volumeContratadoM3: 8900, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mussivi", arvores: 960, volumeM3: 8900 },
      ] },
    ],
    produto: "madeira",
    tecnicos: 2,
    diasVistoria: 3,
    fase: "F2",
    estado: "Aguarda pagamento P1",
    prazoInicio: "2026-09-05",
    diasDecorridos: 7,
    documentos: [
      { codigo: "D01", nome: "Dossiê inicial", emitidoEm: "2026-08-14", detalhe: "Requerimento + 9 anexos" },
      { codigo: "D02", nome: "Comprovativo de protocolo", emitidoEm: "2026-08-14", detalhe: "N.º 2026/004 · 14/08/2026 09:42 · código VRF-2026-004-81QK" },
    ],
    cobrancas: [cobrancaP1(12500, "madeira", 2, 3)],
    negociacao: { estado: "Em curso", mensagens: [] },
    instrumentos: INSTRUMENTOS_BASE.map((i) => ({ ...i })),
    fiscaisRecrutados: false,
    fiscais: [],
  },
  {
    id: "c3",
    codigo: "CONC-2026/012",
    area: "Área Florestal do Alto-Zambeze · Moxico",
    areaHa: 8400,
    origemConcurso: {
      codigo: "CP-2026/02",
      titulo: "Concessão Florestal do Alto-Zambeze — Bloco Leste",
      adjudicadoEm: "2026-05-28",
      lote: "Lote 2 — Bloco Leste",
      concorrentes: 4,
    },
    blocos: [
      { id: "b1", nome: "Bloco A", areaHa: 2600, especies: "Mussibi, Girassonde", volumeContratadoM3: 9800, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mussibi", arvores: 760, volumeM3: 5900 },
        { especie: "Girassonde", arvores: 520, volumeM3: 3900 },
      ] },
      { id: "b2", nome: "Bloco B", areaHa: 2200, especies: "Mubango, Panga-panga", volumeContratadoM3: 8100, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mubango", arvores: 480, volumeM3: 5200 },
        { especie: "Panga-panga", arvores: 260, volumeM3: 2900 },
      ] },
      { id: "b3", nome: "Bloco C", areaHa: 2100, especies: "Mussivi", volumeContratadoM3: 7400, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mussivi", arvores: 690, volumeM3: 7400 },
      ] },
      { id: "b4", nome: "Bloco D", areaHa: 1500, especies: "Mussibi", volumeContratadoM3: 5200, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mussibi", arvores: 430, volumeM3: 5200 },
      ] },
    ],
    produto: "madeira",
    tecnicos: 3,
    diasVistoria: 4,
    fase: "F6",
    estado: "Em negociação contratual",
    prazoInicio: "2026-06-01",
    diasDecorridos: 103,
    documentos: [
      { codigo: "D01", nome: "Dossiê inicial", emitidoEm: "2026-03-02" },
      { codigo: "D02", nome: "Comprovativo de protocolo", emitidoEm: "2026-03-02", detalhe: "N.º 2026/012 · 02/03/2026 11:20 · código VRF-2026-012-4TBM" },
      { codigo: "R01", nome: "Recibo do pagamento P1", emitidoEm: "2026-04-11" },
      { codigo: "D06", nome: "Despacho de deferimento", emitidoEm: "2026-05-28" },
    ],
    cobrancas: [
      { ...cobrancaP1(8400, "madeira", 3, 4), estado: "Paga", rupe: "RUPE 0031-2026-77410", comprovativo: "comprovativo-p1.pdf", recibo: "R01" },
      { ...cobrancaP2, linhas: cobrancaP2.linhas.map((l) => ({ ...l })) },
    ],
    negociacao: { estado: negociacaoBase.estado, mensagens: negociacaoBase.mensagens.map((m) => ({ ...m })) },
    instrumentos: INSTRUMENTOS_BASE.map((i, idx) => ({ ...i, enviado: idx < 3 })),
    fiscaisRecrutados: false,
    fiscais: [],
  },
  {
    id: "c1",
    codigo: "CONC-2024/011",
    area: "Área Florestal de Buco-Zau · Cabinda",
    areaHa: 3000,
    origemConcurso: {
      codigo: "CP-2024/07",
      titulo: "Concessão Florestal de Buco-Zau — Maiombe",
      adjudicadoEm: "2024-09-18",
      lote: "Lote único",
      concorrentes: 3,
    },
    blocos: [
      { id: "b1", nome: "Bloco A", areaHa: 900, especies: "Limba, Tola", volumeContratadoM3: 3400, volumeConsumidoM3: 2980, estado: "Em exploração", inventario: [
        { especie: "Limba", arvores: 212, volumeM3: 1980 },
        { especie: "Tola", arvores: 148, volumeM3: 1420 },
      ] },
      { id: "b2", nome: "Bloco B", areaHa: 820, especies: "Sapelli", volumeContratadoM3: 3100, volumeConsumidoM3: 1450, estado: "Em exploração", inventario: [
        { especie: "Sapelli", arvores: 264, volumeM3: 3100 },
      ] },
      { id: "b3", nome: "Bloco C", areaHa: 760, especies: "Limba", volumeContratadoM3: 2600, volumeConsumidoM3: 2600, estado: "Encerrado", inventario: [
        { especie: "Limba", arvores: 198, volumeM3: 2600 },
      ] },
      { id: "b4", nome: "Bloco D", areaHa: 520, especies: "Tola, Mubala", volumeContratadoM3: 1800, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Tola", arvores: 96, volumeM3: 1150 },
        { especie: "Mubala", arvores: 58, volumeM3: 650 },
      ] },
    ],
    produto: "madeira",
    tecnicos: 2,
    diasVistoria: 2,
    fase: "F8",
    estado: "Encerrado",
    diasDecorridos: 0,
    documentos: [
      { codigo: "D01", nome: "Dossiê inicial", emitidoEm: "2024-05-10" },
      { codigo: "D02", nome: "Comprovativo de protocolo", emitidoEm: "2024-05-10", detalhe: "N.º 2024/011 · 10/05/2024 08:15 · código VRF-2024-011-9PLC" },
      { codigo: "R01", nome: "Recibo do pagamento P1", emitidoEm: "2024-06-04" },
      { codigo: "D07", nome: "Dossiê pós-deferimento (8 instrumentos)", emitidoEm: "2024-09-30" },
      { codigo: "D08", nome: "Contrato de concessão (2 vias)", emitidoEm: "2024-11-08" },
      { codigo: "D09", nome: "Publicação em Diário da República", emitidoEm: "2024-11-14" },
      { codigo: "D10", nome: "Alvará e planta", emitidoEm: "2024-11-22" },
    ],
    cobrancas: [
      { ...cobrancaP1(3000, "madeira", 2, 2), estado: "Paga", rupe: "RUPE 0011-2024-33012", recibo: "R01" },
      { ...cobrancaP2, estado: "Paga", rupe: "RUPE 0011-2024-44120", linhas: cobrancaP2.linhas.map((l) => ({ ...l })) },
      { ...cobrancaP3, estado: "Paga", rupe: "RUPE 0011-2024-55098", linhas: cobrancaP3.linhas.map((l) => ({ ...l })) },
      { ...cobrancaP4, linhas: cobrancaP4.linhas.map((l) => ({ ...l })), historico: (cobrancaP4.historico ?? []).map((h) => ({ ...h })) },
    ],
    negociacao: { estado: "Concluída", mensagens: negociacaoBase.mensagens.map((m) => ({ ...m })) },
    instrumentos: INSTRUMENTOS_BASE.map((i) => ({ ...i, enviado: true })),
    contrato: { assinadoEm: "2024-11-08", hash: "A7F3-91BD-22C0-5E48" },
    publicacao: { data: "2024-11-14" },
    alvara: true,
    fiscaisRecrutados: true,
    fiscais: [
      { id: "f1", nome: "Adão Kiala Mbala", documento: "BI 004512873LA041", estado: "Juramentado" },
      { id: "f2", nome: "Teresa Nguxi Sambo", documento: "BI 007781220CB033", estado: "Pendente de juramentação pelo IDF" },
    ],
  },
  {
    id: "c4",
    codigo: "CONC-2025/006",
    area: "Área Florestal de Buco-Zau · Cabinda",
    areaHa: 1400,
    blocos: [
      { id: "b1", nome: "Bloco A", areaHa: 550, especies: "Limba, Tola", volumeContratadoM3: 2100, volumeConsumidoM3: 640, estado: "Em exploração", inventario: [
        { especie: "Limba", arvores: 118, volumeM3: 1250 },
        { especie: "Tola", arvores: 76, volumeM3: 850 },
      ] },
      { id: "b2", nome: "Bloco B", areaHa: 470, especies: "Sapelli", volumeContratadoM3: 1750, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Sapelli", arvores: 132, volumeM3: 1750 },
      ] },
      { id: "b3", nome: "Bloco C", areaHa: 380, especies: "Mubala", volumeContratadoM3: 1300, volumeConsumidoM3: 0, estado: "Por iniciar", inventario: [
        { especie: "Mubala", arvores: 88, volumeM3: 1300 },
      ] },
    ],
    produto: "madeira",
    tecnicos: 2,
    diasVistoria: 2,
    fase: "F6",
    estado: "Em negociação contratual",
    prazoInicio: "2026-07-20",
    diasDecorridos: 45,
    documentos: [
      { codigo: "D01", nome: "Dossiê inicial", emitidoEm: "2025-11-18" },
      { codigo: "D02", nome: "Comprovativo de protocolo", emitidoEm: "2025-11-18", detalhe: "N.º 2025/006 · 18/11/2025 10:05 · código VRF-2025-006-2QXA" },
      { codigo: "R01", nome: "Recibo do pagamento P1", emitidoEm: "2026-01-09" },
      { codigo: "D06", nome: "Despacho de deferimento", emitidoEm: "2026-07-14" },
    ],
    cobrancas: [
      { ...cobrancaP1(1400, "madeira", 2, 2), estado: "Paga", rupe: "RUPE 0006-2026-11873", recibo: "R01" },
      { ...cobrancaP2, linhas: cobrancaP2.linhas.map((l) => ({ ...l })) },
    ],
    negociacao: { estado: "Em curso", mensagens: [] },
    instrumentos: INSTRUMENTOS_BASE.map((i, idx) => ({ ...i, enviado: idx < 2 })),
    fiscaisRecrutados: false,
    fiscais: [],
  },
];

// Os 9 anexos obrigatórios do requerimento (F0)
export const ANEXOS_F0 = [
  "Pacto social",
  "Comprovativo de registo fiscal",
  "Declaração de sujeição às leis",
  "Declaração bancária de capacidade financeira",
  "Certidão de conformidade tributária",
  "Croquis 1/100.000 do IGCA",
  "Memória descritiva",
  "Relatório de espécies e produtos",
  "Estudo de viabilidade",
];

export function gerarRupe(codigo: CodigoCobranca) {
  const bloco = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `RUPE ${codigo}-${new Date().getFullYear()}-${bloco()}${bloco()}`;
}
