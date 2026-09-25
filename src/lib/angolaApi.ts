// Divisões administrativas de Angola — dados locais (sem chamadas a API externa).
// Províncias (18) e respectivos municípios. A comuna e a aldeia são texto livre.

export interface AngolaLocation {
  nome: string;
  slug: string;
}

const slugify = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-");

export const MUNICIPIOS_POR_PROVINCIA: Record<string, string[]> = {
  "Bengo": ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
  "Benguela": ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongorói", "Cubal", "Ganda", "Lobito"],
  "Bié": ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Cuito", "Nharea"],
  "Cabinda": ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
  "Cuando-Cubango": ["Calai", "Cuangar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Menongue", "Nancova", "Rivungo"],
  "Cuanza-Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Gonguembo", "Lucala", "Quiculungo", "Samba Cajú"],
  "Cuanza-Sul": ["Amboim", "Cassongue", "Cela", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
  "Cunene": ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
  "Huambo": ["Bailundo", "Caála", "Catchiungo", "Chicala-Choloanga", "Chinjenje", "Ekunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Ucuma"],
  "Huíla": ["Caconda", "Cacula", "Caluquembe", "Chiange", "Chibia", "Chicomba", "Chipindo", "Cuvango", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
  "Luanda": ["Belas", "Cacuaco", "Cazenga", "Icolo e Bengo", "Luanda", "Quiçama", "Talatona", "Viana", "Kilamba Kiaxi"],
  "Lunda-Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuílo", "Lubalo", "Lucapa", "Xá-Muteba"],
  "Lunda-Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
  "Malanje": ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cuaba Nzogo", "Cunda-Dia-Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Mucari", "Quela", "Quirima"],
  "Moxico": ["Alto Zambeze", "Bundas", "Camanongue", "Cameia", "Léua", "Luacano", "Luau", "Luchazes", "Luena", "Lumbala-Nguimbo"],
  "Namibe": ["Bibala", "Camucuio", "Moçâmedes", "Tômbwa", "Virei"],
  "Uíge": ["Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Macocola", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uíge", "Zombo"],
  "Zaire": ["Cuimba", "Mbanza Congo", "Nóqui", "Nzeto", "Soyo", "Tomboco"],
};

export const PROVINCIAS: AngolaLocation[] = Object.keys(MUNICIPIOS_POR_PROVINCIA).map((nome) => ({
  nome,
  slug: slugify(nome),
}));

// Alias mantido para compatibilidade com o código existente.
export const PROVINCIAS_FALLBACK = PROVINCIAS;

export function municipiosDaProvincia(provincia: string): AngolaLocation[] {
  return (MUNICIPIOS_POR_PROVINCIA[provincia] ?? []).map((nome) => ({ nome, slug: slugify(nome) }));
}
