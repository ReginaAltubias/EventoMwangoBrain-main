import { Link, NavLink, Outlet } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import idfLogo from "@/assets/idf-logo.png";
import { cn } from "@/lib/utils";

const links = [
  { to: "/concursos", label: "Concursos Públicos" },
  { to: "/consultar-operador", label: "Consultar Operador" },
  { to: "/verificar-documento", label: "Verificar Documento" },
  { to: "/legislacao", label: "Legislação" },
  { to: "/ajuda", label: "Ajuda" },
];

export function PublicLayout() {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background font-portal">
      <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={idfLogo} alt="Logótipo do IDF" className="h-9 w-9 rounded-full object-contain" />
            <div className="leading-tight">
              <p className="text-sm font-bold text-primary">SIGAFLO · IDF</p>
              <p className="text-[11px] text-muted-foreground">Portal Público do Produtor</p>
            </div>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/entrar">
                <LogIn className="mr-1.5 h-4 w-4" /> Entrar
              </Link>
            </Button>
            <Button size="sm" asChild className="hidden sm:inline-flex">
              <Link to="/registar">
                <UserPlus className="mr-1.5 h-4 w-4" /> Registar-me
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuAberto((v) => !v)} aria-label="Menu">
              {menuAberto ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuAberto && (
          <nav className="border-t border-border bg-card px-4 py-3 lg:hidden animate-fade-in">
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuAberto(false)}
                  className={({ isActive }) =>
                    cn("rounded-md px-3 py-2 text-sm font-medium", isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted")
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="mt-2 flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to="/entrar">Entrar</Link>
                </Button>
                <Button size="sm" asChild className="flex-1">
                  <Link to="/registar">Registar-me</Link>
                </Button>
              </div>
            </div>
          </nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2.5">
              <img src={idfLogo} alt="IDF" className="h-8 w-8 rounded-full object-contain" />
              <p className="font-bold text-primary">SIGAFLO · IDF</p>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Instituto de Desenvolvimento Florestal — portal público do produtor e operador florestal.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold">Ligações úteis</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {links.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">Contacto</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Direcção Nacional — Viana, Luanda
              <br />
              geral@idf.gov.ao · +244 222 750 210
            </p>
          </div>
        </div>
        <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
          © 2026 Instituto de Desenvolvimento Florestal · Demonstração com dados fictícios
        </div>
      </footer>
    </div>
  );
}
