import { useParams } from "react-router-dom";
import { DetailTemplate } from "@/sigaflo/templates/DetailTemplate";
import { findDomain, findEntity } from "@/sigaflo/domains/registry";
import type { DetailSection, ExpandedDetailRecord } from "@/sigaflo/core/config";
import { DossierArchive, type DossierDocument } from "@/sigaflo/templates/DossierArchive";

const dossierFileName = (value: string) => `${value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}.pdf`;

const universalArchive = (entityLabel: string, title: string, id: string, sections: DetailSection[]): DetailSection => {
  const generated: DossierDocument[] = [
    {
      id: `${id}-official-record`,
      title: `Ficha oficial — ${title}`,
      category: "Registo administrativo",
      fileName: dossierFileName(`ficha oficial ${entityLabel} ${title}`),
      status: "Validado",
      date: "2026-09-17",
      signedBy: "Instituto Nacional do Café",
      reference: id.slice(0, 12).toUpperCase(),
    },
    ...sections.filter((section) => section.fields?.length || section.table?.rows.length).map((section, index) => ({
      id: `${id}-section-${index}`,
      title: `Extracto — ${section.title}`,
      category: section.title.toLowerCase().includes("finance") || section.title.toLowerCase().includes("dívida") ? "Documento financeiro" : "Documento do processo",
      fileName: dossierFileName(`${section.title} ${title}`),
      status: "Registado",
      date: `2026-0${Math.min(index + 1, 9)}-15`,
      reference: `${id.slice(0, 8).toUpperCase()}/${index + 1}`,
    })),
  ];

  return {
    tab: "Arquivo",
    title: "Arquivo e actos administrativos",
    description: "Cópias consolidadas dos documentos, extractos e actos que pertencem a este registo.",
    content: <DossierArchive documents={generated} />,
  };
};

const organizeSectionsIntoTabs = (sections: DetailSection[]): DetailSection[] =>
  sections.map((section, index) => {
    if (section.tab) return section;
    if (section.title.toLowerCase().includes("arquivo")) return { ...section, tab: "Arquivo" };
    if (index === 0 || (section.fields && !section.table && !section.content)) return { ...section, tab: "Resumo" };
    return { ...section, tab: section.title };
  });

const expandRelations = (
  sections: DetailSection[],
  visited: Set<string>,
): ExpandedDetailRecord[] =>
  sections.flatMap((section) =>
    (section.links ?? []).flatMap((link) => {
      const relationKey = `${link.entity}:${link.id}`;
      if (visited.has(relationKey)) return [];

      const relatedEntity = findEntity("cafe", link.entity);
      const relatedRow = relatedEntity?.rows().find((item) => relatedEntity.id(item) === link.id);
      if (!relatedEntity || !relatedRow) return [];

      const nextVisited = new Set(visited);
      nextVisited.add(relationKey);
      const relatedSections = relatedEntity.sections(relatedRow);

      return [{
        key: relationKey,
        label: relatedEntity.singular,
        title: relatedEntity.title(relatedRow),
        subtitle: relatedEntity.subtitle?.(relatedRow),
        status: relatedEntity.status?.(relatedRow),
        sections: relatedSections.filter((item) => !item.links),
        related: expandRelations(relatedSections, nextVisited),
      }];
    }),
  );

const EntityDetailPage = () => {
  const { entity: entityKey, id } = useParams();
  const domain = findDomain("cafe");
  const entity = findEntity("cafe", entityKey);
  if (!domain || !entity) return null;

  const row = entity.rows().find((item) => entity.id(item) === id);
  if (!row) {
    return (
      <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
        Registo não encontrado nos dados de demonstração.
      </div>
    );
  }

  const sections = entity.sections(row);
  const visibleSections = sections.filter((section) => !section.links);
  const completeSections = visibleSections.some((section) => section.title === "Arquivo documental e decisório")
    ? visibleSections
    : [visibleSections[0], universalArchive(entity.singular, entity.title(row), entity.id(row), visibleSections), ...visibleSections.slice(1)].filter((section): section is DetailSection => Boolean(section));
  const organizedSections = organizeSectionsIntoTabs(completeSections);
  const related = expandRelations(sections, new Set([`${entity.key}:${entity.id(row)}`]));

  return (
    <DetailTemplate
      title={entity.title(row)}
      subtitle={entity.subtitle?.(row)}
      status={entity.status?.(row)}
      sections={organizedSections}
      related={related}
      tabbed
    />
  );
};

export default EntityDetailPage;
