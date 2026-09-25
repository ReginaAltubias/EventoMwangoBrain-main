import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileUpload } from "@/portal/components/FileUpload";
import { StepProgress } from "@/portal/components/StepProgress";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { concursos, fmtData, kz } from "@/portal/data/mock";
import { toast } from "sonner";

const passos = ["Identificação", "Proposta técnica", "Proposta financeira", "Revisão"];

export default function CandidaturaPage() {
  const { id } = useParams();
  const c = concursos.find((x) => x.id === id);
  const { operador } = usePortalAuth();
  const [passo, setPasso] = useState(0);
  const [confirmado, setConfirmado] = useState(false);
  const [submetida, setSubmetida] = useState(false);

  if (!c || !operador) return <p className="text-muted-foreground">Concurso não encontrado.</p>;

  if (submetida) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center animate-scale-in">
        <div className="card-elevated rounded-2xl p-8">
          <Send className="mx-auto h-10 w-10 text-success" />
          <h1 className="mt-4 text-xl font-bold">Candidatura submetida</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A sua candidatura ao concurso <strong className="text-foreground">{c.codigo}</strong> foi recebida.
            Acompanhe o estado em «Concursos Públicos → As Minhas Candidaturas».
          </p>
          <Button className="mt-6" asChild><Link to="/painel/concursos">Ver as minhas candidaturas</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Button variant="ghost" size="sm" asChild><Link to={`/concursos/${c.id}`}><ArrowLeft className="mr-1.5 h-4 w-4" /> {c.codigo}</Link></Button>
      <div className="card-elevated rounded-xl p-5">
        <h1 className="text-lg font-bold">Candidatura — {c.titulo}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Prazo de candidatura: {fmtData(c.prazo.slice(0, 10))}</p>
      </div>

      <StepProgress passos={passos} actual={passo} onSelect={(i) => i < passo && setPasso(i)} />

      <div className="card-elevated rounded-xl p-6 animate-fade-in" key={passo}>
        {passo === 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Operador</Label><Input value={operador.denominacao} readOnly disabled /></div>
            <div className="space-y-1.5"><Label>NROF</Label><Input value={operador.nrof ?? ""} readOnly disabled /></div>
            <div className="space-y-1.5"><Label>Concurso</Label><Input value={c.codigo} readOnly disabled /></div>
            <div className="space-y-1.5"><Label>Área a concurso</Label><Input value={`${c.areaHa.toLocaleString("pt-AO")} ha — ${c.provincia}`} readOnly disabled /></div>
          </div>
        )}
        {passo === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <FileUpload label="Declaração de capacidade técnica" obrigatorio />
            <FileUpload label="Relação de meios materiais e equipamentos" obrigatorio />
            <FileUpload label="Plano de valorização local e emprego" obrigatorio />
            <FileUpload label="Certificados de experiência prévia" />
          </div>
        )}
        {passo === 2 && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Proposta de renda anual (Kz/ha) *</Label>
              <Input type="number" placeholder="Ex.: 3500" />
            </div>
            <div className="space-y-1.5">
              <Label>Capacidade financeira declarada</Label>
              <Input value={kz(180000000)} readOnly disabled />
            </div>
            <div className="sm:col-span-2">
              <FileUpload label="Declaração bancária actualizada" obrigatorio />
            </div>
          </div>
        )}
        {passo === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Confirme a submissão da candidatura ao concurso <strong className="text-foreground">{c.codigo}</strong>.
              Após o encerramento, a comissão de concurso avaliará as propostas segundo os critérios publicados.
            </p>
            <label className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-4 text-sm">
              <Checkbox checked={confirmado} onCheckedChange={(v) => setConfirmado(v === true)} className="mt-0.5" />
              Confirmo que aceito integralmente o programa e as peças do procedimento do concurso.
            </label>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setPasso((p) => Math.max(0, p - 1))} disabled={passo === 0}>Anterior</Button>
        {passo < 3 ? (
          <Button onClick={() => setPasso((p) => p + 1)}>Seguinte</Button>
        ) : (
          <Button disabled={!confirmado} onClick={() => { setSubmetida(true); toast.success("Candidatura submetida."); }}>
            <Send className="mr-1.5 h-4 w-4" /> Submeter candidatura
          </Button>
        )}
      </div>
    </div>
  );
}
