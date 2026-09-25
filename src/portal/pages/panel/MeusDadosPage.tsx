import { useState } from "react";
import { Building2, FileText, History, Pencil, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { EstadoBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { diasAte, estadoDocumento, fmtData, historicoRegisto, meusDocumentos } from "@/portal/data/mock";
import { toast } from "sonner";

export default function MeusDadosPage() {
  const { operador } = usePortalAuth();
  const [renovarDoc, setRenovarDoc] = useState<string | null>(null);
  const [contactos, setContactos] = useState([
    { nome: "Domingos Kimbo", email: "geral@kimbo-madeiras.ao", telefone: "+244 923 410 220" },
    { nome: "Contabilidade", email: "contas@kimbo-madeiras.ao", telefone: "+244 923 410 221" },
  ]);
  if (!operador) return null;

  return (
    <div className="space-y-6">
      {/* Dados da empresa */}
      <section className="card-elevated rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold"><Building2 className="h-4 w-4 text-primary" /> Dados da empresa</h2>
          <Button variant="outline" size="sm" onClick={() => toast.success("Dados guardados (demonstração).")}>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Guardar alterações
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label>Denominação social</Label>
            <Input value={operador.denominacao} readOnly disabled title="Bloqueado após aprovação" />
          </div>
          <div className="space-y-1.5">
            <Label>NIF</Label>
            <Input value={operador.nif} readOnly disabled title="Bloqueado após aprovação" />
          </div>
          <div className="space-y-1.5">
            <Label>Tipo de sujeito</Label>
            <Input defaultValue={operador.tipoSujeito} />
          </div>
          <div className="space-y-1.5">
            <Label>Data de constituição</Label>
            <Input type="date" defaultValue={operador.dataConstituicao} />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Sede</Label>
            <Input defaultValue={operador.sede} />
          </div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Denominação e NIF ficam bloqueados após a aprovação do registo.</p>
      </section>

      {/* Documentos */}
      <section className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4 text-primary" /> Documentos anexados</h2>
        <ul className="mt-4 divide-y divide-border">
          {meusDocumentos.map((d) => {
            const est = estadoDocumento(d.validoAte);
            return (
              <li key={d.id} className="flex flex-wrap items-center gap-3 py-3">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="flex-1 text-sm font-medium">{d.nome}</span>
                <span className="text-xs text-muted-foreground">
                  {d.validoAte ? `Válido até ${fmtData(d.validoAte)}` : "Sem validade"}
                </span>
                <EstadoBadge estado={est} />
                {est !== "Válido" && (
                  <Button size="sm" variant="outline" onClick={() => setRenovarDoc(renovarDoc === d.id ? null : d.id)}>
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Renovar
                  </Button>
                )}
                {renovarDoc === d.id && (
                  <div className="w-full animate-fade-in">
                    <FileUpload label={`Novo ficheiro — ${d.nome}`} onChange={() => {
                      toast.success("Documento submetido para validação pelo IDF (demonstração).");
                      setRenovarDoc(null);
                    }} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      {/* Contactos */}
      <section className="card-elevated rounded-xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold"><Phone className="h-4 w-4 text-primary" /> Contactos</h2>
          <Button variant="outline" size="sm" onClick={() => toast.success("Contactos actualizados (demonstração).") }>
            <Pencil className="mr-1.5 h-3.5 w-3.5" /> Guardar alterações
          </Button>
        </div>
        <div className="space-y-3">
          {contactos.map((c, i) => (
            <div key={i} className="grid gap-3 rounded-lg border border-border p-3 sm:grid-cols-3">
              <Input placeholder="Nome" value={c.nome} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, nome: e.target.value } : x)))} />
              <Input placeholder="E-mail" value={c.email} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, email: e.target.value } : x)))} />
              <Input placeholder="Telefone" value={c.telefone} onChange={(e) => setContactos((cs) => cs.map((x, j) => (j === i ? { ...x, telefone: e.target.value } : x)))} />
            </div>
          ))}
        </div>
      </section>

      {/* Histórico de estado */}
      <section className="card-elevated rounded-xl p-5">
        <h2 className="flex items-center gap-2 font-semibold"><History className="h-4 w-4 text-primary" /> Histórico de estado do registo</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-border pl-5">
          {historicoRegisto.map((h, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-success bg-card" />
              <p className="text-sm font-semibold">{h.evento} <span className="ml-2 text-xs font-normal text-muted-foreground">{fmtData(h.data)}</span></p>
              <p className="text-sm text-muted-foreground">{h.detalhe}</p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
