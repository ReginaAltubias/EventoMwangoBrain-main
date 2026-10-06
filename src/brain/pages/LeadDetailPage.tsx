import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CalendarPlus, Copy, Mail, MessageCircle, Phone, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { InterestBadge, LeadStatusBadge, SolutionChip } from "../components/Common";
import { useBrain } from "../store/BrainStore";
import type { InterestLevel, LeadDetail, LeadStatus, LeadWriteInput, Meeting, NextAction, Solution } from "../types";

const stages: LeadStatus[] = [
  "Novo",
  "Contactado",
  "Qualificado",
  "Demonstração",
  "Reunião",
  "Proposta enviada",
  "Em negociação",
  "Convertido",
  "Sem interesse",
  "Sem resposta",
];
const timeframes: NonNullable<LeadDetail["timeframe"]>[] = [
  "0–3 meses",
  "3–6 meses",
  "6–12 meses",
  "Sem prazo definido",
];
const actions: NextAction[] = [
  "Ligar",
  "Contactar via WhatsApp",
  "Enviar apresentação",
  "Fazer demonstração",
  "Agendar reunião",
  "Preparar proposta",
  "Encaminhar para equipa técnica",
  "Nenhuma ação",
];

type LeadForm = LeadWriteInput & { estimatedValueInput: string };

