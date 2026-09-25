// ============================================================
// Portal Público do Produtor — SIGAFLO/IDF
// Dados 100% mock (estado local). Fonte normativa: SIGAFLO/DRF-02
// ============================================================

// ---------- Tipos ----------

export type EstadoRegisto = "Activo" | "EmAnalise" | "Suspenso";

export interface OperadorConta {
  nif: string;
  email: string;
  password: string;
  denominacao: string;
  nrof: string | null; // null enquanto em análise
  estado: EstadoRegisto;
  motivoSuspensao?: string;
  categorias: string[];
  provincias: string[];
  municipio: string;
  sede: string;
  tipoSujeito: string;
  dataConstituicao: string;
  objectoSocial: string;
}

export interface Concurso {
  id: string;
  codigo: string;
  titulo: string;
  provincia: string;
  municipio: string;
  areaHa: number;
  especies: string[];
  abertura: string; // ISO
  prazo: string; // ISO
  descricao: string;
  criterios: string[];
  pecas: { nome: string; tamanho: string }[];
  coords: [number, number]; // [lng, lat]
}

export interface CampanhaRow {
  tipo: string;
  abertura: string;
  encerramento: string;
}

export interface DocVerificavel {
  codigo: string;
  tipo: "Guia de Trânsito" | "Certificado de Produto em Estância" | "Alvará de Licença";
  valido: boolean;
  emitidoEm: string;
  validoAte: string;
  referencia: string;
}

// ---------- Contas mock de operadores ----------
// Nota: credenciais de demonstração, sem backend real.
export const contas: OperadorConta[] = [
  {
    nif: "5000123456",
    email: "geral@kimbo-madeiras.ao",
    password: "idf2026",
    denominacao: "Kimbo Madeiras, Lda.",
    nrof: "NROF-0142",
    estado: "Activo",
    categorias: ["Exploração Florestal", "Serração", "Exportação"],
    provincias: ["Cabinda", "Uíge"],
    municipio: "Belize",
    sede: "Rua da Floresta 12, Cabinda",
    tipoSujeito: "Pessoa colectiva de direito angolano",
    dataConstituicao: "2014-03-18",
    objectoSocial: "Exploração, transformação e comercialização de produtos florestais.",
  },
  {
    nif: "5000654321",
    email: "coop@munduki.ao",
    password: "idf2026",
    denominacao: "Cooperativa Munduki",
    nrof: "NROF-0288",
    estado: "Suspenso",
    motivoSuspensao: "Certidão de conformidade tributária expirada há 42 dias.",
    categorias: ["PFNL", "Apicultura"],
    provincias: ["Bié"],
    municipio: "Kuito",
    sede: "Bairro Munduki, Kuito, Bié",
    tipoSujeito: "Cooperativa",
    dataConstituicao: "2019-07-02",
    objectoSocial: "Produção e comercialização de produtos florestais não lenhosos.",
  },
  {
    nif: "5000999000",
    email: "novo@florestakwanza.ao",
    password: "idf2026",
    denominacao: "Floresta Kwanza, Lda.",
    nrof: null,
    estado: "EmAnalise",
    categorias: ["Exploração Florestal"],
    provincias: ["Malanje"],
    municipio: "Malanje",
    sede: "Zona Industrial, Malanje",
    tipoSujeito: "Pessoa colectiva de direito angolano",
    dataConstituicao: "2025-11-20",
    objectoSocial: "Exploração florestal sustentável.",
  },
];

// ---------- Calendário da campanha 2026 ----------
export const campanha: CampanhaRow[] = [
  { tipo: "Concessão Florestal — Concurso Público", abertura: "2026-03-01", encerramento: "2026-06-30" },
  { tipo: "Licença Anual de Corte (concessão activa)", abertura: "2026-01-15", encerramento: "2026-03-31" },
  { tipo: "Licenciamento PR-10 — Exploração Florestal", abertura: "2026-04-01", encerramento: "2026-12-15" },
  { tipo: "Licenciamento PR-11 — Lenha, Carvão e PFNL", abertura: "2026-02-01", encerramento: "2026-11-30" },
  { tipo: "Licenciamento PR-12 — Fauna", abertura: "2026-05-01", encerramento: "2026-10-31" },
  { tipo: "Licenciamento PR-13 — Apicultura", abertura: "2026-01-10", encerramento: "2026-12-20" },
];

