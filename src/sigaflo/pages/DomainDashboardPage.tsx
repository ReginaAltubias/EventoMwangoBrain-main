import { PageHeader } from "@/sigaflo/templates/PageHeader";
import { DashboardTemplate } from "@/sigaflo/templates/DashboardTemplate";
import { findDomain } from "@/sigaflo/domains/registry";

const DomainDashboardPage = () => {
  const domain = findDomain("cafe");
  if (!domain) return null;

  if (!domain.available) {
    return (
      <div className="space-y-6">
        <PageHeader title={domain.label} description={domain.description} crumbs={["SIGAFLO"]} />
        <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
          Domínio reservado. Ainda sem dados de demonstração nesta fase.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Visão geral da cadeia do café"
        description="Indicadores consolidados de produtores, explorações, colheitas, processamento, armazenagem e mercado em Angola."
        crumbs={["Café · INCA", "Visão geral"]}
      />
      <DashboardTemplate data={domain.dashboard()} />
    </div>
  );
};

export default DomainDashboardPage;
