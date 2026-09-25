/**
 * Divisão administrativa de Angola (mock estruturado): Província → Município → Comuna.
 * Estrutura pronta para ser substituída por dados de API sem alterar a UI.
 */

export interface CommuneNode {
  name: string;
}

export interface MunicipalityNode {
  name: string;
  communes: string[];
}

export interface ProvinceNode {
  name: string;
  municipalities: MunicipalityNode[];
}

const m = (name: string, communes: string[]): MunicipalityNode => ({ name, communes });

export const ANGOLA_GEO: ProvinceNode[] = [
  {
    name: "Bengo",
    municipalities: [
      m("Caxito", ["Caxito", "Mabubas", "Úcua"]),
      m("Dande", ["Barra do Dande", "Quicabo"]),
      m("Ambriz", ["Ambriz", "Bela Vista", "Tabi"]),
    ],
  },
  {
    name: "Benguela",
    municipalities: [
      m("Benguela", ["Benguela", "Praia Bebé", "Baía Farta"]),
      m("Lobito", ["Lobito", "Canata", "Egito Praia"]),
      m("Ganda", ["Ganda", "Babaera", "Casseque"]),
      m("Cubal", ["Cubal", "Capupa", "Yambala"]),
    ],
  },
  {
    name: "Bié",
    municipalities: [
      m("Kuito", ["Kuito", "Chicala", "Trumba"]),
      m("Andulo", ["Andulo", "Calucinga", "Cassumbe"]),
      m("Camacupa", ["Camacupa", "Cuanza", "Umpulo"]),
    ],
  },
  {
    name: "Cabinda",
    municipalities: [
      m("Cabinda", ["Cabinda", "Tando Zinze", "Malembo"]),
      m("Buco-Zau", ["Buco-Zau", "Necuto", "Inhuca"]),
      m("Belize", ["Belize", "Luali", "Miconge"]),
    ],
  },
  {
    name: "Cuando",
    municipalities: [
      m("Mavinga", ["Mavinga", "Cutuile", "Luengue"]),
      m("Rivungo", ["Rivungo", "Luiana"]),
      m("Dirico", ["Dirico", "Mucusso", "Xamavera"]),
    ],
  },
  {
    name: "Cubango",
    municipalities: [
      m("Menongue", ["Menongue", "Caiundo", "Cueio"]),
      m("Cuchi", ["Cuchi", "Chinguanja", "Vissati"]),
      m("Calai", ["Calai", "Maué"]),
    ],
  },
  {
    name: "Cuanza Norte",
    municipalities: [
      m("Ndalatando", ["Ndalatando", "Lucala", "Zenza do Itombe"]),
      m("Cazengo", ["Cazengo", "Canhoca"]),
      m("Golungo Alto", ["Golungo Alto", "Cerca", "Quiapeco"]),
    ],
  },
  {
    name: "Cuanza Sul",
    municipalities: [
      m("Sumbe", ["Sumbe", "Gangula", "Quicombo"]),
      m("Porto Amboim", ["Porto Amboim", "Capolo"]),
      m("Gabela", ["Gabela", "Assango", "Conda"]),
      m("Waku Kungo", ["Waku Kungo", "Cariango", "Sanga"]),
    ],
  },
  {
    name: "Cunene",
    municipalities: [
      m("Ondjiva", ["Ondjiva", "Môngua", "Nehone"]),
      m("Cahama", ["Cahama", "Otchinjau"]),
      m("Curoca", ["Oncócua", "Chitado"]),
    ],
  },
  {
    name: "Huambo",
    municipalities: [
      m("Huambo", ["Huambo", "Calima", "Chipipa"]),
      m("Caála", ["Caála", "Catata", "Cuima"]),
      m("Bailundo", ["Bailundo", "Bimbe", "Lunge"]),
    ],
  },
  {
    name: "Huíla",
    municipalities: [
      m("Lubango", ["Lubango", "Arimba", "Hoque"]),
      m("Matala", ["Matala", "Capelongo", "Mulondo"]),
      m("Chibia", ["Chibia", "Jau", "Quihita"]),
    ],
  },
  {
    name: "Icolo e Bengo",
    municipalities: [
      m("Catete", ["Catete", "Bom Jesus", "Cabiri"]),
      m("Quiçama", ["Muxima", "Demba Chio", "Cabo Ledo"]),
    ],
  },
  {
    name: "Luanda",
    municipalities: [
      m("Luanda", ["Ingombota", "Maianga", "Rangel"]),
      m("Belas", ["Benfica", "Ramiros", "Barra do Cuanza"]),
      m("Cacuaco", ["Cacuaco", "Funda", "Kikolo"]),
      m("Viana", ["Viana", "Calumbo", "Zango"]),
    ],
  },
  {
    name: "Lunda Norte",
    municipalities: [
      m("Dundo", ["Dundo", "Chitato", "Lóvua"]),
      m("Lucapa", ["Lucapa", "Camissombo", "Xinge"]),
      m("Cambulo", ["Cambulo", "Canzar", "Muvulege"]),
    ],
  },
  {
    name: "Lunda Sul",
    municipalities: [
      m("Saurimo", ["Saurimo", "Sombo", "Mona Quimbundo"]),
      m("Cacolo", ["Cacolo", "Alto Chicapa", "Muriege"]),
      m("Dala", ["Dala", "Luma Cassai"]),
    ],
  },
  {
    name: "Malanje",
    municipalities: [
      m("Malanje", ["Malanje", "Cambaxe", "Ngola Luíje"]),
      m("Cacuso", ["Cacuso", "Pungo Andongo", "Lombe"]),
      m("Cangandala", ["Cangandala", "Culamagia", "Bembo"]),
    ],
  },
  {
    name: "Moxico",
    municipalities: [
      m("Luena", ["Luena", "Cangamba", "Lucusse"]),
      m("Camanongue", ["Camanongue", "Cazombo"]),
      m("Léua", ["Léua", "Sacassange"]),
    ],
  },
  {
    name: "Moxico Leste",
    municipalities: [
      m("Cazombo", ["Cazombo", "Calunda", "Caianda"]),
      m("Lumbala N'guimbo", ["Lumbala N'guimbo", "Luvuei", "Ninda"]),
    ],
  },
  {
    name: "Namibe",
    municipalities: [
      m("Moçâmedes", ["Moçâmedes", "Bentiaba", "Forte Santa Rita"]),
      m("Tômbwa", ["Tômbwa", "Baía dos Tigres"]),
      m("Virei", ["Virei", "Caraculo"]),
    ],
  },
  {
    name: "Uíge",
    municipalities: [
      m("Uíge", ["Uíge", "Candela", "Uumbo"]),
      m("Negage", ["Negage", "Dimuca", "Quissengue"]),
      m("Maquela do Zombo", ["Maquela do Zombo", "Béu", "Sacandica"]),
    ],
  },
  {
    name: "Zaire",
    municipalities: [
      m("M'banza Kongo", ["M'banza Kongo", "Caluca", "Luvo"]),
      m("Soyo", ["Soyo", "Pedra do Feitiço", "Quelo"]),
      m("N'zeto", ["N'zeto", "Musserra", "Quindeje"]),
    ],
  },
];

export const provinceNames = () => ANGOLA_GEO.map((p) => p.name);

export const municipalitiesOf = (province?: string | null) =>
  ANGOLA_GEO.find((p) => p.name === province)?.municipalities.map((mun) => mun.name) ?? [];

export const communesOf = (province?: string | null, municipality?: string | null) =>
  ANGOLA_GEO.find((p) => p.name === province)?.municipalities.find((mun) => mun.name === municipality)?.communes ?? [];

export interface GeoLocation {
  province: string;
  municipality: string;
  commune: string;
}

export const formatLocation = (location: Partial<GeoLocation> | undefined) =>
  [location?.province, location?.municipality, location?.commune].filter(Boolean).join(" · ") || "—";

/** Localização determinística a partir de um índice — usada para popular mocks. */
export const geoAt = (index: number): GeoLocation => {
  const province = ANGOLA_GEO[index % ANGOLA_GEO.length];
  const municipality = province.municipalities[index % province.municipalities.length];
  const commune = municipality.communes[index % municipality.communes.length];
  return { province: province.name, municipality: municipality.name, commune };
};