// ---------- Concursos públicos ----------
export const concursos: Concurso[] = [
  {
    id: "cp-001",
    codigo: "CP-2026/01",
    titulo: "Concessão Florestal do Município de Belize — Bloco Norte",
    provincia: "Cabinda",
    municipio: "Belize",
    areaHa: 12400,
    especies: ["Gossweilerodendron balsamiferum (Tola)", "Entandrophragma utile (Sipo)", "Milicia excelsa (Iroko)"],
    abertura: "2026-08-01T08:00:00",
    prazo: "2026-10-15T17:00:00",
    descricao:
      "Concurso público para atribuição de concessão florestal anual renovável sobre o Bloco Norte de Belize, com plano de maneio obrigatório e adenda social junto das comunidades locais.",
    criterios: [
      "Capacidade técnica e meios materiais (25%)",
      "Capacidade financeira comprovada (20%)",
      "Plano de valorização local e emprego (20%)",
      "Proposta de renda anual (25%)",
      "Experiência prévia certificada (10%)",
    ],
    pecas: [
      { nome: "Memória descritiva da área.pdf", tamanho: "1,2 MB" },
      { nome: "Croquis de localização.pdf", tamanho: "860 KB" },
      { nome: "Programa do concurso.pdf", tamanho: "420 KB" },
      { nome: "Minuta do contrato de concessão.pdf", tamanho: "300 KB" },
    ],
    coords: [12.45, -5.28],
  },
  {
    id: "cp-002",
    codigo: "CP-2026/02",
    titulo: "Concessão Florestal do Alto-Zambeze — Bloco Leste",
    provincia: "Moxico",
    municipio: "Alto-Zambeze",
    areaHa: 24800,
    especies: ["Pterocarpus angolensis (Girassonde)", "Baikiaea plurijuga (Mucusseque)"],
    abertura: "2026-09-01T08:00:00",
    prazo: "2026-11-30T17:00:00",
    descricao:
      "Atribuição de concessão para exploração sustentável no Alto-Zambeze, com obrigação de inventário florestal a 100% no primeiro ano de campanha.",
    criterios: [
      "Capacidade técnica e meios materiais (25%)",
      "Capacidade financeira comprovada (25%)",
      "Plano de valorização local (20%)",
      "Proposta de renda anual (30%)",
    ],
    pecas: [
      { nome: "Memória descritiva da área.pdf", tamanho: "980 KB" },
      { nome: "Programa do concurso.pdf", tamanho: "410 KB" },
    ],
    coords: [23.6, -11.9],
  },
  {
    id: "cp-003",
    codigo: "CP-2026/03",
    titulo: "Concessão Florestal do Cuanza-Norte — Samba Caju",
    provincia: "Cuanza-Norte",
    municipio: "Samba Caju",
    areaHa: 8600,
    especies: ["Eucalyptus spp. (reflorestação)", "Cupressus lusitanica"],
    abertura: "2026-05-10T08:00:00",
    prazo: "2026-09-25T17:00:00",
    descricao:
      "Concessão orientada à reconversão de áreas degradadas com plantação comercial de eucalipto e cipreste.",
    criterios: ["Plano de plantação (30%)", "Capacidade financeira (25%)", "Proposta de renda (25%)", "Emprego local (20%)"],
    pecas: [{ nome: "Programa do concurso.pdf", tamanho: "380 KB" }],
    coords: [15.1, -9.1],
  },
  {
    id: "cp-004",
    codigo: "CP-2025/07",
    titulo: "Concessão Florestal do Cuando-Cubango — Menongue",
    provincia: "Cuando-Cubango",
    municipio: "Menongue",
    areaHa: 31000,
    especies: ["Guibourtia coleosperma (Mussivi)", "Pterocarpus angolensis (Girassonde)"],
    abertura: "2025-10-01T08:00:00",
    prazo: "2026-01-30T17:00:00",
    descricao: "Concurso encerrado. Processo em fase de avaliação de propostas pela comissão de concurso.",
    criterios: ["Capacidade técnica (30%)", "Capacidade financeira (25%)", "Proposta de renda (30%)", "Experiência (15%)"],
    pecas: [{ nome: "Programa do concurso.pdf", tamanho: "350 KB" }],
    coords: [17.7, -14.65],
  },
];

