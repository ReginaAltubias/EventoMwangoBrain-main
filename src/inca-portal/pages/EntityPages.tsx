import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListingTemplate } from "@/sigaflo/templates/ListingTemplate";
import { DetailTemplate } from "@/sigaflo/templates/DetailTemplate";
import { entidadeProdutor } from "@/inca-portal/data";
import { ExploracaoMapa } from "@/inca-portal/components/ExploracaoMapa";
import { LocationMap } from "@/inca-portal/components/LocationMap";
import * as inca from "@/mocks/inca";
import type { DetailSection } from "@/sigaflo/core/config";

const titulos: Record<string, string> = {
  fazendas: "As Minhas Explorações", parcelas: "As Minhas Parcelas", colheitas: "Colheitas", manutencoes: "Manutenções Agrícolas",
  lotes: "Os Meus Lotes", transformacoes: "Transformações", embalagens: "Embalagens", stock: "O Meu Stock",
  movimentos: "Movimentos de Stock", mercado: "Preços de Mercado", variedades: "Variedades de Café",
};

export function ProducerEntityListPage() {
  const { entity: key } = useParams();
  const entity = entidadeProdutor(key);
  if (!entity) return <p className="text-sm text-muted-foreground">Área não encontrada.</p>;
  return <div className="space-y-6"><div><h1 className="font-display text-lg font-bold">{titulos[entity.key] ?? entity.label}</h1><p className="mt-1 text-sm text-muted-foreground">Consulte os dados registados e o respectivo histórico.</p></div><ListingTemplate entity={entity} basePath="/painel" /></div>;
}

export function ProducerEntityDetailPage() {
  const { entity: key, id } = useParams();
  const entity = entidadeProdutor(key);
  const row = entity?.rows().find((item) => entity.id(item) === id);
  if (!entity || !row) return <p className="text-sm text-muted-foreground">Registo não encontrado.</p>;
  const sections: DetailSection[] = entity.sections(row).filter((section) => !section.links).map((section, index) => ({ ...section, tab: index === 0 ? "Resumo" : section.title }));
  if (key === "fazendas") {
    sections.splice(1, 0, { title: "Mapa da exploração", tab: "Mapa e parcelas", content: <ExploracaoMapa farmId={entity.id(row)} /> } as DetailSection);
  }
  if (key === "stock") {
    const storage = row as inca.WarehouseStorage;
    const warehouse = inca.coffeeWarehouses.find((item) => item.id === storage.warehouseId);
    if (warehouse) {
      sections.splice(1, 0, {
        title: "Localização do armazém",
        tab: "Mapa do armazém",
        content: <LocationMap location={warehouse.location} title={warehouse.name} description={`${warehouse.description} · ${warehouse.code}`} markerLabel={`${warehouse.name} · ${storage.lotPackagingCode}`} />,
      } as DetailSection);
    }
  }
  return <DetailTemplate title={entity.title(row)} subtitle={entity.subtitle?.(row)} status={entity.status?.(row)} sections={sections} tabbed />;
}

export function ExploitationsOverview() {
  const entity = entidadeProdutor("fazendas");
  if (!entity) return null;
  return <div className="space-y-6"><div><h1 className="font-display text-lg font-bold">As Minhas Explorações</h1><p className="mt-1 text-sm text-muted-foreground">Consulte as explorações, parcelas e colheitas registadas.</p></div>{entity.rows().map((farm) => <article key={entity.id(farm)} className="card-elevated rounded-xl p-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">{entity.title(farm)}</h2><p className="text-sm text-muted-foreground">{entity.subtitle?.(farm)}</p></div><Button asChild size="sm"><Link to={`/painel/fazendas/${entity.id(farm)}`}><Eye className="mr-2 h-4 w-4" />Ver tudo</Link></Button></div><ExploracaoMapa farmId={entity.id(farm)} /></article>)}</div>;
}

export const BackToPortal = () => <Button asChild variant="ghost" size="sm"><Link to="/painel"><ArrowLeft className="mr-2 h-4 w-4" />Visão geral</Link></Button>;