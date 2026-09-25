import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck, Building2, Calendar, Eye, EyeOff, FileText, KeyRound, Landmark, Mail,
  MapPin, Pencil, Save, ShieldCheck, Sprout, Trees, Wheat, X, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { cn } from "@/lib/utils";

type Access = "operator" | "read" | "none";

const accessLabel: Record<Access, string> = {
  operator: "Consulta e actualização",
  read: "Apenas consulta",
  none: "Sem acesso",
};

const systems: { key: string; name: string; subtitle: string; icon: LucideIcon; access: Access; modules: string[] }[] = [
  {
    key: "idf",
    name: "Madeira · IDF",
    subtitle: "Instituto de Desenvolvimento Florestal",
    icon: Trees,
    access: "operator",
    modules: ["Visão geral", "Áreas", "Concessões", "Licenciamento", "Quotas", "Guias", "Certificados", "Financeiro", "Fiscalização"],
  },
  {
    key: "inca",
    name: "Café · INCA",
    subtitle: "Instituto Nacional do Café",
    icon: Sprout,
    access: "read",
    modules: ["Visão geral", "Mapa", "Rastreabilidade"],
  },
  { key: "incer", name: "Cereais · INCER", subtitle: "Instituto Nacional de Cereais", icon: Wheat, access: "none", modules: ["Acesso por atribuir"] },
  { key: "ida", name: "Agricultura · IDA", subtitle: "Instituto de Desenvolvimento Agrário", icon: Landmark, access: "none", modules: ["Acesso por atribuir"] },
];

const field = (icon: LucideIcon, label: string, value: string) => {
  const Icon = icon;
  return (
    <div key={label} className="flex items-start gap-3 rounded-lg border bg-card/60 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-medium text-foreground">{value || "—"}</span>
      </span>
    </div>
  );
};

