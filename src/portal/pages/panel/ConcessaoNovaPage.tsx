import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/portal/components/FileUpload";
import { StepProgress } from "@/portal/components/StepProgress";
import { minhasAreas } from "@/portal/data/mock";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const passos = ["Identificação", "Área pretendida", "Capacidade e garantias", "Documentos", "Revisão"];

// Réplica simplificada do formulário F-08 (requerimento de concessão).
export default function ConcessaoNovaPage() {
  const { operador } = usePortalAuth();
  const navigate = useNavigate();
  const [passo, setPasso] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const [area, setArea] = useState("");

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" asChild><Link to="/painel/concessoes"><ArrowLeft className="mr-1.5 h-4 w-4" /> As Minhas Concessões</Link></Button>
      <h1 className="text-lg font-bold">Requerer Concessão Florestal (F-08)</h1>
      <StepProgress passos={passos} actual={passo} onSelect={(i) => i < passo && setPasso(i)} />

      <div className="card-elevated rounded-xl p-6 animate-fade-in" key={passo}>
        {passo === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Operador</Label><Input value={operador?.denominacao ?? ""} readOnly disabled /></div>
            <div className="space-y-1.5"><Label>NROF</Label><Input value={operador?.nrof ?? ""} readOnly disabled /></div>
            <div className="space-y-1.5"><Label>Categoria pretendida *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="exploracao">Exploração Florestal</SelectItem>
                  <SelectItem value="reflorestamento">Reflorestamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Prazo pretendido *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="anual">Anual renovável</SelectItem>
                  <SelectItem value="plurianual">Plurianual</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        {passo === 1 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Área-mãe registada *</Label>
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger><SelectValue placeholder="Seleccionar área…" /></SelectTrigger>
                <SelectContent>
                  {minhasAreas.map((a) => <SelectItem key={a.id} value={a.codigo}>{a.codigo} — {a.nome} ({a.areaHa.toLocaleString("pt-AO")} ha)</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Área pretendida (ha) *</Label><Input type="number" placeholder="Máx.: área livre da área-mãe" /></div>
            <div className="space-y-1.5"><Label>Espécies-alvo *</Label><Input placeholder="Ex.: Tola, Sipo" /></div>
          </div>
        )}
        {passo === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Meios materiais (resumo) *</Label><Input placeholder="Ex.: 2 skidders, 1 serra móvel" /></div>
            <div className="space-y-1.5"><Label>Capacidade financeira (Kz) *</Label><Input type="number" /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Garantia bancária / caução *</Label><Input placeholder="Referência da garantia" /></div>
          </div>
        )}
        {passo === 3 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload label="Programa de exploração preliminar" obrigatorio />
            <FileUpload label="Estudo de mercado / plano de negócio" obrigatorio />
            <FileUpload label="Comprovativo de garantia bancária" obrigatorio />
            <FileUpload label="Outros documentos de suporte" />
          </div>
        )}
        {passo === 4 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              O requerimento será submetido ao IDF e seguirá as 8 fases legais de tramitação (A–H).
              Receberá notificações em cada transição de fase.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Checkbox checked={confirmado} onCheckedChange={(v) => setConfirmado(v === true)} className="mt-0.5" />
              Confirmo os dados apresentados e aceito as obrigações do Regulamento Florestal.
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>Anterior</Button>
        {passo < 4 ? (
          <Button onClick={() => setPasso((p) => p + 1)}>Seguinte</Button>
        ) : (
          <Button disabled={!confirmado} onClick={() => { toast.success("Requerimento de concessão submetido (demonstração)."); navigate("/painel/concessoes"); }}>
            <Send className="mr-1.5 h-4 w-4" /> Submeter requerimento
          </Button>
        )}
      </div>
    </div>
  );
}
