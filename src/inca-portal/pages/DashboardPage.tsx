import { Link } from "react-router-dom";
import { Bell, Coffee, GitBranch, MapPinned, PackageCheck, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardTemplate } from "@/sigaflo/templates/DashboardTemplate";
import { incaDomain } from "@/sigaflo/domains/inca";
import { colheitas, embalagens, exploracoes, lotes, notificacoesProdutor, parcelas, produtor, stock } from "@/inca-portal/data";

export default function DashboardPage() {
  const totalHarvest = colheitas.reduce((sum, item) => sum + item.quantity, 0);
  const totalStock = stock.reduce((sum, item) => sum + item.weightKg, 0);
  const charts = incaDomain.dashboard().charts;
  const data = {
    cards: [
      { label: "Área de café", value: `${exploracoes.reduce((sum, item) => sum + item.plotsTotalArea, 0).toLocaleString("pt-AO")} ha`, icon: Sprout, tone: "success" as const, hint: `${exploracoes.length} exploração registada` },
      { label: "Parcelas", value: parcelas.length, icon: MapPinned, tone: "info" as const, hint: "Todas activas" },
      { label: "Produção da campanha", value: `${totalHarvest.toLocaleString("pt-AO")} kg`, icon: Coffee, tone: "accent" as const, hint: `${colheitas.length} colheitas` },
      { label: "Stock disponível", value: `${totalStock.toLocaleString("pt-AO")} kg`, icon: PackageCheck, tone: "primary" as const, hint: `${embalagens.length} embalagens` },
    ],
    charts: [
      charts[0] ?? { title: "Produção", type: "bar" as const, data: [] },
      { title: "Estado dos lotes", type: "pie" as const, data: [...new Set(lotes.map((item) => item.status))].map((name) => ({ name, value: lotes.filter((item) => item.status === name).length })) },
      { title: "Área", type: "bar" as const, data: exploracoes.map((item) => ({ name: item.name, value: item.plotsTotalArea })) },
      { title: "Colheita mensal", type: "line" as const, data: ["Abr", "Mai", "Jun"].map((name, index) => ({ name, value: colheitas.filter((item) => Number(item.date.slice(5, 7)) === index + 4).reduce((sum, item) => sum + item.quantity, 0) })) },
    ],
    activity: [
      ...lotes.flatMap((item) => item.history.map((history) => ({ date: history.date, label: `${item.code}: ${history.description}`, type: history.operation }))),
      ...notificacoesProdutor.map((item) => ({ date: item.data, label: item.texto, type: item.tipo })),
    ].sort((a, b) => b.date.localeCompare(a.date)),
  };

  return <div className="space-y-6"><div className="card-elevated rounded-xl p-5 animate-fade-in"><div className="flex flex-wrap items-center gap-4"><div><h1 className="text-xl font-bold">{produtor.profile.fullName}</h1><p className="text-sm text-muted-foreground">{produtor.registryCode} · Campanha cafeeira 2026</p></div><span className="ml-auto rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">Cadastro activo</span></div><div className="mt-4 flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-muted-foreground">Acompanhe a sua exploração, produção e o percurso do seu café.</p><div className="flex gap-2"><Button asChild variant="outline"><Link to="/painel/notificacoes"><Bell className="mr-2 h-4 w-4" />{notificacoesProdutor.filter((item) => !item.lida).length} avisos</Link></Button><Button asChild><Link to="/painel/rastreabilidade"><GitBranch className="mr-2 h-4 w-4" />Rastrear café</Link></Button></div></div></div><DashboardTemplate data={data} /></div>;
}