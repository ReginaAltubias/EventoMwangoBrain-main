/**
 * Dados de demonstração do IDA (Instituto de Desenvolvimento Agrário).
 * 100% locais — o IDA consolida os produtores registados pelo INCA, IDF, INCER e pelo próprio IDA.
 */

export type Instituicao = "INCA" | "IDF" | "INCER" | "IDA";

export interface Terra {
  id: string;
  codigo: string;
  produtorId: string;
  designacao: string;
  areaHa: number;
  uso: string;
  regime: string;
  provincia: string;
  municipio: string;
  estado: string;
}

export interface Colheita {
  id: string;
  codigo: string;
  produtorId: string;
  terraId: string;
  cultura: string;
  campanha: string;
  data: string;
  quantidadeKg: number;
  qualidade: string;
  destino: string;
  estado: string;
}

export interface Consumo {
  id: string;
  codigo: string;
  produtorId: string;
  recurso: string;
  quantidade: number;
  unidade: string;
  periodo: string;
  custoKz: number;
  estado: string;
}

export interface Financa {
  id: string;
  codigo: string;
  produtorId: string;
  tipo: string;
  descricao: string;
  valorKz: number;
  data: string;
  estado: string;
}

export interface Divida {
  id: string;
  codigo: string;
  produtorId: string;
  origem: string;
  valorKz: number;
  pagoKz: number;
  vencimento: string;
  estado: string;
}

export interface Produtor {
  id: string;
  codigo: string;
  nome: string;
  instituicao: Instituicao;
  actividade: string;
  tipo: string;
  provincia: string;
  municipio: string;
  comuna: string;
  latitude: number;
  longitude: number;
  telefone: string;
  email: string;
  documento: string;
  responsavel: string;
  dataRegisto: string;
  estado: string;
}

const LOCAIS: { provincia: string; municipio: string; comuna: string; lat: number; lng: number }[] = [
  { provincia: "Cuanza Sul", municipio: "Amboim", comuna: "Gabela", lat: -10.848, lng: 14.369 },
  { provincia: "Huambo", municipio: "Caála", comuna: "Calenga", lat: -12.852, lng: 15.56 },
  { provincia: "Uíge", municipio: "Negage", comuna: "Quisseque", lat: -7.765, lng: 15.271 },
  { provincia: "Cabinda", municipio: "Buco-Zau", comuna: "Necuto", lat: -4.775, lng: 12.601 },
  { provincia: "Malanje", municipio: "Cacuso", comuna: "Lombe", lat: -9.398, lng: 15.744 },
  { provincia: "Bié", municipio: "Cuito", comuna: "Chicala", lat: -12.383, lng: 16.938 },
  { provincia: "Huíla", municipio: "Chibia", comuna: "Capunda", lat: -15.183, lng: 13.692 },
  { provincia: "Benguela", municipio: "Ganda", comuna: "Ebanga", lat: -12.999, lng: 14.152 },
  { provincia: "Zaire", municipio: "Soyo", comuna: "Quelo", lat: -6.135, lng: 12.371 },
  { provincia: "Cuanza Norte", municipio: "Cazengo", comuna: "Ndalatando", lat: -9.298, lng: 14.911 },
];

const PERFIS: Record<Instituicao, { actividade: string; culturas: string[]; recursos: string[]; tipos: string[] }> = {
  INCA: { actividade: "Cafeicultura", culturas: ["Café Robusta", "Café Arábica"], recursos: ["Fertilizante", "Sacos de juta", "Combustível"], tipos: ["Produtor familiar", "Cooperativa", "Empresa agrícola"] },
  IDF: { actividade: "Exploração florestal", culturas: ["Madeira em toro", "Carvão vegetal", "Lenha"], recursos: ["Quota de madeira", "Combustível", "Sementes florestais"], tipos: ["Operador florestal", "Cooperativa florestal"] },
  INCER: { actividade: "Cereais", culturas: ["Milho", "Massango", "Trigo", "Arroz"], recursos: ["Semente certificada", "Fertilizante", "Armazenagem"], tipos: ["Produtor familiar", "Empresa agrícola"] },
  IDA: { actividade: "Agricultura diversificada", culturas: ["Feijão", "Mandioca", "Batata-rena", "Banana"], recursos: ["Semente certificada", "Fertilizante", "Serviço de tractor", "Água de rega"], tipos: ["Produtor familiar", "Cooperativa", "Fazenda"] },
};

