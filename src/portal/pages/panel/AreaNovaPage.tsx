import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/portal/components/FileUpload";
import { StepProgress } from "@/portal/components/StepProgress";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const passos = ["Localização", "Delimitação", "Revisão"];
const provinciasAO = ["Bengo", "Benguela", "Bié", "Cabinda", "Cuando-Cubango", "Cuanza-Norte", "Cuanza-Sul", "Cunene", "Huambo", "Huíla", "Luanda", "Lunda-Norte", "Lunda-Sul", "Malanje", "Moxico", "Namibe", "Uíge", "Zaire"];

export default function AreaNovaPage() {
  const [passo, setPasso] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" asChild><Link to="/painel/areas"><ArrowLeft className="mr-1.5 h-4 w-4" /> As Minhas Áreas</Link></Button>
      <h1 className="text-lg font-bold">Registar Nova Área</h1>
      <StepProgress passos={passos} actual={passo} onSelect={(i) => i < passo && setPasso(i)} />

      <div className="card-elevated rounded-xl p-6 animate-fade-in" key={passo}>
        {passo === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Nome da área *</Label><Input placeholder="Ex.: Área Florestal de Buco-Zau" /></div>
            <div className="space-y-1.5"><Label>Província *</Label>
              <Select><SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                <SelectContent>{provinciasAO.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Município *</Label><Input /></div>
            <div className="space-y-1.5"><Label>Comuna</Label><Input /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Área estimada (ha) *</Label><Input type="number" /></div>
          </div>
        )}
        {passo === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload label="Croquis de localização" obrigatorio ajuda="PDF ou imagem com a delimitação da área." />
            <FileUpload label="Memória descritiva" obrigatorio ajuda="Acessos, limites, hidrografia e ocupações existentes." />
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Coordenadas GPS dos vértices (um por linha)</Label>
              <textarea className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder={"-5.050, 12.600\n-5.060, 12.620"} />
              <p className="text-xs text-muted-foreground">Mínimo de 3 vértices. O polígono será submetido a parecer cadastral.</p>
            </div>
          </div>
        )}
        {passo === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A área ficará pendente de parecer cadastral (Conforme / Conforme com reserva / Não conforme) antes de poder receber concessões ou licenças.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Checkbox checked={confirmado} onCheckedChange={(v) => setConfirmado(v === true)} className="mt-0.5" />
              Declaro que a delimitação apresentada é da minha responsabilidade e não sobrepõe áreas de terceiros.
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>Anterior</Button>
        {passo < 2 ? (
          <Button onClick={() => setPasso((p) => p + 1)}>Seguinte</Button>
        ) : (
          <Button disabled={!confirmado} onClick={() => { toast.success("Área submetida para parecer cadastral (demonstração)."); navigate("/painel/areas"); }}>
            <Send className="mr-1.5 h-4 w-4" /> Submeter registo de área
          </Button>
        )}
      </div>
    </div>
  );
}