// ---------- Documentos verificáveis ----------
export const documentosVerificaveis: DocVerificavel[] = [
  { codigo: "GT-2026-88412", tipo: "Guia de Trânsito", valido: true, emitidoEm: "2026-09-02", validoAte: "2026-09-17", referencia: "Kimbo Madeiras, Lda. · 24,5 m³ de Tola · Cabinda → Luanda" },
  { codigo: "GT-2026-87001", tipo: "Guia de Trânsito", valido: false, emitidoEm: "2026-07-14", validoAte: "2026-07-29", referencia: "Expirada — viagem concluída" },
  { codigo: "CE-2026-1120", tipo: "Certificado de Produto em Estância", valido: true, emitidoEm: "2026-08-20", validoAte: "2026-11-20", referencia: "Cooperativa Munduki · Mel de floresta · Bié" },
  { codigo: "AL-2026-0331", tipo: "Alvará de Licença", valido: true, emitidoEm: "2026-04-05", validoAte: "2026-12-31", referencia: "PR-11 · Lenha e carvão vegetal · Kimbo Madeiras, Lda." },
];

// ---------- Consulta pública de operadores ----------
export const operadoresPublicos = [
  { denominacao: "Kimbo Madeiras, Lda.", nrof: "NROF-0142", categorias: ["Exploração Florestal", "Serração", "Exportação"], estado: "Activo" as const, provincias: ["Cabinda", "Uíge"] },
  { denominacao: "Cooperativa Munduki", nrof: "NROF-0288", categorias: ["PFNL", "Apicultura"], estado: "Suspenso" as const, provincias: ["Bié"] },
  { denominacao: "Serragem do Planalto, Lda.", nrof: "NROF-0056", categorias: ["Serração"], estado: "Activo" as const, provincias: ["Huíla"] },
  { denominacao: "Angola Tropical Woods, Lda.", nrof: "NROF-0197", categorias: ["Exploração Florestal", "Exportação"], estado: "Activo" as const, provincias: ["Moxico"] },
  { denominacao: "Associação Apícola do Bié", nrof: "NROF-0233", categorias: ["Apicultura"], estado: "Activo" as const, provincias: ["Bié"] },
];

export const totalOperadoresRegistados = 486;

// ---------- Legislação ----------
export const legislacao = [
  { titulo: "Lei de Bases de Florestas e Fauna Selvagem — Lei n.º 6/17", resumo: "Define os princípios fundamentais da conservação e uso sustentável dos recursos florestais e da fauna selvagem.", link: "#" },
  { titulo: "Regulamento Florestal — Decreto Presidencial n.º 171/18", resumo: "Regulamenta a atribuição de concessões, licenciamento, quotas de corte e fiscalização da actividade florestal.", link: "#" },
  { titulo: "Regulamento sobre Certificação Florestal", resumo: "Estabelece o regime de certificação de produtos florestais em estância e de cadeia de custódia.", link: "#" },
  { titulo: "Tabela de Taxas e Emolumentos do IDF", resumo: "Define os valores das taxas de licenciamento, rendas anuais de concessão, cauções e bónus de assinatura.", link: "#" },
];

// ---------- FAQ ----------
export const faqs = [
  { q: "Quem pode registar-se como operador florestal?", a: "Pessoas colectivas de direito angolano, associações e cooperativas. Pessoas singulares apenas para as categorias Apícola ou PFNL." },
  { q: "Quanto tempo demora a análise do registo?", a: "O prazo indicativo é de 15 dias úteis após a submissão completa dos documentos obrigatórios." },
  { q: "Posso candidatar-me a um concurso sem registo aprovado?", a: "Não. É necessário ter o registo de operador no estado Activo para submeter candidaturas a concursos públicos." },
  { q: "Como verifico a autenticidade de uma guia de trânsito?", a: "Use a página «Verificar Documento» e introduza o código de verificação impresso no documento." },
  { q: "O que acontece se a minha conformidade tributária expirar?", a: "O registo pode ser suspenso até à renovação do documento. Receberá um alerta 30 dias antes da expiração." },
  { q: "Os dados enviados no portal são seguros?", a: "Sim. O portal cumpre a legislação de protecção de dados pessoais em vigor em Angola." },
];

