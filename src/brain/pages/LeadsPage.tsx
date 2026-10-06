import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Ellipsis, LayoutGrid, List, Plus, Search, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PageTitle,
  InterestBadge,
  LeadStatusBadge,
  SolutionChip,
  TablePagination,
  usePagedRows,
} from "../components/Common";
import { useBrain } from "../store/BrainStore";
import type { InterestLevel, Lead, LeadStatus, NextAction, Solution } from "../types";

const pipeline: LeadStatus[] = [
  "Qualificado",
  "Demonstração",
  "Reunião",
  "Proposta enviada",
  "Em negociação",
  "Convertido",
];
const statuses: LeadStatus[] = [
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
const interests: InterestLevel[] = ["Alto", "Médio", "Baixo"];
const nextActions: NextAction[] = [
  "Ligar",
  "Contactar via WhatsApp",
  "Enviar apresentação",
  "Fazer demonstração",
  "Agendar reunião",
  "Preparar proposta",
  "Encaminhar para equipa técnica",
  "Nenhuma ação",
];

export default function LeadsPage({ opportunities = false }: { opportunities?: boolean }) {
  const brain = useBrain();
  const nav = useNavigate();
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"table" | "kanban">(opportunities ? "kanban" : "table");
  const [createOpen, setCreateOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Lead | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState({
    contactId: "",
    mainSolution: brain.solutions[0]?.name ?? "",
    interest: "Alto" as InterestLevel,
    status: "Novo" as LeadStatus,
    need: "",
    hasConcreteNeed: "Em avaliação" as Lead["hasConcreteNeed"],
    timeframe: "Sem prazo definido" as NonNullable<Lead["timeframe"]>,
    nextAction: "Ligar" as NextAction,
    followUpDate: "",
    notes: "",
    estimatedValue: "",
  });

  const rows = useMemo(
    () =>
      brain.leads.filter((lead) => {
        const contact = brain.contacts.find((item) => item.id === lead.contactId);
        return (
          (!opportunities || pipeline.includes(lead.status)) &&
          `${contact?.fullName} ${contact?.company} ${lead.mainSolution}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );
      }),
    [brain.leads, brain.contacts, query, opportunities],
  );
  const { page, setPage, pages, pageRows, total } = usePagedRows(rows);

  const exportCsv = () => {
    const csv = [
      "Nome,Empresa,Solução,Interesse,Estado",
      ...rows.map((lead) => {
        const contact = brain.contacts.find((item) => item.id === lead.contactId);
        return `${contact?.fullName},${contact?.company},${lead.mainSolution},${lead.interest},${lead.status}`;
      }),
    ].join("\n");
    const anchor = document.createElement("a");
    anchor.href = URL.createObjectURL(new Blob([csv]));
    anchor.download = "leads-mwango.csv";
    anchor.click();
    URL.revokeObjectURL(anchor.href);
  };

  const createLead = async () => {
    if (!form.contactId || !form.mainSolution) {
      toast.error("Seleccione um contacto e uma solução");
      return;
    }
    setSaving(true);
    try {
      await brain.createLead({
        contactId: form.contactId,
        mainSolution: form.mainSolution,
        interest: form.interest,
        status: form.status,
        need: form.need,
        hasConcreteNeed: form.hasConcreteNeed,
        timeframe: form.timeframe,
        nextAction: form.nextAction,
        followUpDate: form.followUpDate || null,
        notes: form.notes,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
      });
      setCreateOpen(false);
      toast.success("Lead criada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao criar lead");
    } finally {
      setSaving(false);
    }
  };

  const removeLead = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await brain.deleteLead(deleteTarget.id);
      setDeleteTarget(null);
      toast.success("Lead eliminada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao eliminar lead");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageTitle
        title={opportunities ? "Oportunidades" : "Leads"}
        subtitle={
          opportunities
            ? "Acompanhe o pipeline comercial a partir da qualificação."
            : "Transforme contactos do Summit em oportunidades acompanháveis."
        }
        actions={
          <>
            {!opportunities && (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus /> Nova lead
              </Button>
            )}
            <Button variant="outline" onClick={exportCsv}>
              <Download /> Exportar CSV
            </Button>
          </>
        }
      />
      <div className="mb-5 flex flex-col gap-3 rounded-lg border bg-card p-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Pesquisar nome, empresa ou solução"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(value) => setView(value as typeof view)}>
          <TabsList>
            <TabsTrigger value="table">
              <List className="mr-2 h-4 w-4" /> Tabela
            </TabsTrigger>
            <TabsTrigger value="kanban">
              <LayoutGrid className="mr-2 h-4 w-4" /> Kanban
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {view === "table" ? (
        <div className="surface overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent">
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Solução</TableHead>
                <TableHead>Interesse</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Próximo follow-up</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRows.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    Nenhum lead encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((lead) => {
                  const contact = brain.contacts.find((item) => item.id === lead.contactId);
                  return (
                    <TableRow
                      key={lead.id}
                      className="cursor-pointer"
                      onClick={() => nav(`/leads/${lead.id}`)}
                    >
                      <TableCell className="font-medium text-foreground">
                        {contact?.fullName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{contact?.company}</TableCell>
                      <TableCell>
                        <SolutionChip value={lead.mainSolution} />
                      </TableCell>
                      <TableCell>
                        <InterestBadge value={lead.interest} />
                      </TableCell>
                      <TableCell>
                        <LeadStatusBadge value={lead.status} />
                      </TableCell>
                      <TableCell className="tabular-nums text-muted-foreground">
                        {lead.followUpDate
                          ? new Date(lead.followUpDate).toLocaleDateString("pt-PT", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" aria-label="Acções">
                              <Ellipsis />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => nav(`/leads/${lead.id}`)}>
                              Visualizar / editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteTarget(lead)}>
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination page={page} setPage={setPage} pages={pages} total={total} />
        </div>
      ) : (
        <div className="grid auto-cols-[280px] grid-flow-col gap-4 overflow-x-auto pb-4">
          {pipeline.map((status) => (
            <section key={status} className="rounded-lg bg-muted p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{status}</h2>
                <span className="text-xs text-muted-foreground">
                  {rows.filter((lead) => lead.status === status).length}
                </span>
              </div>
              <div className="space-y-3">
                {rows
                  .filter((lead) => lead.status === status)
                  .map((lead) => {
                    const contact = brain.contacts.find((item) => item.id === lead.contactId);
                    return (
                      <button
                        key={lead.id}
                        onClick={() => nav(`/leads/${lead.id}`)}
                        className="w-full rounded-lg border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary"
                      >
                        <strong className="block text-sm">{contact?.fullName}</strong>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {contact?.company}
                        </span>
                        <div className="mt-3 flex justify-between">
                          <SolutionChip value={lead.mainSolution} />
                          <InterestBadge value={lead.interest} />
                        </div>
                      </button>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova lead</DialogTitle>
            <DialogDescription>
              Associe a lead a um contacto existente. O responsável será a conta autenticada.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contacto *</Label>
              <Select
                value={form.contactId}
                onValueChange={(contactId) => setForm({ ...form, contactId })}
              >
                <SelectTrigger><SelectValue placeholder="Seleccione um contacto" /></SelectTrigger>
                <SelectContent>
                  {brain.contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.fullName} · {contact.company}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Solução principal *</Label>
              <Select
                value={form.mainSolution}
                onValueChange={(mainSolution) => setForm({ ...form, mainSolution: mainSolution as Solution })}
              >
                <SelectTrigger><SelectValue placeholder="Seleccione uma solução" /></SelectTrigger>
                <SelectContent>
                  {brain.solutions.map((solution) => (
                    <SelectItem key={solution.id} value={solution.name}>{solution.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Interesse *</Label>
                <Select
                  value={form.interest}
                  onValueChange={(interest) => setForm({ ...form, interest: interest as InterestLevel })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {interests.map((interest) => <SelectItem key={interest} value={interest}>{interest}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Estado *</Label>
                <Select
                  value={form.status}
                  onValueChange={(status) => setForm({ ...form, status: status as LeadStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input
              placeholder="Necessidade identificada"
              value={form.need}
              onChange={(event) => setForm({ ...form, need: event.target.value })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Próxima acção</Label>
                <Select
                  value={form.nextAction}
                  onValueChange={(nextAction) => setForm({ ...form, nextAction: nextAction as NextAction })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {nextActions.map((nextAction) => <SelectItem key={nextAction} value={nextAction}>{nextAction}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor estimado</Label>
                <Input
                  type="number"
                  min="0"
                  value={form.estimatedValue}
                  onChange={(event) => setForm({ ...form, estimatedValue: event.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancelar</Button>
            <Button disabled={saving} onClick={createLead}>
              {saving ? "A guardar..." : "Criar lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar lead?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser desfeita. As consequências para interacções, follow-ups e reuniões
              associados não estão especificadas pela API.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(event) => {
                event.preventDefault();
                void removeLead();
              }}
            >
              {deleting ? "A eliminar..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
