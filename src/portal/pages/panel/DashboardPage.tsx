import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, FileText, Landmark, Map, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KpiCards } from "@/sigaflo/templates/KpiCards";
import type { KpiCard } from "@/sigaflo/core/config";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { EstadoBadge } from "@/portal/components/Badges";
import { diasAte, meusDocumentos, minhasLicencas, notasLiquidacao, processosFiscalizacao, kz } from "@/portal/data/mock";

export default function DashboardPage() {
  const { operador } = usePortalAuth();
  if (!operador) return null;

  const docsProblematicos = meusDocumentos.filter((d) => d.validoAte && diasAte(d.validoAte) <= 30);
  const licencasAExpirar = minhasLicencas.filter((l) => diasAte(l.validoAte) >= 0 && diasAte(l.validoAte) <= 30);
  const pagamentosPendentes = notasLiquidacao.filter((n) => n.estado === "Pendente");

  const stats: KpiCard[] = [
    { icon: Map, label: "Áreas registadas", value: 2, tone: "primary", hint: "7.800 ha no total" },
    { icon: Landmark, label: "Concessões activas", value: 1, tone: "accent", hint: "1 em tramitação" },
    { icon: FileText, label: "Licenças activas", value: 3, tone: "success", hint: "Campanha 2026" },
    { icon: Percent, label: "Saldo de quota total", value: "1.598 m³", tone: "info", hint: "4 espécies / linhas" },
  ];

  const alertas = [
    ...docsProblematicos.map((d) => ({
      tipo: "Documento", texto: `${d.nome} ${diasAte(d.validoAte!) < 0 ? "expirou" : `expira em ${diasAte(d.validoAte!)} dias`}.`,
      to: "/painel/dados", accao: "Renovar",
    })),
    ...licencasAExpirar.map((l) => ({
      tipo: "Licença", texto: `${l.codigo} (${l.tipo}) expira em ${diasAte(l.validoAte)} dias.`,
      to: "/painel/licenciamento", accao: "Ver licença",
    })),
    ...pagamentosPendentes.map((n) => ({
      tipo: "Pagamento", texto: `${n.codigo} (${n.tipo}) — ${kz(n.valor)} pendente.`,
      to: "/painel/financeiro", accao: "Pagar",
    })),
    ...processosFiscalizacao.map((f) => ({
      tipo: "Fiscalização", texto: `${f.auto}: aguarda a sua defesa até ${f.prazoDefesa.split("-").reverse().join("/")}.`,
      to: "/painel/fiscalizacao", accao: "Apresentar defesa",
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="card-elevated rounded-xl p-5 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-bold">{operador.denominacao}</h1>
            <p className="text-sm text-muted-foreground">{operador.nrof} · {operador.provincias.join(", ")}</p>
          </div>
          <EstadoBadge estado={operador.estado} className="ml-auto" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {operador.categorias.map((c) => (
            <span key={c} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{c}</span>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <KpiCards items={stats} />

      {/* Alertas */}
      <div className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold">
          <AlertTriangle className="h-4 w-4 text-warning" /> Alertas que precisam da sua atenção
        </h2>
        <ul className="mt-4 space-y-2.5">
          {alertas.map((a, i) => (
            <li key={i} className="flex flex-wrap items-center gap-3 rounded-lg border border-warning/25 bg-warning/5 px-4 py-3 animate-fade-in">
              <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-bold uppercase text-warning">{a.tipo}</span>
              <p className="flex-1 text-sm">{a.texto}</p>
              <Button size="sm" variant="outline" asChild>
                <Link to={a.to}>{a.accao} <ArrowRight className="ml-1 h-3.5 w-3.5" /></Link>
              </Button>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
