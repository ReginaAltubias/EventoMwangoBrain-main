import { useParams } from "react-router-dom";
import { ListingTemplate } from "@/sigaflo/templates/ListingTemplate";
import { DetailTemplate } from "@/sigaflo/templates/DetailTemplate";
import { LocationMap } from "@/inca-portal/components/LocationMap";
import { entidadeIda } from "@/ida-portal/entities";
import type { Produtor } from "@/ida-portal/data";
import type { DetailSection } from "@/sigaflo/core/config";

const descricoes: Record<string, string> = {
  produtores: "Todos os produtores registados pelo INCA, IDF, INCER e IDA.",
  terras: "Terras cadastradas, área, uso e regime de posse.",
  colheitas: "Colheitas declaradas por campanha, cultura e destino.",
  consumos: "Consumo de insumos, quotas e serviços por produtor.",
  financas: "Créditos, subsídios, apoios e receitas de venda.",
  dividas: "Dívidas pagas, pendentes e em atraso.",
};

export function IdaEntityListPage() {
  const { entity: key } = useParams();
  const entity = entidadeIda(key);
  if (!entity) return <p className="text-sm text-muted-foreground">Área não encontrada.</p>;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-lg font-bold">{entity.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{descricoes[entity.key]}</p>
      </div>
      <ListingTemplate entity={entity} basePath="/painel" />
    </div>
  );
}

export function IdaEntityDetailPage() {
  const { entity: key, id } = useParams();
  const entity = entidadeIda(key);
  const row = entity?.rows().find((item) => entity.id(item) === id);
  if (!entity || !row) return <p className="text-sm text-muted-foreground">Registo não encontrado.</p>;
  const sections: DetailSection[] = entity.sections(row).map((section, index) => ({ ...section, tab: index === 0 ? "Resumo" : section.title }));
  if (key === "produtores") {
    const produtor = row as Produtor;
    sections.splice(1, 0, {
      title: "Localização do produtor",
      tab: "Mapa",
      content: (
        <LocationMap
          location={{ province: produtor.provincia, municipality: produtor.municipio, commune: produtor.comuna, latitude: produtor.latitude, longitude: produtor.longitude }}
          title={produtor.nome}
          description={`${produtor.codigo} · ${produtor.actividade} · ${produtor.instituicao}`}
          markerLabel={produtor.nome}
        />
      ),
    });
  }
  return <DetailTemplate title={entity.title(row)} subtitle={entity.subtitle?.(row)} status={entity.status?.(row)} sections={sections} tabbed />;
}
