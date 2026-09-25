import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Bell, Building2, FileBarChart, FileCheck2, FileText, Gavel, HelpCircle, Home, Landmark,
  LogOut, Map, Package, Percent, Search, ShieldAlert, Truck, User, Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { notificacoes } from "@/portal/data/mock";
import { EstadoBadge } from "@/portal/components/Badges";
import idfLogo from "@/assets/idf-logo.png";
import { cn } from "@/lib/utils";

const itens = [
  { to: "/painel", icon: Home, label: "Dashboard", fim: true },
  { to: "/painel/dados", icon: Building2, label: "Os Meus Dados" },
  { to: "/painel/areas", icon: Map, label: "As Minhas Áreas" },
  { to: "/painel/concessoes", icon: Landmark, label: "As Minhas Concessões" },
  { to: "/painel/concursos", icon: Gavel, label: "Concursos Públicos" },
  { to: "/painel/licenciamento", icon: FileText, label: "O Meu Licenciamento" },
  { to: "/painel/quotas", icon: Percent, label: "Consumo de Quota" },
  { to: "/painel/guias", icon: Truck, label: "Guias de Trânsito" },
  { to: "/painel/certificados", icon: FileCheck2, label: "Certificados" },
  { to: "/painel/financeiro", icon: Wallet, label: "Financeiro" },
  { to: "/painel/reportes", icon: FileBarChart, label: "Reportes e Obrigações" },
  { to: "/painel/fiscalizacao", icon: ShieldAlert, label: "Fiscalização" },
  { to: "/painel/notificacoes", icon: Bell, label: "Notificações" },
  { to: "/painel/ajuda", icon: HelpCircle, label: "Ajuda / Suporte" },
];

const titulos: Record<string, string> = Object.fromEntries(itens.map((i) => [i.to, i.label]));

export function PanelLayout() {
  const { operador, sair } = usePortalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [recolhida, setRecolhida] = useState(false);

  useEffect(() => {
    if (!operador) navigate("/entrar", { replace: true });
    else if (operador.estado !== "Activo") navigate("/estado-registo", { replace: true });
  }, [operador, navigate]);

  if (!operador || operador.estado !== "Activo") return null;

  const naoLidas = notificacoes.filter((n) => !n.lida).length;
  const base = location.pathname.split("/").slice(0, 3).join("/");
  const titulo = titulos[base] ?? (location.pathname.includes("candidatar") ? "Candidatura a Concurso" : "Painel");

  return (
    <div className="flex min-h-screen bg-muted/40 font-portal">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col text-sidebar-foreground transition-all duration-300",
          recolhida ? "w-16" : "w-60",
        )}
        style={{ background: "#1f523a" }}
      >
        <div className="flex items-center gap-2.5 px-4 py-4">
          <img src={idfLogo} alt="IDF" className="h-8 w-8 shrink-0 rounded-full bg-white/90 object-contain p-0.5" />
          {!recolhida && (
            <div className="leading-tight">
              <p className="text-sm font-bold">O Meu Portal</p>
              <p className="text-[10px] opacity-70">{operador.nrof}</p>
            </div>
          )}
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-2">
          {itens.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.fim}
              title={it.label}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
                  isActive ? "bg-white/10 text-amber-300" : "opacity-90 hover:bg-white/5 hover:opacity-100",
                  recolhida && "justify-center px-0",
                )
              }
            >
              <it.icon className="h-4 w-4 shrink-0" />
              {!recolhida && it.label}
            </NavLink>
          ))}
        </nav>
        {!recolhida && (
          <div className="border-t border-white/10 px-4 py-3 text-[10px] opacity-60">
            SIGAFLO · IDF — Portal do Produtor
          </div>
        )}
      </aside>

      {/* Conteúdo */}
      <div className={cn("flex min-h-screen flex-1 flex-col pt-16 transition-all duration-300", recolhida ? "ml-[5.5rem]" : "ml-64")}>
        <header className={cn("fixed top-0 right-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/90 px-5 backdrop-blur transition-all duration-300", recolhida ? "left-[5.5rem]" : "left-60")}>
          <Button variant="ghost" size="icon" onClick={() => setRecolhida((v) => !v)} aria-label="Recolher menu">
            <Package className="h-4 w-4 rotate-90" />
          </Button>
          <div className="text-sm">
            <span className="text-muted-foreground">O Meu Portal / </span>
            <span className="font-semibold">{titulo}</span>
          </div>
          <div className="relative ml-auto hidden w-64 md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Pesquisar no portal…" className="h-9 pl-9" />
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
                <Bell className="h-4.5 w-4.5" />
                {naoLidas > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                    {naoLidas}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="border-b border-border px-4 py-2.5 text-sm font-semibold">Notificações</div>
              <ul className="max-h-72 overflow-y-auto">
                {notificacoes.slice(0, 5).map((n) => (
                  <li key={n.id} className={cn("border-b border-border px-4 py-3 text-sm last:border-0", !n.lida && "bg-primary/5")}>
                    <p className="text-xs font-semibold text-primary">{n.tipo}</p>
                    <p className="mt-0.5">{n.texto}</p>
                  </li>
                ))}
              </ul>
              <Link to="/painel/notificacoes" className="block border-t border-border px-4 py-2 text-center text-xs font-semibold text-primary hover:underline">
                Ver todas
              </Link>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-2.5 rounded-full border border-border py-1 pl-1 pr-3 transition-colors hover:bg-muted">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {operador.denominacao.slice(0, 1)}
                </span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block max-w-40 truncate text-xs font-semibold">{operador.denominacao}</span>
                  <span className="block text-[10px] text-muted-foreground">{operador.nrof}</span>
                </span>
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72">
              <div className="mb-3 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  <User className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{operador.denominacao}</p>
                  <p className="truncate text-xs text-muted-foreground">{operador.email}</p>
                </div>
              </div>
              <div className="mb-3"><EstadoBadge estado={operador.estado} /></div>
              <div className="space-y-1">
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link to="/painel/dados"><Building2 className="mr-2 h-4 w-4" /> Os meus dados</Link>
                </Button>
                <Button
                  variant="ghost" size="sm"
                  className="w-full justify-start text-destructive hover:text-destructive"
                  onClick={() => { sair(); navigate("/"); }}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Terminar sessão
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
