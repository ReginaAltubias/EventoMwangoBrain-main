import { useMemo, useState } from "react";
import { Download, FileText, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EstadoBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { diasAte, fmtData, minhasLicencas, type MinhaLicenca } from "@/portal/data/mock";
import { gerarDocumentoPdf } from "@/portal/lib/pdfDocumento";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tipos: MinhaLicenca["tipo"][] = ["Exploração Florestal", "Lenha, Carvão e PFNL", "Fauna", "Apicultura"];

type LicencaLocal = MinhaLicenca & { estado?: "Emitida" | "Em apreciação"; objecto?: string; local?: string };

function DiasAteExpirar({ validoAte }: { validoAte: string }) {
  const d = diasAte(validoAte);
  if (d < 0) return <span className="text-sm font-bold text-destructive">Expirada</span>;
  return (
    <span className={cn("text-sm font-bold tabular-nums", d <= 30 ? "text-destructive" : d <= 90 ? "text-warning" : "text-success")}>
      {d} dias para expirar
    </span>
  );
}

export default function LicenciamentoPage() {
  const { operador } = usePortalAuth();
  const [renovar, setRenovar] = useState<string | null>(null);
  const [lista, setLista] = useState<LicencaLocal[]>(() => minhasLicencas.map((l) => ({ ...l, estado: "Emitida" })));
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ tipo: tipos[0] as MinhaLicenca["tipo"], campanha: "2026", local: "", objecto: "" });

  const ano = useMemo(() => new Date().getFullYear(), []);

  const submeterPedido = () => {
    if (!form.local.trim() || !form.objecto.trim()) {
      toast.error("Indique o local e o objecto do pedido.");
      return;
    }
    const codigo = `PL-${ano}/${String(Math.floor(Math.random() * 9000) + 1000)}`;
    setLista((a) => [
      {
        id: codigo,
        tipo: form.tipo,
        codigo,
        campanha: form.campanha,
        validoAte: `${form.campanha}-12-31`,
        renovavel: false,
        estado: "Em apreciação",
        local: form.local,
        objecto: form.objecto,
      },
      ...a,
    ]);
    setAberto(false);
    setForm({ tipo: tipos[0], campanha: "2026", local: "", objecto: "" });
    toast.success(`Pedido ${codigo} submetido. Pode descarregar o comprovativo em PDF.`);
  };

  const descarregar = (l: LicencaLocal) => {
    const pedido = l.estado === "Em apreciação";
    gerarDocumentoPdf({
      titulo: pedido ? "Comprovativo de pedido de licença" : "Licença florestal",
      subtitulo: l.tipo,
      codigo: l.codigo,
      ficheiro: `${l.codigo.replace(/\//g, "-")}.pdf`,
      campos: [
        { rotulo: "Operador", valor: operador?.denominacao ?? "—" },
        { rotulo: "N.º de registo (NROF)", valor: operador?.nrof ?? "—" },
        { rotulo: "Tipo de licença", valor: l.tipo },
        { rotulo: "Campanha", valor: l.campanha },
        { rotulo: "Local", valor: l.local ?? "Área registada do operador" },
        { rotulo: "Objecto", valor: l.objecto ?? "Exploração ao abrigo do título vigente" },
        { rotulo: "Validade", valor: fmtData(l.validoAte) },
        { rotulo: "Estado", valor: pedido ? "Em apreciação pelo IDF" : "Emitida" },
      ],
      notas: pedido
        ? ["O pedido segue para apreciação técnica do IDF.", "A licença só produz efeitos após emissão e pagamento das taxas devidas."]
        : ["A licença deve acompanhar toda a actividade no terreno.", "A renovação deve ser pedida até 30 dias antes do fim da validade."],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-bold"><FileText className="h-5 w-5 text-primary" /> O Meu Licenciamento</h1>
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Solicitar nova licença</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Pedido de nova licença</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Tipo de licença</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as MinhaLicenca["tipo"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Campanha</Label>
                  <Select value={form.campanha} onValueChange={(v) => setForm({ ...form, campanha: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{["2026", "2027"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Local (província · município · área)</Label>
                <Input value={form.local} onChange={(e) => setForm({ ...form, local: e.target.value })} placeholder="Cabinda · Buco-Zau · AR-CAB-0007" />
              </div>
              <div className="space-y-1.5">
                <Label>Objecto do pedido</Label>
                <Textarea rows={3} value={form.objecto} onChange={(e) => setForm({ ...form, objecto: e.target.value })} placeholder="Descreva as espécies, volumes e finalidade" />
              </div>
              <FileUpload label="Certidão de conformidade tributária" obrigatorio />
              <FileUpload label="Plano de exploração da campanha" obrigatorio />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button onClick={submeterPedido}>Submeter pedido</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue={tipos[0]}>
        <TabsList className="flex-wrap">
          {tipos.map((t) => <TabsTrigger key={t} value={t}>{t}</TabsTrigger>)}
        </TabsList>
        {tipos.map((t) => {
          const items = lista.filter((l) => l.tipo === t);
          return (
            <TabsContent key={t} value={t} className="mt-5">
              {items.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                  Sem licenças de «{t}». Use «Solicitar nova licença» para submeter um pedido.
                </div>
              ) : (
                <div className="space-y-3">
                  {items.map((l) => (
                    <div key={l.id} className="card-elevated rounded-xl p-5">
                      <div className="flex flex-wrap items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-primary">{l.codigo}</p>
                            <EstadoBadge estado={l.estado === "Em apreciação" ? "Em apreciação" : "Activo"} />
                          </div>
                          <p className="text-sm text-muted-foreground">Campanha {l.campanha} · válida até {fmtData(l.validoAte)}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-3">
                          {l.estado !== "Em apreciação" && <DiasAteExpirar validoAte={l.validoAte} />}
                          <Button size="sm" variant="outline" onClick={() => descarregar(l)}>
                            <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                          </Button>
                          {l.renovavel && diasAte(l.validoAte) <= 120 && (
                            <Button size="sm" variant="outline" onClick={() => setRenovar(renovar === l.id ? null : l.id)}>
                              <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Renovar
                            </Button>
                          )}
                        </div>
                      </div>
                      {renovar === l.id && (
                        <div className="mt-4 animate-fade-in rounded-lg border border-border bg-muted/30 p-4">
                          <p className="mb-3 text-sm font-medium">Renovação da licença {l.codigo} (PR-10 a PR-13 conforme o tipo)</p>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <FileUpload label="Relatório de execução da campanha anterior" obrigatorio />
                            <FileUpload label="Certidão de conformidade tributária actualizada" obrigatorio />
                          </div>
                          <Button className="mt-4" size="sm" onClick={() => { setRenovar(null); toast.success("Pedido de renovação submetido (demonstração)."); }}>
                            Submeter renovação
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