export const contactosProvinciais = [
  { provincia: "Cabinda", endereco: "Departamento Provincial do IDF — Cabinda", telefone: "+244 231 220 410", email: "cabinda@idf.gov.ao" },
  { provincia: "Bié", endereco: "Departamento Provincial do IDF — Kuito", telefone: "+244 248 223 118", email: "bie@idf.gov.ao" },
  { provincia: "Moxico", endereco: "Departamento Provincial do IDF — Luena", telefone: "+244 246 220 775", email: "moxico@idf.gov.ao" },
  { provincia: "Huíla", endereco: "Departamento Provincial do IDF — Lubango", telefone: "+244 261 224 930", email: "huila@idf.gov.ao" },
  { provincia: "Luanda", endereco: "Direcção Nacional — Viana", telefone: "+244 222 750 210", email: "geral@idf.gov.ao" },
];

// ---------- Dados do painel autenticado (operador Kimbo Madeiras) ----------

export interface DocumentoOperador {
  id: string;
  nome: string;
  validoAte: string | null; // null = sem validade
}

export const meusDocumentos: DocumentoOperador[] = [
  { id: "d1", nome: "Pacto social", validoAte: null },
  { id: "d2", nome: "Certidão comercial", validoAte: null },
  { id: "d3", nome: "Comprovativo de registo fiscal — Cabinda", validoAte: null },
  { id: "d4", nome: "Comprovativo de registo fiscal — Uíge", validoAte: null },
  { id: "d5", nome: "Certidão de conformidade tributária", validoAte: "2026-10-04" },
  { id: "d6", nome: "Declaração de sujeição às leis e tribunais nacionais", validoAte: null },
  { id: "d7", nome: "Declaração bancária de capacidade financeira (Kz 180.000.000)", validoAte: "2027-01-15" },
];

export const historicoRegisto = [
  { data: "2026-02-10", evento: "Registo activado", detalhe: "Aprovado após análise documental. Atribuído NROF-0142." },
  { data: "2026-01-28", evento: "Registo submetido", detalhe: "Pedido de registo enviado com 7 documentos." },
];

export interface MinhaArea {
  id: string;
  codigo: string;
  nome: string;
  provincia: string;
  municipio: string;
  areaHa: number;
  parecer: "Conforme" | "Conforme com reserva" | "Não conforme";
  ocupadaHa: number;
  coords: [number, number];
  associacoes: { tipo: "Concessão" | "Licença"; codigo: string; areaHa: number; estado: string }[];
}

export const minhasAreas: MinhaArea[] = [
  {
    id: "a1",
    codigo: "AR-CAB-0007",
    nome: "Área Florestal de Buco-Zau",
    provincia: "Cabinda",
    municipio: "Buco-Zau",
    areaHa: 5200,
    parecer: "Conforme",
    ocupadaHa: 4400,
    coords: [12.6, -5.05],
    associacoes: [
      { tipo: "Concessão", codigo: "CONC-2024/011", areaHa: 3000, estado: "Activa" },
      { tipo: "Concessão", codigo: "CONC-2025/006", areaHa: 1400, estado: "Em tramitação" },
    ],
  },
  {
    id: "a2",
    codigo: "AR-UIG-0019",
    nome: "Área Florestal de Maquela",
    provincia: "Uíge",
    municipio: "Maquela do Zombo",
    areaHa: 13000,
    parecer: "Conforme com reserva",
    ocupadaHa: 12500,
    coords: [15.3, -6.05],
    associacoes: [
      { tipo: "Concessão", codigo: "CONC-2026/004", areaHa: 12500, estado: "Em tramitação" },
    ],
  },
];

export interface FaseConcessao {
  letra: string;
  nome: string;
  estado: "concluida" | "em_curso" | "pendente";
  prazo?: string;
  detalhe?: string;
}

export interface MinhaConcessao {
  id: string;
  codigo: string;
  area: string;
  faseActual: number; // 1..8
  fases: FaseConcessao[];
  prazoEmCurso: string;
}

const fasesBase = ["Abertura do procedimento", "Análise documental", "Vistoria de campo", "Parecer técnico", "Pagamento do bónus", "Emissão do contrato", "Instrumentos técnicos (upload)", "Emissão do alvará"];