const NOMES = [
  "Kimbo Verde, Lda.", "Cooperativa Kilamba", "Fazenda Nzagi", "António Muhongo", "Maria Kiaco",
  "Agro Lombe, Lda.", "Cooperativa Ebanga", "José Chilombo", "Fazenda Kituxi", "Mbanza Agro, S.A.",
  "Joana Nzinga", "Cooperativa Lucala", "Domingos Kapapelo", "Fazenda Sanza", "Agro Cubal, Lda.",
  "Rosa Muteka", "Cooperativa Cuango", "Pedro Ngola", "Fazenda Kwanza", "Agro Longa, Lda.",
  "Esperança Tchissola", "Cooperativa Nambuangongo", "Manuel Sacaia", "Fazenda Mucoso", "Agro Calenga, Lda.",
  "Teresa Bumba", "Cooperativa Chinguar", "Adão Kalunga", "Fazenda Bengo", "Agro Kuvale, Lda.",
  "Filomena Cassinda", "Cooperativa Quibala",
];

const RESPONSAVEIS = ["Delegação INCA", "Delegação IDF", "Delegação INCER", "Delegação IDA", "EDA Municipal", "Estação de Desenvolvimento Agrário"];
const ESTADOS = ["Activo", "Activo", "Activo", "Em validação", "Suspenso"];

/** Gerador determinístico simples (sem dependências). */
const rnd = (seed: number) => {
  const x = Math.sin(seed * 9973.13) * 10000;
  return x - Math.floor(x);
};
const pick = <T,>(list: T[], seed: number) => list[Math.floor(rnd(seed) * list.length) % list.length];
const num = (seed: number, min: number, max: number) => Math.round(min + rnd(seed) * (max - min));

const INSTITUICOES: Instituicao[] = ["INCA", "IDF", "INCER", "IDA"];

export const produtores: Produtor[] = NOMES.map((nome, index) => {
  const instituicao = INSTITUICOES[index % 4];
  const local = LOCAIS[index % LOCAIS.length];
  const perfil = PERFIS[instituicao];
  return {
    id: `prd-${index + 1}`,
    codigo: `${instituicao}-2026-${String(index + 1).padStart(4, "0")}`,
    nome,
    instituicao,
    actividade: perfil.actividade,
    tipo: pick(perfil.tipos, index + 11),
    provincia: local.provincia,
    municipio: local.municipio,
    comuna: local.comuna,
    latitude: local.lat + (rnd(index + 3) - 0.5) * 0.08,
    longitude: local.lng + (rnd(index + 7) - 0.5) * 0.08,
    telefone: `+244 9${num(index + 21, 20, 29)} ${num(index + 31, 100, 999)} ${num(index + 41, 100, 999)}`,
    email: `${nome.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@agro.ao`,
    documento: `${num(index + 51, 100000, 999999)}LA0${num(index + 61, 10, 49)}`,
    responsavel: pick(RESPONSAVEIS, index + 71),
    dataRegisto: `202${num(index + 81, 3, 6)}-0${num(index + 91, 1, 9)}-1${num(index + 101, 0, 9)}`,
    estado: pick(ESTADOS, index + 111),
  };
});

