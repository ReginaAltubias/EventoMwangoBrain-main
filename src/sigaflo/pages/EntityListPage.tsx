import { Link, useParams } from "react-router-dom";
import { PageHeader } from "@/sigaflo/templates/PageHeader";
import { ListingTemplate } from "@/sigaflo/templates/ListingTemplate";
import { findDomain, findEntity } from "@/sigaflo/domains/registry";

const EntityListPage = () => {
  const { entity: entityKey } = useParams();
  const domain = findDomain("cafe");
  const entity = findEntity("cafe", entityKey);
  if (!domain) return null;
  if (!entity) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Módulo não encontrado"
          description="Este módulo não existe no domínio Café. Utilize o menu lateral para escolher um módulo disponível."
          crumbs={["Café · INCA"]}
        />
        <div className="rounded-xl border bg-card p-6">
          <p className="mb-3 text-sm font-medium">Módulos disponíveis</p>
          <div className="flex flex-wrap gap-2">
            {domain.entities.map((e) => (
              <Link
                key={e.key}
                to={`/${domain.key}/${e.key}`}
                className="rounded-full border px-3 py-1.5 text-xs font-medium hover:bg-muted"
              >
                {e.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={entity.label}
        description={`Consulta consolidada de ${entity.label.toLowerCase()} registados no sistema.`}
        crumbs={["Café · INCA", entity.label]}
      />
      <ListingTemplate entity={entity} basePath={`/${domain.key}`} />
    </div>
  );
};

export default EntityListPage;