export const minhasConcessoes: MinhaConcessao[] = [
  {
    id: "c1",
    codigo: "CONC-2024/011",
    area: "Área Florestal de Buco-Zau · 3.000 ha",
    faseActual: 8,
    prazoEmCurso: "Concluído",
    fases: fasesBase.map((nome, i) => ({
      letra: String.fromCharCode(65 + i),
      nome,
      estado: "concluida",
    })),
  },
  {
    id: "c2",
    codigo: "CONC-2026/004",
    area: "Área Florestal de Maquela · 2.600 ha",
    faseActual: 5,
    prazoEmCurso: "12 dias para pagamento do bónus",
    fases: fasesBase.map((nome, i) => ({
      letra: String.fromCharCode(65 + i),
      nome,
      estado: i < 4 ? "concluida" : i === 4 ? "em_curso" : "pendente",
      prazo: i === 4 ? "2026-09-24" : undefined,
      detalhe: i === 4 ? "Nota de liquidação NL-2026/0877 emitida — Kz 9.500.000" : undefined,
    })),
  },
];

export const instrumentosTecnicos = [
  { id: "it1", nome: "Plano de maneio florestal", enviado: true },
  { id: "it2", nome: "Inventário florestal a 100%", enviado: true },
  { id: "it3", nome: "Plano de exploração anual", enviado: false },
  { id: "it4", nome: "Estudo de impacto ambiental simplificado", enviado: false },
  { id: "it5", nome: "Plano de reflorestação", enviado: false },
  { id: "it6", nome: "Adenda social com comunidades", enviado: false },
  { id: "it7", nome: "Plano de segurança e prevenção de incêndios", enviado: false },
  { id: "it8", nome: "Programa de formação de mão-de-obra local", enviado: false },
];

export interface MinhaLicenca {
  id: string;
  tipo: "Exploração Florestal" | "Lenha, Carvão e PFNL" | "Fauna" | "Apicultura";
  codigo: string;
  campanha: string;
  validoAte: string;
  renovavel: boolean;
}

export const minhasLicencas: MinhaLicenca[] = [
  { id: "l1", tipo: "Exploração Florestal", codigo: "LAC-2026/0142", campanha: "2026", validoAte: "2026-12-31", renovavel: true },
  { id: "l2", tipo: "Lenha, Carvão e PFNL", codigo: "AL-2026/0331", campanha: "2026", validoAte: "2026-12-31", renovavel: true },
  { id: "l3", tipo: "Apicultura", codigo: "AP-2026/0098", campanha: "2026", validoAte: "2026-09-28", renovavel: false },
  { id: "l4", tipo: "Fauna", codigo: "FA-2025/0041", campanha: "2025", validoAte: "2025-12-31", renovavel: false },
];

export interface QuotaLinha {
  id: string;
  contexto: string; // área/concessão/licença
  especie: string;
  ano: string;
  autorizado: number;
  executado: number;
}

export const quotas: QuotaLinha[] = [
  { id: "q1", contexto: "CONC-2024/011 · LAC-2026/0142", especie: "Tola", ano: "2026", autorizado: 1200, executado: 410 },
  { id: "q2", contexto: "CONC-2024/011 · LAC-2026/0142", especie: "Sipo", ano: "2026", autorizado: 800, executado: 702 },
  { id: "q3", contexto: "CONC-2024/011 · LAC-2026/0142", especie: "Iroko", ano: "2026", autorizado: 450, executado: 433 },
  { id: "q4", contexto: "AR-CAB-0007 · AL-2026/0331", especie: "Lenha (esteres)", ano: "2026", autorizado: 600, executado: 180 },
  { id: "q5", contexto: "CONC-2024/011 · LAC-2025/0142", especie: "Tola", ano: "2025", autorizado: 1100, executado: 1087 },
];

export interface GuiaTransito {
  id: string;
  codigo: string;
  produto: string;
  origem: string;
  destino: string;
  estado: "Em trânsito" | "Concluída" | "Expirada";
  validoAte: string;
}