export default function PerfilPage() {
  const { operador, actualizarPerfil } = usePortalAuth();
  const [editar, setEditar] = useState(false);
  const [show, setShow] = useState(false);
  const [pass, setPass] = useState({ current: "", next: "", confirm: "" });
  const [form, setForm] = useState({
    denominacao: operador?.denominacao ?? "",
    email: operador?.email ?? "",
    sede: operador?.sede ?? "",
    municipio: operador?.municipio ?? "",
    objectoSocial: operador?.objectoSocial ?? "",
  });

  useEffect(() => {
    if (!operador) return;
    setForm({
      denominacao: operador.denominacao,
      email: operador.email,
      sede: operador.sede,
      municipio: operador.municipio,
      objectoSocial: operador.objectoSocial,
    });
  }, [operador]);

  if (!operador) return <p className="text-sm text-muted-foreground">Sessão não disponível.</p>;

  const initials = operador.denominacao.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const guardar = () => {
    if (!form.denominacao.trim()) return toast.error("A denominação é obrigatória.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return toast.error("Indique um e-mail válido.");
    actualizarPerfil(form);
    setEditar(false);
    toast.success("Perfil actualizado (demonstração).");
  };

  const submitPass = () => {
    if (!pass.current || !pass.next) return toast.error("Preencha a palavra-passe actual e a nova.");
    if (pass.current !== operador.password) return toast.error("A palavra-passe actual não está correcta.");
    if (pass.next.length < 8) return toast.error("A nova palavra-passe deve ter pelo menos 8 caracteres.");
    if (pass.next !== pass.confirm) return toast.error("A confirmação não coincide com a nova palavra-passe.");
    actualizarPerfil({ password: pass.next });
    setPass({ current: "", next: "", confirm: "" });
    toast.success("Palavra-passe actualizada (demonstração).");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wide text-primary">Madeira · IDF · Conta</p>
        <h1 className="font-display text-xl font-bold text-foreground">Perfil do operador</h1>
        <p className="text-sm text-muted-foreground">Dados da conta, permissões de acesso aos sistemas do SIGAFLO e definições de segurança.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-6 text-primary-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl border-2 border-primary-foreground/25">
                <AvatarFallback className="rounded-xl bg-primary-foreground/15 text-lg font-bold text-primary-foreground">{initials}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">{operador.denominacao}</h2>
                <p className="text-sm text-primary-foreground/80">{operador.tipoSujeito} · {operador.nrof ?? "Registo em análise"}</p>
              </div>
              <Badge className="ml-auto gap-1 border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
                <BadgeCheck className="h-3.5 w-3.5" /> {operador.estado === "Activo" ? "Conta activa" : operador.estado}
              </Badge>
            </div>
          </div>
          <CardContent className="space-y-4 p-6">
            <div className="flex items-center justify-between">
              <p className="font-display text-sm font-semibold">Dados da conta</p>
              {editar ? (
                <div className="flex gap-2">
                  <Button size="sm" onClick={guardar}><Save className="mr-2 h-4 w-4" />Guardar</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditar(false)}><X className="mr-2 h-4 w-4" />Cancelar</Button>
                </div>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditar(true)}><Pencil className="mr-2 h-4 w-4" />Editar perfil</Button>
              )}
            </div>

            {editar ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="denominacao">Denominação</Label>
                  <Input id="denominacao" value={form.denominacao} onChange={(e) => setForm({ ...form, denominacao: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correio electrónico</Label>
                  <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sede">Sede</Label>
                  <Input id="sede" value={form.sede} onChange={(e) => setForm({ ...form, sede: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="municipio">Município</Label>
                  <Input id="municipio" value={form.municipio} onChange={(e) => setForm({ ...form, municipio: e.target.value })} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="objecto">Objecto social</Label>
                  <Textarea id="objecto" rows={3} value={form.objectoSocial} onChange={(e) => setForm({ ...form, objectoSocial: e.target.value })} />
                </div>
                <p className="text-xs text-muted-foreground md:col-span-2">O NIF, o NROF e o estado do registo são atribuídos pelo IDF e não podem ser alterados aqui.</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {field(Mail, "Correio electrónico", operador.email)}
                {field(FileText, "NIF", operador.nif)}
                {field(ShieldCheck, "Número de registo florestal", operador.nrof ?? "Em análise")}
                {field(Building2, "Sede", operador.sede)}
                {field(MapPin, "Município", operador.municipio)}
                {field(MapPin, "Províncias de actuação", operador.provincias.join(", "))}
                {field(Calendar, "Data de constituição", operador.dataConstituicao)}
                {field(Trees, "Categorias", operador.categorias.join(", "))}
                {field(FileText, "Objecto social", operador.objectoSocial)}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-base">Permissões por sistema</CardTitle>
          <p className="text-sm text-muted-foreground">Sistemas do SIGAFLO a que esta conta pode aceder.</p>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {systems.map((system, index) => {
            const Icon = system.icon;
            const disabled = system.access === "none";
            return (
              <motion.div
                key={system.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22, delay: index * 0.05 }}
                className={cn("rounded-xl border p-4 transition-colors", disabled ? "border-dashed bg-muted/30" : "bg-card hover:border-primary/35")}
              >
                <div className="flex items-start gap-3">
                  <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{system.name}</p>
                      <Badge variant={system.access === "operator" ? "default" : system.access === "read" ? "secondary" : "outline"}>{accessLabel[system.access]}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{system.subtitle}</p>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-1.5">
                      {system.modules.map((module) => (
                        <span key={module} className={cn("rounded-md px-2 py-1 text-[11px] font-medium", disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                          {module}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 font-display text-base"><KeyRound className="h-4 w-4 text-primary" /> Segurança e palavra-passe</CardTitle>
          <p className="text-sm text-muted-foreground">Altere a palavra-passe de acesso à sua conta.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current">Palavra-passe actual</Label>
              <Input id="current" type={show ? "text" : "password"} value={pass.current} onChange={(e) => setPass({ ...pass, current: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">Nova palavra-passe</Label>
              <Input id="next" type={show ? "text" : "password"} value={pass.next} onChange={(e) => setPass({ ...pass, next: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar nova palavra-passe</Label>
              <Input id="confirm" type={show ? "text" : "password"} value={pass.confirm} onChange={(e) => setPass({ ...pass, confirm: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres, com letras e números.</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={submitPass}>Actualizar palavra-passe</Button>
            <Button variant="outline" onClick={() => setShow((value) => !value)}>
              {show ? <><EyeOff className="mr-2 h-4 w-4" />Ocultar</> : <><Eye className="mr-2 h-4 w-4" />Mostrar</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