export const terras: Terra[] = produtores.flatMap((produtor, index) =>
  Array.from({ length: 1 + (index % 3) }, (_, i) => {
    const seed = index * 10 + i;
    return {
      id: `ter-${produtor.id}-${i + 1}`,
      codigo: `TER-2026-${String(seed + 100).padStart(4, "0")}`,
      produtorId: produtor.id,
      designacao: `${produtor.municipio} · Talhão ${String.fromCharCode(65 + i)}`,
      areaHa: num(seed + 5, 3, 480),
      uso: pick(PERFIS[produtor.instituicao].culturas, seed + 9),
      regime: pick(["Título de uso da terra", "Posse consuetudinária", "Contrato de concessão", "Arrendamento"], seed + 13),
      provincia: produtor.provincia,
      municipio: produtor.municipio,
      estado: pick(["Em exploração", "Em exploração", "Em pousio", "Em regularização"], seed + 17),
    };
  }),
);

export const colheitas: Colheita[] = terras.flatMap((terra, index) =>
  Array.from({ length: 1 + (index % 2) }, (_, i) => {
    const seed = index * 20 + i;
    return {
      id: `col-${terra.id}-${i + 1}`,
      codigo: `COL-2026-${String(seed + 200).padStart(4, "0")}`,
      produtorId: terra.produtorId,
      terraId: terra.id,
      cultura: terra.uso,
      campanha: pick(["2025/2026", "2026/2027"], seed + 3),
      data: `2026-0${num(seed + 7, 3, 9)}-${String(num(seed + 11, 1, 28)).padStart(2, "0")}`,
      quantidadeKg: num(seed + 13, 800, 42000),
      qualidade: pick(["Categoria A", "Categoria B", "Categoria C"], seed + 19),
      destino: pick(["Mercado interno", "Exportação", "Indústria de transformação", "Autoconsumo"], seed + 23),
      estado: pick(["Validada", "Validada", "Em validação"], seed + 29),
    };
  }),
);

export const consumos: Consumo[] = produtores.flatMap((produtor, index) =>
  Array.from({ length: 2 }, (_, i) => {
    const seed = index * 30 + i;
    const recurso = pick(PERFIS[produtor.instituicao].recursos, seed + 5);
    const madeira = recurso === "Quota de madeira";
    return {
      id: `cns-${produtor.id}-${i + 1}`,
      codigo: `CNS-2026-${String(seed + 300).padStart(4, "0")}`,
      produtorId: produtor.id,
      recurso,
      quantidade: madeira ? num(seed + 9, 40, 900) : num(seed + 9, 20, 3200),
      unidade: madeira ? "m³" : pick(["kg", "litros", "sacos", "horas"], seed + 11),
      periodo: pick(["1.º trimestre 2026", "2.º trimestre 2026", "3.º trimestre 2026"], seed + 15),
      custoKz: num(seed + 17, 120000, 9800000),
      estado: pick(["Consumido", "Consumido", "Em curso"], seed + 21),
    };
  }),
);

export const financas: Financa[] = produtores.flatMap((produtor, index) =>
  Array.from({ length: 2 }, (_, i) => {
    const seed = index * 40 + i;
    const tipo = pick(["Crédito agrícola", "Subsídio de campanha", "Receita de venda", "Apoio a insumos"], seed + 3);
    return {
      id: `fin-${produtor.id}-${i + 1}`,
      codigo: `FIN-2026-${String(seed + 400).padStart(4, "0")}`,
      produtorId: produtor.id,
      tipo,
      descricao: `${tipo} · campanha 2026 (${produtor.instituicao})`,
      valorKz: num(seed + 7, 450000, 78000000),
      data: `2026-0${num(seed + 9, 1, 9)}-${String(num(seed + 13, 1, 28)).padStart(2, "0")}`,
      estado: pick(["Liquidado", "Liquidado", "Em processamento"], seed + 19),
    };
  }),
);

