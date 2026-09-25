import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/portal/components/Badges";
import { AreaMapa } from "@/portal/components/AreaMapa";
import { minhasAreas } from "@/portal/data/mock";
import { Progress } from "@/components/ui/progress";

export function AreasPage() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-lg font-bold"><Map className="h-5 w-5 text-primary" /> As Minhas Áreas</h1>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {minhasAreas.map((a, i) => (
          <Link key={a.id} to={`/painel/areas/${a.id}`} className={`card-interactive rounded-xl p-5 animate-slide-up stagger-${i + 1}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-primary">{a.codigo}</span>
              <EstadoBadge estado={a.parecer} />
            </div>
            <p className="mt-2 font-semibold">{a.nome}</p>
            <p className="text-sm text-muted-foreground">{a.municipio}, {a.provincia}</p>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{a.areaHa.toLocaleString("pt-AO")} ha registados</span>
                <span>{Math.round((a.ocupadaHa / a.areaHa) * 100)}% ocupada</span>
              </div>
              <Progress value={(a.ocupadaHa / a.areaHa) * 100} className="mt-1.5 h-2" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function AreaDetalhePage() {
  const { id } = useParams();
  const a = minhasAreas.find((x) => x.id === id);

  if (!a) return <p className="text-muted-foreground">Área não encontrada.</p>;
  const livre = a.areaHa - a.ocupadaHa;

  return (
    <div className="space-y-5">
      <Button variant="ghost" size="sm" asChild><Link to="/painel/areas"><ArrowLeft className="mr-1.5 h-4 w-4" /> As Minhas Áreas</Link></Button>
      <div className="card-elevated rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-primary">{a.codigo}</span>
          <EstadoBadge estado={a.parecer} />
        </div>
        <h1 className="mt-1.5 text-xl font-bold">{a.nome}</h1>
        <p className="text-sm text-muted-foreground">{a.municipio}, {a.provincia} · {a.areaHa.toLocaleString("pt-AO")} ha</p>
      </div>

      <AreaMapa area={a} />

      <div className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Concessões associadas</h2>
        {a.associacoes.filter((as) => as.tipo === "Concessão").length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Nenhuma concessão atribuída sobre esta área-mãe.</p>
        ) : (
          <ul className="mt-3 space-y-2.5">
            {a.associacoes.filter((as) => as.tipo === "Concessão").map((as) => (
              <li key={as.codigo} className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5 text-sm">
                <span><strong>{as.tipo}</strong> · {as.codigo} · {as.areaHa.toLocaleString("pt-AO")} ha</span>
                <EstadoBadge estado={as.estado} />
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 rounded-lg bg-success/10 px-4 py-3">
          <p className="text-sm font-semibold text-success">
            Área ainda livre: {livre.toLocaleString("pt-AO")} ha ({Math.round((livre / a.areaHa) * 100)}% da área-mãe)
          </p>
          <Progress value={(livre / a.areaHa) * 100} className="mt-2 h-2" />
        </div>
      </div>
    </div>
  );
}
