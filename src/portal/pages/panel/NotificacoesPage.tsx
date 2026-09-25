import { useState } from "react";
import { Bell, Mail, MonitorSmartphone, Smartphone } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { notificacoes, fmtData } from "@/portal/data/mock";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const tiposAlerta = ["Documento", "Pagamento", "Licença", "Concurso", "Fiscalização"];
const canais = [
  { id: "portal", icon: MonitorSmartphone, label: "Portal" },
  { id: "email", icon: Mail, label: "E-mail" },
  { id: "sms", icon: Smartphone, label: "SMS" },
];

export default function NotificacoesPage() {
  const [prefs, setPrefs] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(tiposAlerta.map((t) => [t, ["portal", "email"]])),
  );

  const toggle = (tipo: string, canal: string) =>
    setPrefs((p) => ({
      ...p,
      [tipo]: p[tipo].includes(canal) ? p[tipo].filter((c) => c !== canal) : [...p[tipo], canal],
    }));

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-5 w-5 text-primary" /> Notificações</h1>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Central de alertas</h2>
        <ul className="mt-4 space-y-2.5">
          {notificacoes.map((n) => (
            <li key={n.id} className={cn("flex items-start gap-3 rounded-lg border border-border px-4 py-3 text-sm", !n.lida && "border-primary/25 bg-primary/5")}>
              <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.lida ? "bg-muted" : "bg-primary")} />
              <div className="flex-1">
                <p className="text-xs font-semibold text-primary">{n.tipo}</p>
                <p>{n.texto}</p>
              </div>
              <span className="text-xs text-muted-foreground">{fmtData(n.data)}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Preferências de canal por tipo de alerta</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-2 py-2">Tipo de alerta</th>
                {canais.map((c) => (
                  <th key={c.id} className="px-2 py-2 text-center">
                    <span className="inline-flex items-center gap-1"><c.icon className="h-3.5 w-3.5" /> {c.label}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tiposAlerta.map((t) => (
                <tr key={t} className="border-b border-border last:border-0">
                  <td className="px-2 py-2.5 font-medium">{t}</td>
                  {canais.map((c) => (
                    <td key={c.id} className="px-2 py-2.5 text-center">
                      <Checkbox checked={prefs[t].includes(c.id)} onCheckedChange={() => toggle(t, c.id)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Alterações guardadas automaticamente (demonstração).</p>
        <button className="hidden" onClick={() => toast.success("Guardado")} />
      </section>
    </div>
  );
}