export const dividas: Divida[] = produtores.flatMap((produtor, index) => {
  const quantidade = index % 3 === 0 ? 2 : 1;
  return Array.from({ length: quantidade }, (_, i) => {
    const seed = index * 50 + i;
    const valor = num(seed + 5, 380000, 46000000);
    const estado = pick(["Pendente", "Em atraso", "Liquidada", "Pendente"], seed + 9);
    return {
      id: `div-${produtor.id}-${i + 1}`,
      codigo: `DIV-2026-${String(seed + 500).padStart(4, "0")}`,
      produtorId: produtor.id,
      origem: pick(["Crédito de campanha", "Taxa de exploração", "Insumos a crédito", "Serviço de mecanização", "Renda de terra"], seed + 11),
      valorKz: valor,
      pagoKz: estado === "Liquidada" ? valor : Math.round(valor * rnd(seed + 15) * 0.6),
      vencimento: `2026-${String(num(seed + 17, 1, 12)).padStart(2, "0")}-${String(num(seed + 19, 1, 28)).padStart(2, "0")}`,
      estado,
    };
  });
});

export const kz = (value: number) => `${value.toLocaleString("pt-AO")} Kz`;
export const kg = (value: number) => `${value.toLocaleString("pt-AO")} kg`;
export const dataPt = (value: string) => value.split("-").reverse().join("/");

export const produtorPorId = (id: string) => produtores.find((item) => item.id === id);
export const terrasDe = (id: string) => terras.filter((item) => item.produtorId === id);
export const colheitasDe = (id: string) => colheitas.filter((item) => item.produtorId === id);
export const consumosDe = (id: string) => consumos.filter((item) => item.produtorId === id);
export const financasDe = (id: string) => financas.filter((item) => item.produtorId === id);
export const dividasDe = (id: string) => dividas.filter((item) => item.produtorId === id);

export const INSTITUICOES_INFO: { key: Instituicao; nome: string; descricao: string }[] = [
  { key: "INCA", nome: "Instituto Nacional do Café", descricao: "Produtores de café registados na cadeia cafeeira." },
  { key: "IDF", nome: "Instituto de Desenvolvimento Florestal", descricao: "Operadores e comunidades da exploração florestal." },
  { key: "INCER", nome: "Instituto Nacional de Cereais", descricao: "Produtores de milho, massango, trigo e arroz." },
  { key: "IDA", nome: "Instituto de Desenvolvimento Agrário", descricao: "Produtores acompanhados directamente pelas EDA." },
];

export const resumoInstituicao = (key: Instituicao) => {
  const lista = produtores.filter((item) => item.instituicao === key);
  const ids = new Set(lista.map((item) => item.id));
  const area = terras.filter((item) => ids.has(item.produtorId)).reduce((sum, item) => sum + item.areaHa, 0);
  const producao = colheitas.filter((item) => ids.has(item.produtorId)).reduce((sum, item) => sum + item.quantidadeKg, 0);
  const divida = dividas.filter((item) => ids.has(item.produtorId) && item.estado !== "Liquidada").reduce((sum, item) => sum + (item.valorKz - item.pagoKz), 0);
  const financiamento = financas.filter((item) => ids.has(item.produtorId)).reduce((sum, item) => sum + item.valorKz, 0);
  return { produtores: lista.length, area, producao, divida, financiamento };
};

export const totalDividaPendente = dividas.filter((item) => item.estado !== "Liquidada").reduce((sum, item) => sum + (item.valorKz - item.pagoKz), 0);
export const totalArea = terras.reduce((sum, item) => sum + item.areaHa, 0);
export const totalProducao = colheitas.reduce((sum, item) => sum + item.quantidadeKg, 0);
export const totalFinanciamento = financas.reduce((sum, item) => sum + item.valorKz, 0);

export const notificacoesIda = [
  { id: "n1", tipo: "Dívidas", texto: "12 produtores apresentam dívidas em atraso na campanha 2026.", data: "2026-09-21", lida: false },
  { id: "n2", tipo: "Cadastro", texto: "6 produtores do INCER aguardam validação de cadastro.", data: "2026-09-19", lida: false },
  { id: "n3", tipo: "Colheitas", texto: "As colheitas do 2.º trimestre do IDA foram consolidadas.", data: "2026-09-15", lida: true },
  { id: "n4", tipo: "Florestal", texto: "Consumo de quota de madeira acima de 80% em 3 operadores do IDF.", data: "2026-09-11", lida: true },
];
