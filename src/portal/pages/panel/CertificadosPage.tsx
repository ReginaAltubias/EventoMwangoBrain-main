import { useState } from "react";
import { Download, FileCheck2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstadoBadge } from "@/portal/components/Badges";
import { FileUpload } from "@/portal/components/FileUpload";
import { certificados as certificadosMock, diasAte, fmtData } from "@/portal/data/mock";
import { gerarDocumentoPdf } from "@/portal/lib/pdfDocumento";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const tiposCertificado = ["Certificado de origem", "Certificado de classificação", "Certificado fitossanitário", "Certificado de exportação"];

interface CertificadoLocal {
  id: string;
  codigo: string;
  produto: string;
  emitidoEm: string;
  escoamentoAte: string;
  tipo?: string;
  estado?: "Emitido" | "Em apreciação";
  estancia?: string;
}

export default function CertificadosPage() {
  const { operador } = usePortalAuth();
  const [lista, setLista] = useState<CertificadoLocal[]>(() =>
    certificadosMock.map((c) => ({ ...c, tipo: "Certificado de classificação", estado: "Emitido" as const })),
  );
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState({ tipo: tiposCertificado[0], estancia: "", produto: "", observacoes: "" });

  const submeter = () => {
    if (!form.produto.trim() || !form.estancia.trim()) {
      toast.error("Indique a estância e o produto a certificar.");
      return;
    }
    const hoje = new Date();
    const codigo = `CE-${hoje.getFullYear()}-${Math.floor(Math.random() * 9000) + 1000}`;
    setLista((a) => [
      {
        id: codigo,
        codigo,
        produto: form.produto,
        emitidoEm: hoje.toISOString().slice(0, 10),
        escoamentoAte: new Date(hoje.getTime() + 90 * 864e5).toISOString().slice(0, 10),
        tipo: form.tipo,
        estado: "Em apreciação",
        estancia: form.estancia,
      },
      ...a,
    ]);
    setAberto(false);
    setForm({ tipo: tiposCertificado[0], estancia: "", produto: "", observacoes: "" });
    toast.success(`Pedido de certificado ${codigo} submetido. Pode descarregar o PDF.`);
  };

  const descarregar = (c: CertificadoLocal) => {
    const pedido = c.estado === "Em apreciação";
    gerarDocumentoPdf({
      titulo: pedido ? "Comprovativo de pedido de certificado" : c.tipo ?? "Certificado",
      subtitulo: c.tipo,
      codigo: c.codigo,
      ficheiro: `${c.codigo}.pdf`,
      campos: [
        { rotulo: "Operador", valor: operador?.denominacao ?? "—" },
        { rotulo: "N.º de registo (NROF)", valor: operador?.nrof ?? "—" },
        { rotulo: "Tipo", valor: c.tipo ?? "—" },
        { rotulo: "Estância / local", valor: c.estancia ?? "Estância registada do operador" },
        { rotulo: "Produto", valor: c.produto },
        { rotulo: "Data", valor: fmtData(c.emitidoEm) },
        { rotulo: "Escoamento até", valor: fmtData(c.escoamentoAte) },
        { rotulo: "Estado", valor: pedido ? "Em apreciação pelo IDF" : "Emitido" },
      ],
      notas: pedido
        ? ["O certificado será emitido após verificação técnica do lote pelo IDF."]
        : ["O certificado acompanha o lote até ao destino final.", "Findo o prazo de escoamento, o certificado perde validade."],
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-2 text-lg font-bold"><FileCheck2 className="h-5 w-5 text-primary" /> Certificados</h1>
        <Dialog open={aberto} onOpenChange={setAberto}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus className="mr-1.5 h-4 w-4" /> Solicitar certificado</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Pedido de certificado</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Tipo de certificado</Label>
                <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{tiposCertificado.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Estância / local do lote</Label>
                <Input value={form.estancia} onChange={(e) => setForm({ ...form, estancia: e.target.value })} placeholder="Estância de Buco-Zau" />
              </div>
              <div className="space-y-1.5">
                <Label>Produto e volume</Label>
                <Input value={form.produto} onChange={(e) => setForm({ ...form, produto: e.target.value })} placeholder="96 m³ de Tola classificada" />
              </div>
              <div className="space-y-1.5">
                <Label>Observações</Label>
                <Textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
              </div>
              <FileUpload label="Mapa de classificação do lote" obrigatorio />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
              <Button onClick={submeter}>Solicitar certificado</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {lista.map((c) => {
          const dias = diasAte(c.escoamentoAte);
          return (
            <div key={c.id} className="card-elevated rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-primary">{c.codigo}</p>
                  <p className="text-xs text-muted-foreground">{c.tipo}</p>
                </div>
                <EstadoBadge estado={c.estado === "Em apreciação" ? "Em apreciação" : "Válido"} />
              </div>
              <p className="mt-2 text-sm">{c.produto}</p>
              <p className="mt-1 text-xs text-muted-foreground">Data {fmtData(c.emitidoEm)}</p>
              <div className={cn("mt-4 rounded-lg px-3 py-2 text-sm font-semibold",
                dias < 0 ? "bg-destructive/10 text-destructive" : dias <= 30 ? "bg-warning/10 text-warning" : "bg-success/10 text-success")}>
                {dias < 0 ? "Prazo de escoamento expirado" : `Escoamento até ${fmtData(c.escoamentoAte)} — ${dias} dias`}
              </div>
              <Button size="sm" variant="outline" className="mt-4" onClick={() => descarregar(c)}>
                <Download className="mr-1.5 h-3.5 w-3.5" /> Descarregar PDF
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