export const guias: GuiaTransito[] = [
  { id: "g1", codigo: "GT-2026-88412", produto: "24,5 m³ de Tola serrada", origem: "Cabinda", destino: "Luanda", estado: "Em trânsito", validoAte: "2026-09-17" },
  { id: "g2", codigo: "GT-2026-87001", produto: "18 m³ de Sipo em tora", origem: "Cabinda", destino: "Entreposto de Viana", estado: "Concluída", validoAte: "2026-07-29" },
  { id: "g3", codigo: "GT-2026-84502", produto: "12 m³ de Iroko serrado", origem: "Uíge", destino: "Luanda", estado: "Expirada", validoAte: "2026-06-10" },
];

export const certificados = [
  { id: "ct1", codigo: "CE-2026-1042", produto: "Estância de Buco-Zau — 96 m³ classificados", emitidoEm: "2026-08-12", escoamentoAte: "2026-11-12" },
  { id: "ct2", codigo: "CE-2026-0890", produto: "Estância de Maquela — 41 m³ classificados", emitidoEm: "2026-06-02", escoamentoAte: "2026-09-02" },
];

export interface NotaLiquidacao {
  id: string;
  codigo: string;
  tipo: "Taxa" | "Renda" | "Caução" | "Bónus";
  valor: number;
  estado: "Pendente" | "Paga";
  emissao: string;
}

export const notasLiquidacao: NotaLiquidacao[] = [
  { id: "n1", codigo: "NL-2026/0877", tipo: "Bónus", valor: 9500000, estado: "Pendente", emissao: "2026-09-05" },
  { id: "n2", codigo: "NL-2026/0812", tipo: "Renda", valor: 2100000, estado: "Pendente", emissao: "2026-08-28" },
  { id: "n3", codigo: "NL-2026/0544", tipo: "Taxa", valor: 185000, estado: "Paga", emissao: "2026-04-02" },
  { id: "n4", codigo: "NL-2024/0210", tipo: "Caução", valor: 4000000, estado: "Paga", emissao: "2024-11-20" },
];

export const minhasCandidaturas = [
  { id: "ca1", concurso: "CP-2025/07", titulo: "Concessão Florestal do Cuando-Cubango — Menongue", estado: "Em avaliação", submetida: "2026-01-22" },
];

export const processosFiscalizacao = [
  { id: "f1", auto: "AN-2026/0031", motivo: "Transporte de produto florestal com guia fora do prazo de validade", estado: "Aguarda defesa do operador", prazoDefesa: "2026-09-30" },
];

export const notificacoes = [
  { id: "nt1", tipo: "Documento", texto: "A certidão de conformidade tributária expira a 04/10/2026.", data: "2026-09-10", lida: false },
  { id: "nt2", tipo: "Pagamento", texto: "Nota de liquidação NL-2026/0877 (bónus) aguarda pagamento.", data: "2026-09-05", lida: false },
  { id: "nt3", tipo: "Licença", texto: "A licença AP-2026/0098 (Apicultura) expira em 16 dias.", data: "2026-09-12", lida: true },
  { id: "nt4", tipo: "Concurso", texto: "Novo concurso público CP-2026/02 — Alto-Zambeze aberto a candidaturas.", data: "2026-09-01", lida: true },
];

// ---------- Helpers ----------

export const hoje = () => new Date();

export function diasAte(iso: string): number {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function estadoCampanha(r: CampanhaRow): "A abrir" | "Aberto" | "Encerrado" {
  const now = Date.now();
  if (now < new Date(r.abertura).getTime()) return "A abrir";
  if (now > new Date(r.encerramento + "T23:59:59").getTime()) return "Encerrado";
  return "Aberto";
}

export function estadoConcurso(c: Concurso): "Aberto" | "A encerrar em breve" | "Encerrado" {
  const now = Date.now();
  const fim = new Date(c.prazo).getTime();
  if (now > fim) return "Encerrado";
  if (fim - now < 20 * 86400000) return "A encerrar em breve";
  return "Aberto";
}

export function estadoDocumento(validoAte: string | null): "Válido" | "A expirar" | "Expirado" {
  if (!validoAte) return "Válido";
  const d = diasAte(validoAte);
  if (d < 0) return "Expirado";
  if (d <= 30) return "A expirar";
  return "Válido";
}

export const kz = (v: number) => v.toLocaleString("pt-AO", { style: "currency", currency: "AOA", maximumFractionDigits: 0 });

export const fmtData = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T00:00:00" : "")).toLocaleDateString("pt-AO", { day: "2-digit", month: "2-digit", year: "numeric" });
