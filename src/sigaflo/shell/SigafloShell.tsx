import { useEffect, useMemo, useState, type ComponentType } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeftRight, Boxes, ChevronDown, Coffee, GitBranch, LayoutDashboard, LogOut, Map as MapIcon, Menu, PanelLeftClose, PanelLeftOpen, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { findDomain } from "@/sigaflo/domains/registry";
import { cn } from "@/lib/utils";

type NavItem = { to: string; label: string; icon: ComponentType<{ className?: string }>; end?: boolean };

export const SigafloShell = () => {
  const domain = findDomain("cafe");
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = useMemo(() => {
    const result: { group: string; items: NavItem[] }[] = [];
    domain?.entities.forEach((entity) => {
      const item = { to: `/cafe/${entity.key}`, label: entity.label, icon: entity.icon };
      const found = result.find((group) => group.group === entity.group);
      if (found) found.items.push(item);
      else result.push({ group: entity.group, items: [item] });
    });
    return result;
  }, [domain]);
  const fixed: NavItem[] = [
    { to: "/cafe", label: "Visão geral", icon: LayoutDashboard, end: true },
    { to: "/cafe/mapa", label: "Mapa", icon: MapIcon },
    { to: "/cafe/rastreabilidade", label: "Rastreabilidade", icon: GitBranch },
  ];
  const activeGroup = location.pathname === "/cafe" || fixed.slice(1).some((item) => location.pathname.startsWith(item.to))
    ? "Geral"
    : groups.find((group) => group.items.some((item) => location.pathname.startsWith(item.to)))?.group;
  const [open, setOpen] = useState<string | null>(activeGroup ?? "Geral");

  useEffect(() => {
    if (activeGroup) setOpen(activeGroup);
    setMobileOpen(false);
  }, [activeGroup, location.pathname]);

  const current = useMemo(() => {
    const key = location.pathname.split("/")[2];
    if (key === "mapa") return "Mapa";
    if (key === "rastreabilidade") return "Rastreabilidade";
    if (key === "perfil") return "Perfil do utilizador";
    return domain?.entities.find((entity) => entity.key === key)?.label ?? "Visão geral";
  }, [domain, location.pathname]);

  const navLink = (item: NavItem) => (
    <NavLink
      key={item.to}
      to={item.to}
      end={item.end}
      className={({ isActive }) => cn(
        "relative flex min-h-9 items-center gap-3 rounded-md px-3 text-[13px] font-medium text-sidebar-foreground/68 transition-colors hover:bg-sidebar-accent/70 hover:text-sidebar-foreground",
        isActive && "bg-sidebar-accent text-sidebar-foreground before:absolute before:left-0 before:h-4 before:w-0.5 before:rounded-full before:bg-sidebar-primary",
        collapsed && "justify-center px-0",
      )}
    >
      {collapsed ? (
        <Tooltip><TooltipTrigger asChild><item.icon className="h-[18px] w-[18px]" /></TooltipTrigger><TooltipContent side="right">{item.label}</TooltipContent></Tooltip>
      ) : (
        <><item.icon className="h-[18px] w-[18px] shrink-0" /><span className="truncate">{item.label}</span></>
      )}
    </NavLink>
  );

  const dropdown = (label: string, items: NavItem[], icon: ComponentType<{ className?: string }>) => {
    const Icon = icon;
    const expanded = open === label;
    const containsActive = activeGroup === label;
    if (collapsed) return <div key={label} className="space-y-1">{items.map(navLink)}</div>;
    return (
      <div key={label} className="space-y-1">
        <Button
          variant="ghost"
          onClick={() => setOpen((value) => value === label ? null : label)}
          className={cn(
            "h-11 w-full justify-between rounded-lg px-3 text-sm font-semibold text-sidebar-foreground/82 hover:bg-sidebar-accent hover:text-sidebar-foreground",
            containsActive && "bg-sidebar-accent/70 text-sidebar-foreground",
          )}
        >
          <span className="flex items-center gap-3"><Icon className="h-[18px] w-[18px] text-sidebar-primary" /><span>{label}</span></span>
          <ChevronDown className={cn("h-4 w-4 text-sidebar-foreground/45 transition-transform duration-200", expanded && "rotate-180")} />
        </Button>
        <AnimatePresence initial={false}>
          {expanded && <motion.div initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.2}} className="ml-5 overflow-hidden border-l border-sidebar-border pl-2"><div className="space-y-1 py-1">{items.map(navLink)}</div></motion.div>}
        </AnimatePresence>
      </div>
    );
  };

  const sidebar = (
    <aside className={cn("flex h-full shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300", collapsed ? "w-[72px]" : "w-64")}>
      <div className={cn("flex h-20 items-center border-b border-sidebar-border px-4", collapsed && "justify-center px-2")}>
        <BrandLogo showText={!collapsed} variant="inverted" size={collapsed ? "sm" : "md"} className={cn(!collapsed && "w-full")} />
      </div>
      
      <nav className="mt-4 flex-1 space-y-2 overflow-y-auto px-3 pb-5">
        {dropdown("Geral", fixed, LayoutDashboard)}
        {groups.map((group) => dropdown(group.group, group.items, group.items[0]?.icon ?? Boxes))}
      </nav>
      <div className="border-t border-sidebar-border p-2">
        <Button variant="ghost" size={collapsed ? "icon" : "sm"} className={cn("text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground", !collapsed && "w-full justify-start gap-3")} onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? <PanelLeftOpen className="h-4 w-4"/> : <><PanelLeftClose className="h-4 w-4"/><span>Recolher menu</span></>}
        </Button>
      </div>
    </aside>
  );

  return <div className="flex h-screen w-full overflow-hidden bg-background">
    <div className="hidden md:block">{sidebar}</div>
    <AnimatePresence>{mobileOpen && <><motion.div className="fixed inset-0 z-40 bg-foreground/35 md:hidden" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={() => setMobileOpen(false)}/><motion.div className="fixed inset-y-0 left-0 z-50 md:hidden" initial={{x:-280}} animate={{x:0}} exit={{x:-280}}>{sidebar}</motion.div></>}</AnimatePresence>
    <div className="flex min-w-0 flex-1 flex-col">
      <header className="relative flex h-20 shrink-0 items-center justify-between border-b bg-card/90 px-4 shadow-sm backdrop-blur-md md:px-7">
        <span className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-primary" aria-hidden="true" />
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu className="h-5 w-5"/></Button>
          <div className="min-w-0 border-l-2 border-primary/20 pl-3">
            <p className="mb-1 text-[10px] font-bold uppercase text-primary">SIGAFLO</p>
            <h1 className="truncate font-display text-lg font-semibold leading-none text-foreground">{current}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/5 py-1.5 pl-2 pr-3 text-primary md:flex">
             <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground"><Coffee className="h-3.5 w-3.5"/></span>
             <span className="leading-tight"><span className="block text-[9px] font-bold uppercase text-muted-foreground">Sistema actual</span><span className="block text-xs font-bold">Café · INCA</span></span>
          </div>
          <div className="hidden h-8 w-px bg-border sm:block" />
           <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" className="h-12 gap-3 rounded-lg px-1.5 transition-colors hover:bg-primary/5"><span className="hidden text-right sm:block"><span className="block text-sm font-semibold leading-none">Administrador INCA</span><span className="mt-1 block text-[11px] font-medium text-primary">Consulta institucional</span></span><span className="relative"><Avatar className="h-10 w-10 rounded-lg border-2 border-primary/15 ring-2 ring-primary/5"><AvatarFallback className="rounded-md bg-primary text-xs font-bold text-primary-foreground">AI</AvatarFallback></Avatar><span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border bg-card"><ChevronDown className="h-2.5 w-2.5 text-muted-foreground"/></span></span></Button></DropdownMenuTrigger><DropdownMenuContent align="end" className="w-56"><DropdownMenuLabel><span className="block">Administrador INCA</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Consulta institucional</span></DropdownMenuLabel><DropdownMenuSeparator/><DropdownMenuItem onClick={() => navigate("/cafe/perfil")}><UserRound className="mr-2 h-4 w-4"/>O meu perfil</DropdownMenuItem><DropdownMenuItem onClick={() => navigate("/")}><ArrowLeftRight className="mr-2 h-4 w-4"/>Mudar de sistema</DropdownMenuItem><DropdownMenuItem disabled><ShieldCheck className="mr-2 h-4 w-4"/>Sistema apenas para consulta</DropdownMenuItem><DropdownMenuSeparator/><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => { localStorage.removeItem("inca.session"); window.location.reload(); }}><LogOut className="mr-2 h-4 w-4"/>Terminar sessão</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto"><AnimatePresence mode="wait" initial={false}><motion.div key={location.pathname} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-4}} transition={{duration:.2}} className="mx-auto w-full max-w-[1500px] p-4 md:p-7"><Outlet/></motion.div></AnimatePresence></main>
    </div>
  </div>;
};
