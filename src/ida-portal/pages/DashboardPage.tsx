import { Link } from "react-router-dom";
import { Banknote, Bell, Coins, Leaf, Sprout, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardTemplate } from "@/sigaflo/templates/DashboardTemplate";
import { colheitas, dividas, kz, notificacoesIda, produtores, terras, totalArea, totalDividaPendente, totalFinanciamento, totalProducao, INSTITUICOES_INFO, resumoInstituicao } from "@/ida-portal/data";

export default function DashboardPage() {
  const data = {
    cards: [
      { label: "Produtores registados", value: produtores.length, icon: Users, tone: "primary" as const, hint: "INCA, IDF, INCER e IDA" },
      { label: "Área cadastrada", value: `${totalArea.toLocaleString("pt-AO")} ha`, icon: Sprout, tone: "success" as const, hint: `${terras.length} terras` },
      { label: "Produção declarada", value: `${totalProducao.toLocaleString("pt-AO")} kg`, icon: Leaf, tone: "accent" as const, hint: `${colheitas.length} colheitas` },
      { label: "Dívida em aberto", value: kz(totalDividaPendente), icon: Coins, tone: "warning" as const, hint: `${dividas.filter((item) => item.estado !== "Liquidada").length} dívidas activas` },
    ],
    charts: [
      { title: "Produtores por instituição", type: "pie" as const, data: INSTITUICOES_INFO.map((item) => ({ name: item.key, value: resumoInstituicao(item.key).produtores })) },
      { title: "Área por instituição (ha)", type: "bar" as const, data: INSTITUICOES_INFO.map((item) => ({ name: item.key, value: resumoInstituicao(item.key).area })) },
      { title: "Dívidas por estado", type: "pie" as const, data: [...new Set(dividas.map((item) => item.estado))].map((name) => ({ name, value: dividas.filter((item) => item.estado === name).length })) },
      { title: "Produção por província (kg)", type: "bar" as const, data: [...new Set(produtores.map((item) => item.provincia))].map((name) => ({ name, value: colheitas.filter((col) => produtores.find((p) => p.id === col.produtorId)?.provincia === name).reduce((sum, col) => sum + col.quantidadeKg, 0) })) },
    ],
    activity: [
      ...notificacoesIda.map((item) => ({ date: item.data, label: item.texto, type: item.tipo })),
      ...colheitas.slice(0, 8).map((item) => ({ date: item.data, label: `${item.codigo}: ${item.cultura} · ${item.quantidadeKg.toLocaleString("pt-AO")} kg`, type: "Colheita" })),
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  return (
    <div className="space-y-6">
      <div className="card-elevated rounded-xl p-5 animate-fade-in">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Instituto de Desenvolvimento Agrário</h1>
            <p className="text-sm text-muted-foreground">Gestão consolidada dos produtores do INCA, IDF, INCER e IDA · campanha 2026</p>
          </div>
          <span className="ml-auto rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">{produtores.filter((item) => item.estado === "Activo").length} cadastros activos</span>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">Financiamento acompanhado: <strong className="text-foreground">{kz(totalFinanciamento)}</strong></p>
          <div className="flex gap-2">
            <Button asChild variant="outline"><Link to="/painel/notificacoes"><Bell className="mr-2 h-4 w-4" />{notificacoesIda.filter((item) => !item.lida).length} avisos</Link></Button>
            <Button asChild><Link to="/painel/produtores"><Users className="mr-2 h-4 w-4" />Ver produtores</Link></Button>
          </div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {INSTITUICOES_INFO.map((item) => {
          const resumo = resumoInstituicao(item.key);
          return (
            <Link key={item.key} to={`/painel/produtores`} className="card-elevated rounded-xl p-4 transition-transform hover:-translate-y-0.5">
              <p className="text-xs font-bold uppercase text-primary">{item.key}</p>
              <p className="mt-1 text-sm font-semibold">{resumo.produtores} produtores</p>
              <p className="mt-2 text-xs text-muted-foreground">{resumo.area.toLocaleString("pt-AO")} ha · {resumo.producao.toLocaleString("pt-AO")} kg</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Banknote className="h-3.5 w-3.5 text-primary" />{kz(resumo.financiamento)}</p>
            </Link>
          );
        })}
      </div>
      <DashboardTemplate data={data} />
    </div>
  );
}
