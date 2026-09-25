import { useState } from "react";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  Calendar,
  Coffee,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Smartphone,
  Sprout,
  Trees,
  Wheat,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/sigaflo/templates/PageHeader";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const user = {
  name: "Administrador INCA",
  initials: "AI",
  role: "Administrador institucional",
  code: "USR-INCA-0001",
  email: "administrador@inca.gov.ao",
  phone: "+244 923 000 110",
  mobile: "+244 991 220 044",
  institution: "Instituto Nacional do Café (INCA)",
  department: "Direcção de Produção e Controlo do Café",
  location: "Luanda · Angola",
  since: "12 de Março de 2024",
  lastAccess: "17 de Setembro de 2026, 17:40",
};

type Access = "full" | "read" | "none";

const systems: {
  key: string;
  name: string;
  subtitle: string;
  icon: LucideIcon;
  access: Access;
  modules: string[];
}[] = [
  {
    key: "inca",
    name: "Café · INCA",
    subtitle: "Instituto Nacional do Café",
    icon: Coffee,
    access: "full",
    modules: ["Visão geral", "Mapa", "Rastreabilidade", "Base produtiva", "Produção", "Armazenagem", "Mercado"],
  },
  {
    key: "idf",
    name: "Madeira · IDF",
    subtitle: "Instituto de Desenvolvimento Florestal",
    icon: Trees,
    access: "read",
    modules: ["Visão geral", "Mapa", "Rastreabilidade", "Operadores", "Concessões", "Licenciamento", "Exploração", "Guias", "Fiscalização"],
  },
  {
    key: "incer",
    name: "Cereais · INCER",
    subtitle: "Instituto Nacional de Cereais",
    icon: Wheat,
    access: "none",
    modules: ["Acesso por atribuir"],
  },
  {
    key: "ida",
    name: "Agricultura · IDA",
    subtitle: "Instituto de Desenvolvimento Agrário",
    icon: Sprout,
    access: "none",
    modules: ["Acesso por atribuir"],
  },
];

const accessLabel: Record<Access, string> = {
  full: "Acesso total",
  read: "Apenas consulta",
  none: "Sem acesso",
};

const field = (icon: LucideIcon, label: string, value: string) => {
  const Icon = icon;
  return (
    <div key={label} className="flex items-start gap-3 rounded-lg border bg-card/60 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold uppercase text-muted-foreground">{label}</span>
        <span className="block truncate text-sm font-medium text-foreground">{value}</span>
      </span>
    </div>
  );
};

const ProfilePage = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });

  const submit = () => {
    if (!form.current || !form.next) return toast.error("Preencha a palavra-passe actual e a nova.");
    if (form.next.length < 8) return toast.error("A nova palavra-passe deve ter pelo menos 8 caracteres.");
    if (form.next !== form.confirm) return toast.error("A confirmação não coincide com a nova palavra-passe.");
    setForm({ current: "", next: "", confirm: "" });
    toast.success("Palavra-passe actualizada (demonstração).");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perfil do utilizador"
        crumbs={["Café · INCA", "Conta"]}
        description="Dados da conta, permissões de acesso aos sistemas do SIGAFLO e definições de segurança."
      />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-primary/80 px-6 py-6 text-primary-foreground">
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16 rounded-xl border-2 border-primary-foreground/25">
                <AvatarFallback className="rounded-xl bg-primary-foreground/15 text-lg font-bold text-primary-foreground">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <h2 className="font-display text-xl font-semibold">{user.name}</h2>
                <p className="text-sm text-primary-foreground/80">{user.role} · {user.code}</p>
              </div>
              <Badge className="ml-auto gap-1 border-0 bg-primary-foreground/15 text-primary-foreground hover:bg-primary-foreground/25">
                <BadgeCheck className="h-3.5 w-3.5" /> Conta verificada
              </Badge>
            </div>
          </div>
          <CardContent className="grid gap-3 p-6 sm:grid-cols-2 xl:grid-cols-3">
            {field(Mail, "Correio electrónico", user.email)}
            {field(Phone, "Telefone", user.phone)}
            {field(Smartphone, "Telemóvel", user.mobile)}
            {field(Building2, "Instituição", user.institution)}
            {field(ShieldCheck, "Departamento", user.department)}
            {field(MapPin, "Localização", user.location)}
            {field(Calendar, "Conta criada em", user.since)}
            {field(Calendar, "Último acesso", user.lastAccess)}
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
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  disabled ? "border-dashed bg-muted/30" : "bg-card hover:border-primary/35",
                )}
              >
                <div className="flex items-start gap-3">
                  <span className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                    disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
                  )}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-foreground">{system.name}</p>
                      <Badge variant={system.access === "full" ? "default" : system.access === "read" ? "secondary" : "outline"}>
                        {accessLabel[system.access]}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{system.subtitle}</p>
                    <Separator className="my-3" />
                    <div className="flex flex-wrap gap-1.5">
                      {system.modules.map((module) => (
                        <span
                          key={module}
                          className={cn(
                            "rounded-md px-2 py-1 text-[11px] font-medium",
                            disabled ? "bg-muted text-muted-foreground" : "bg-primary/8 text-primary",
                          )}
                        >
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
          <CardTitle className="flex items-center gap-2 font-display text-base">
            <KeyRound className="h-4 w-4 text-primary" /> Segurança e palavra-passe
          </CardTitle>
          <p className="text-sm text-muted-foreground">Altere a palavra-passe de acesso à sua conta.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current">Palavra-passe actual</Label>
              <Input id="current" type={show ? "text" : "password"} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next">Nova palavra-passe</Label>
              <Input id="next" type={show ? "text" : "password"} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmar nova palavra-passe</Label>
              <Input id="confirm" type={show ? "text" : "password"} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Mínimo de 8 caracteres, com letras e números.</p>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={submit}>Actualizar palavra-passe</Button>
            <Button variant="outline" onClick={() => setShow((value) => !value)}>
              {show ? <><EyeOff className="mr-2 h-4 w-4" />Ocultar</> : <><Eye className="mr-2 h-4 w-4" />Mostrar</>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