function toLeadForm(lead: LeadDetail): LeadForm {
  return {
    contactId: lead.contactId,
    mainSolution: lead.mainSolution,
    solutions: lead.solutions,
    interest: lead.interest,
    status: lead.status,
    ownerId: lead.ownerId,
    need: lead.need ?? "",
    hasConcreteNeed: lead.hasConcreteNeed,
    timeframe: lead.timeframe ?? "Sem prazo definido",
    nextAction: lead.nextAction,
    followUpDate: lead.followUpDate ?? "",
    notes: lead.notes ?? "",
    estimatedValue: lead.estimatedValue ?? null,
    estimatedValueInput: lead.estimatedValue?.toString() ?? "",
  };
}

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const brain = useBrain();
  const { getLead } = brain;
  const [note, setNote] = useState("");
  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingType, setMeetingType] = useState<Meeting["type"]>("Demonstração");
  const [leadDetail, setLeadDetail] = useState<LeadDetail | null>(null);
  const [leadLoading, setLeadLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [form, setForm] = useState<LeadForm | null>(null);

  useEffect(() => {
    if (!id) {
      setLeadLoading(false);
      return;
    }
    let active = true;
    setLeadDetail(null);
    setLeadLoading(true);
    getLead(id)
      .then((lead) => {
        if (active) setLeadDetail(lead);
      })
      .catch((err: unknown) => {
        if (active) toast.error(err instanceof Error ? err.message : "Erro ao carregar lead");
      })
      .finally(() => {
        if (active) setLeadLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, getLead]);

  const lead = leadDetail ?? brain.leads.find((item) => item.id === id) ?? null;
  const contact = leadDetail?.contact ?? brain.contacts.find((item) => item.id === lead?.contactId);

  const updateStatus = async (status: LeadStatus) => {
    if (!lead) return;
    try {
      await brain.updateLeadStatus(lead.id, status);
      setLeadDetail((current) => (current ? { ...current, status } : current));
      toast.success("Estado da lead actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao actualizar estado");
    }
  };

  const saveLead = async () => {
    if (!lead || !form) return;
    if (!form.contactId || !form.mainSolution) {
      toast.error("Contacto e solução principal são obrigatórios");
      return;
    }
    setEditSaving(true);
    try {
      const updated = await brain.updateLead(lead.id, {
        contactId: form.contactId,
        mainSolution: form.mainSolution,
        solutions: form.solutions,
        interest: form.interest,
        status: form.status,
        ownerId: form.ownerId,
        need: form.need || null,
        hasConcreteNeed: form.hasConcreteNeed,
        timeframe: form.timeframe,
        nextAction: form.nextAction,
        followUpDate: form.followUpDate || null,
        notes: form.notes || null,
        estimatedValue: form.estimatedValueInput ? Number(form.estimatedValueInput) : null,
      });
      setLeadDetail({ ...lead, ...updated, contact: leadDetail?.contact });
      setEditOpen(false);
      toast.success("Lead actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao actualizar lead");
    } finally {
      setEditSaving(false);
    }
  };

  const removeLead = async () => {
    if (!lead) return;
    setDeleteSaving(true);
    try {
      await brain.deleteLead(lead.id);
      toast.success("Lead eliminada");
      navigate("/leads");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao eliminar lead");
    } finally {
      setDeleteSaving(false);
    }
  };

  const copy = (value?: string | null) => {
    void navigator.clipboard.writeText(value ?? "").then(
      () => toast.success("Copiado"),
      (err: unknown) => toast.error(err instanceof Error ? err.message : "Erro ao copiar"),
    );
  };

  const saveMeeting = async () => {
    if (!lead || !meetingDate) {
      toast.error("Seleccione a data e hora da reunião");
      return;
    }
    const start = new Date(meetingDate);
    try {
      await brain.addMeeting({
        leadId: lead.id,
        type: meetingType,
        start: start.toISOString(),
        end: new Date(start.getTime() + 3600000).toISOString(),
        location: "Stand Mwango Brain",
      });
      setMeetingOpen(false);
      toast.success("Reunião agendada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao agendar reunião");
    }
  };

  if (leadLoading && !lead) {
    return <div className="surface p-10 text-center text-muted-foreground">A carregar lead...</div>;
  }
  if (!lead) {
    return <div className="surface p-10 text-center">Lead não encontrada.</div>;
  }

  const currentStage = stages.indexOf(lead.status);
  return (
    <>
      <Button variant="ghost" className="mb-4" onClick={() => navigate(-1)}>
        <ArrowLeft /> Voltar
      </Button>
      <header className="mb-6 flex flex-col gap-4 border-b pb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">{contact?.fullName ?? lead.id}</h1>
            <LeadStatusBadge value={lead.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{contact?.company ?? lead.contactId}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => { setForm(toLeadForm(lead)); setEditOpen(true); }}>
            Editar lead
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 /> Eliminar
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("note")?.focus()}>
            <Plus /> Registar interacção
          </Button>
          <Button variant="outline" onClick={() => setMeetingOpen(true)}>
            <CalendarPlus /> Agendar reunião
          </Button>
          {contact?.whatsapp && (
            <Button asChild>
              <a href={`https://wa.me/${contact.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                <MessageCircle /> WhatsApp
              </a>
            </Button>
          )}
        </div>
      </header>

      <section className="surface mb-6 overflow-x-auto p-5">
        <div className="flex min-w-[900px] items-center">
          {stages.map((stage, index) => (
            <button
              key={stage}
              onClick={() => void updateStatus(stage)}
              className="flex flex-1 items-center"
              aria-label={`Alterar estado para ${stage}`}
            >
              <span
                className={
                  index < currentStage
                    ? "grid h-7 w-7 place-items-center rounded-full bg-foreground text-xs text-background"
                    : index === currentStage
                      ? "grid h-7 w-7 place-items-center rounded-full bg-primary text-xs text-primary-foreground"
                      : "grid h-7 w-7 place-items-center rounded-full bg-muted text-xs text-muted-foreground"
                }
              >
                {index + 1}
              </span>
              <span className="ml-2 whitespace-nowrap text-xs">{stage}</span>
              {index < stages.length - 1 && <span className="mx-2 h-px flex-1 bg-border" />}
            </button>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[.8fr_1fr_1.2fr]">
        <section className="surface p-5">
          <h2 className="section-title">Dados do contacto</h2>
          {contact ? (
            <div className="mt-5 space-y-4">
              {[
                [Phone, "Telefone", contact.phone],
                [MessageCircle, "WhatsApp", contact.whatsapp],
                [Mail, "E-mail", contact.email],
              ].map(([Icon, label, value]) => (
                <div key={String(label)} className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-md bg-muted">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <small className="block text-muted-foreground">{label as string}</small>
                    <strong className="block truncate text-sm">{value as string}</strong>
                  </span>
                  <Button size="icon" variant="ghost" onClick={() => copy(value as string)}>
                    <Copy />
                  </Button>
                </div>
              ))}
              <div className="border-t pt-4">
                <small className="text-muted-foreground">Área de actuação</small>
                <p className="text-sm font-medium">{contact.sector || "—"}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">Contacto associado: {lead.contactId}</p>
          )}
          <div className="mt-4">
            <small className="text-muted-foreground">Responsável</small>
            <p className="text-sm font-medium">
              {brain.users.find((user) => user.id === lead.ownerId)?.name ?? lead.ownerId}
            </p>
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="section-title">Interesse</h2>
          <div className="mt-5 space-y-5">
            <div>
              <small className="label">Solução principal</small>
              <div className="mt-2"><SolutionChip value={lead.mainSolution} /></div>
            </div>
            <div>
              <small className="label">Nível de interesse</small>
              <div className="mt-2"><InterestBadge value={lead.interest} /></div>
            </div>
            <div>
              <small className="label">Necessidade identificada</small>
              <p className="mt-2 text-sm leading-6">{lead.need || "—"}</p>
            </div>
            <div>
              <small className="label">Prazo</small>
              <p className="mt-2 text-sm">{lead.timeframe || "—"}</p>
            </div>
            <div>
              <small className="label">Próximo passo</small>
              <p className="mt-2 text-sm font-semibold text-primary">{lead.nextAction || "—"}</p>
            </div>
            <div>
              <small className="label">Valor estimado</small>
              <p className="mt-2 text-sm">{lead.estimatedValue?.toLocaleString("pt-PT") ?? "—"}</p>
            </div>
          </div>
        </section>

        <section className="surface p-5">
          <h2 className="section-title">Linha de actividade</h2>
          <div className="mt-4 flex gap-2">
            <Input id="note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Adicionar nota rápida…" />
            <Button
              size="icon"
              onClick={() => {
                if (!note.trim()) return;
                brain.addInteraction(lead.id, note)
                  .then(() => { setNote(""); toast.success("Interacção registada"); })
                  .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Erro ao registar interacção"));
              }}
            >
              <Plus />
            </Button>
          </div>
          <div className="mt-6 space-y-5 border-l pl-5">
            {(leadDetail?.interactions ?? brain.interactions.filter((item) => item.leadId === lead.id))
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((interaction) => (
                <div key={interaction.id} className="relative">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                  <p className="text-sm font-medium">{interaction.description}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {interaction.type} · {new Date(interaction.date).toLocaleDateString("pt-PT", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              ))}
          </div>
        </section>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar lead</DialogTitle>
            <DialogDescription>Actualize os dados comerciais da lead.</DialogDescription>
          </DialogHeader>
          {form && (
            <div className="space-y-4">
              <Select value={form.contactId} onValueChange={(contactId) => setForm({ ...form, contactId })}>
                <SelectTrigger><SelectValue placeholder="Contacto" /></SelectTrigger>
                <SelectContent>
                  {brain.contacts.map((item) => <SelectItem key={item.id} value={item.id}>{item.fullName} · {item.company}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={form.mainSolution} onValueChange={(mainSolution) => setForm({ ...form, mainSolution: mainSolution as Solution })}>
                <SelectTrigger><SelectValue placeholder="Solução principal" /></SelectTrigger>
                <SelectContent>
                  {brain.solutions.map((item) => <SelectItem key={item.id} value={item.name}>{item.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="grid gap-4 sm:grid-cols-2">
                <Select value={form.interest} onValueChange={(interest) => setForm({ ...form, interest: interest as InterestLevel })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{(["Alto", "Médio", "Baixo"] as InterestLevel[]).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.status} onValueChange={(status) => setForm({ ...form, status: status as LeadStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{stages.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Necessidade identificada" value={form.need ?? ""} onChange={(event) => setForm({ ...form, need: event.target.value })} />
              <Select
                value={form.hasConcreteNeed}
                onValueChange={(hasConcreteNeed) => setForm({ ...form, hasConcreteNeed: hasConcreteNeed as LeadDetail["hasConcreteNeed"] })}
              >
                <SelectTrigger><SelectValue placeholder="Necessidade concreta" /></SelectTrigger>
                <SelectContent>{(["Sim", "Não", "Em avaliação"] as LeadDetail["hasConcreteNeed"][]).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.timeframe ?? "Sem prazo definido"} onValueChange={(timeframe) => setForm({ ...form, timeframe: timeframe as LeadDetail["timeframe"] })}>
                <SelectTrigger><SelectValue placeholder="Prazo" /></SelectTrigger>
                <SelectContent>{timeframes.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.nextAction} onValueChange={(nextAction) => setForm({ ...form, nextAction: nextAction as NextAction })}>
                <SelectTrigger><SelectValue placeholder="Próxima acção" /></SelectTrigger>
                <SelectContent>{actions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
              </Select>
              <div className="space-y-2">
                <Label>Data do follow-up</Label>
                <Input
                  type="datetime-local"
                  value={form.followUpDate?.slice(0, 16) ?? ""}
                  onChange={(event) => setForm({ ...form, followUpDate: event.target.value ? new Date(event.target.value).toISOString() : null })}
                />
              </div>
              <Textarea placeholder="Notas" value={form.notes ?? ""} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
              <Input
                type="number"
                min="0"
                placeholder="Valor estimado"
                value={form.estimatedValueInput}
                onChange={(event) => setForm({ ...form, estimatedValueInput: event.target.value })}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancelar</Button>
            <Button disabled={editSaving} onClick={() => void saveLead()}>
              {editSaving ? "A guardar..." : "Guardar alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={meetingOpen} onOpenChange={setMeetingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agendar reunião</DialogTitle>
            <DialogDescription>A reunião ficará ligada a {contact?.fullName ?? lead.contactId}.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tipo</Label>
              <Select value={meetingType} onValueChange={(value) => setMeetingType(value as Meeting["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Demonstração", "Reunião comercial", "Reunião técnica", "Apresentação", "Follow-up"] as Meeting["type"][]).map((item) => (
                    <SelectItem key={item} value={item}>{item}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Data e hora</Label>
              <Input type="datetime-local" value={meetingDate} onChange={(event) => setMeetingDate(event.target.value)} />
            </div>
          </div>
          <Button className="w-full" onClick={() => void saveMeeting()}>Guardar reunião</Button>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser desfeita. Os efeitos sobre interacções, follow-ups e reuniões associados
              não estão especificados pela API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSaving}
              onClick={(event) => {
                event.preventDefault();
                void removeLead();
              }}
            >
              {deleteSaving ? "A eliminar..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
