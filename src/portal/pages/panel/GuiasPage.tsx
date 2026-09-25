import { useState } from "react";
import { Download, Plus, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstadoBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { fmtData, guias as guiasMock, minhasLicencas, type GuiaTransito } from "@/portal/data/mock";
import { gerarDocumentoPdf } from "@/portal/lib/pdfDocumento";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";

type GuiaLocal = GuiaTransito & { licenca?: string; matricula?: string; pedido?: boolean };

export default function GuiasPage() {
  const { operador } = usePortalAuth();
  const [lista, setLista] = useState<GuiaLocal[]>(() => [...guiasMock]);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({
    produto: "",
    origem: "",
    destino: "",
    matricula: "",
    licenca: minhasLicencas[0]?.codigo ?? "",
    validoAte: "",
  });

  const submeter = () => {
    if (!form.produto.trim() || !form.origem.trim() || !form.destino.trim() || !form.matricula.trim()) {
      toast.error("Preencha o produto, o trajecto e a matrícula do veículo.");
      return;
    }
    const codigo = `GT-${new Date().getFullYear()}-${Math.floor(Math.random() * 90000) + 10000}`;
    setLista((a) => [
      {
        id: codigo,
        codigo,
        produto: form.produto,
        origem: form.origem,
        destino: form.destino,
        estado: "Em trânsito",
        validoAte: form.validoAte || new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10),
        licenca: form.licenca,
        matricula: form.matricula,
        pedido: true,
      },
      ...a,
    ]);
    setAberto(false);
    setForm({ produto: "", origem: "", destino: "", matricula: "", licenca: minhasLicencas[0]?.codigo ?? "", validoAte: "" });
    toast.success(`Guia ${codigo} solicitada. Pode descarregar o PDF.`);
  };

  const descarregar = (g: GuiaLocal) => {
    gerarDocumentoPdf({
      titulo: "Guia de trânsito de produtos florestais",
      subtitulo: "Documento de acompanhamento obrigatório do transporte",
      codigo: g.codigo,
      ficheiro: `${g.codigo}.pdf`,
      campos: [
        { rotulo: "Operador", valor: operador?.denominacao ?? "—" },
        { rotulo: "N.º de registo (NROF)", valor: operador?.nrof ?? "—" },
        { rotulo: "Produto transportado", valor: g.produto },
        { rotulo: "Origem", valor: g.origem },
        { rotulo: "Destino", valor: g.destino },
        { rotulo: "Licença associada", valor: g.licenca ?? "LAC-2026/0142" },
        { rotulo: "Matrícula do veículo", valor: g.matricula ?? "—" },
        { rotulo: "Válida até", valor: fmtData(g.validoAte) },
        { rotulo: "Estado", valor: g.estado },
      ],
      notas: [
        "A guia deve acompanhar a carga durante todo o trajecto e ser apresentada à fiscalização.",
        "O transporte fora do prazo de validade constitui infracção.",
      ],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-bold"><Truck className="h-5 w-5 text-primary" /> Guias de Trânsito</h1>
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Solicitar guia de trânsito</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Pedido de guia de trânsito</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Produto e volume</Label>
                <Input value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} placeholder="24,5 m³ de Tola serrada" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Origem</Label>
                  <Input value={form.origem} onChange={(e) => setForm({ ...form, origem: e.target.value })} placeholder="Cabinda" />
                </div>
                <div className="space-y-1.5">
                  <Label>Destino</Label>
                  <Input value={form.destino} onChange={(e) => setForm({ ...form, destino: e.target.value })} placeholder="Luanda" />
                </div>
                <div className="space-y-1.5">
                  <Label>Matrícula do veículo</Label>
                  <Input value={form.matricula} onChange={(e) => setForm({ ...form, matricula: e.target.value })} placeholder="LD-00-00-AA" />
                </div>
                <div className="space-y-1.5">
                  <Label>Válida até</Label>
                  <Input type="date" value={form.validoAte} onChange={(e) => setForm({ ...form, validoAte: e.target.value })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Licença associada</Label>
                <Select value={form.licenca} onValueChange={(v) => setForm({ ...form, licenca: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{minhasLicencas.map((l) => <SelectItem key={l.id} value={l.codigo}>{l.codigo} · {l.tipo}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <FileUpload label="Factura ou nota de expedição" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button onClick={submeter}>Solicitar guia</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3">Código de verificação</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Trajecto</th>
              <th className="px-4 py-3">Válida até</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {lista.map((g) => (
              <tr key={g.id} className="border-b border-border last:border-0 hover:bg-muted/40">
                <td className="px-4 py-3 font-bold text-primary">{g.codigo}</td>
                <td className="px-4 py-3">{g.produto}</td>
                <td className="px-4 py-3">{g.origem} → {g.destino}</td>
                <td className="px-4 py-3">{fmtData(g.validoAte)}</td>
                <td className="px-4 py-3"><EstadoBadge estado={g.estado} /></td>
                <td className="px-4 py-3 text-right">
                  <Button size="sm" variant="outline" onClick={() => descarregar(g)}>
                    <Download className="mr-1.5 h-3.5 w-3.5" /> PDF
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
