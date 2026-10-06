import { useState } from "react";
import { Check, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { PageTitle, TablePagination, usePagedRows } from "../components/Common";
import { useBrain } from "../store/BrainStore";
import type { ContactDetail, ContactCreateInput, InterestLevel, NextAction, Solution } from "../types";

const emptyContactForm = {
  fullName: "",
  company: "",
  phone: "",
  role: "",
  email: "",
  sector: "",
};

export default function ContactsPage() {
  const {
    contacts,
    solutions,
    getContact,
    createContact,
    createFullContact,
    updateContact,
    deleteContact,
  } = useBrain();
  const [open, setOpen] = useState(false);
  const [basicOpen, setBasicOpen] = useState(false);
  const [basicSaving, setBasicSaving] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [contactDetail, setContactDetail] = useState<ContactDetail | null>(null);
  const [editing, setEditing] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteSaving, setDeleteSaving] = useState(false);
  const [step, setStep] = useState(1);
  const [query, setQuery] = useState("");
  const [basicForm, setBasicForm] = useState(emptyContactForm);
  const [editForm, setEditForm] = useState<ContactCreateInput>({
    ...emptyContactForm,
    whatsapp: "",
    notes: "",
    source: "Stand",
  });
  const [form, setForm] = useState({
    ...emptyContactForm,
    solutions: [] as Solution[],
    mainSolution: (solutions[0]?.name ?? "") as Solution,
    interest: "Alto" as InterestLevel,
    need: "",
    nextAction: "Agendar reunião" as NextAction,
  });

  const saveBasicContact = async () => {
    if (!basicForm.fullName || !basicForm.company || !basicForm.phone) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    setBasicSaving(true);
    try {
      await createContact({
        ...basicForm,
        source: "Stand",
      });
      setBasicOpen(false);
      setBasicForm(emptyContactForm);
      toast.success("Contacto registado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registar contacto");
    } finally {
      setBasicSaving(false);
    }
  };

  const saveFullContact = async () => {
    if (!form.fullName || !form.company || !form.phone) {
      toast.error("Preencha os campos obrigatórios");
      setStep(1);
      return;
    }
    try {
      await createFullContact(
        {
          fullName: form.fullName,
          company: form.company,
          phone: form.phone,
          role: form.role,
          email: form.email,
          sector: form.sector,
          whatsapp: form.phone,
        },
        {
          solutions: form.solutions.length ? form.solutions : [form.mainSolution],
          mainSolution: form.mainSolution,
          interest: form.interest,
          need: form.need,
          hasConcreteNeed: "Em avaliação",
          nextAction: form.nextAction,
          followUpDate: new Date(Date.now() + 86400000).toISOString(),
        },
      );
      setOpen(false);
      toast.success("Contacto e lead registados");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao registar contacto");
    }
  };

  const showContact = async (id: string) => {
    setContactDetail(null);
    setEditing(false);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      setContactDetail(await getContact(id));
    } catch (err) {
      setDetailOpen(false);
      toast.error(err instanceof Error ? err.message : "Erro ao carregar contacto");
    } finally {
      setDetailLoading(false);
    }
  };

  const populateEditForm = (contact: ContactDetail) => {
    setEditForm({
      fullName: contact.fullName,
      company: contact.company,
      phone: contact.phone,
      role: contact.role ?? "",
      whatsapp: contact.whatsapp ?? "",
      email: contact.email ?? "",
      sector: contact.sector ?? "",
      notes: contact.notes ?? "",
      source: contact.source,
    });
  };

  const beginEdit = () => {
    if (!contactDetail) return;
    populateEditForm(contactDetail);
    setEditing(true);
  };

  const editFromList = async (id: string) => {
    setContactDetail(null);
    setEditing(true);
    setDetailLoading(true);
    setDetailOpen(true);
    try {
      const contact = await getContact(id);
      setContactDetail(contact);
      populateEditForm(contact);
    } catch (err) {
      setDetailOpen(false);
      setEditing(false);
      toast.error(err instanceof Error ? err.message : "Erro ao carregar contacto");
    } finally {
      setDetailLoading(false);
    }
  };

  const prepareDeleteFromList = async (id: string) => {
    setContactDetail(null);
    setDetailLoading(true);
    try {
      setContactDetail(await getContact(id));
      setDeleteOpen(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao carregar contacto");
    } finally {
      setDetailLoading(false);
    }
  };

  const saveContactChanges = async () => {
    if (!contactDetail) return;
    if (!editForm.fullName || !editForm.company || !editForm.phone) {
      toast.error("Nome, empresa e telefone são obrigatórios");
      return;
    }

    setEditSaving(true);
    try {
      const updated = await updateContact(contactDetail.id, editForm);
      setContactDetail(updated);
      setEditing(false);
      toast.success("Contacto actualizado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao actualizar contacto");
    } finally {
      setEditSaving(false);
    }
  };

  const confirmDeleteContact = async () => {
    if (!contactDetail) return;
    setDeleteSaving(true);
    try {
      await deleteContact(contactDetail.id);
      setDeleteOpen(false);
      setDetailOpen(false);
      toast.success("Contacto eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao eliminar contacto");
    } finally {
      setDeleteSaving(false);
    }
  };

  const filtered = contacts.filter((contact) =>
    `${contact.fullName} ${contact.company}`.toLowerCase().includes(query.toLowerCase()),
  );
  const { page, setPage, pages, pageRows, total } = usePagedRows(filtered);

  return (
    <>
      <PageTitle
        title="Contactos"
        subtitle="Visitantes e organizações captados durante o Summit."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => setBasicOpen(true)}>
              <Plus /> Contacto simples
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus /> Contacto + lead
            </Button>
          </div>
        }
      />
      <div className="mb-4 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Pesquisar contactos"
          />
        </div>
      </div>
      <div className="surface overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              <TableHead>Contacto</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Telemóvel</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead>Dados</TableHead>
              <TableHead className="text-right">Acções</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  Nenhum contacto encontrado.
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell>
                    <button
                      type="button"
                      className="text-left font-medium text-foreground hover:underline"
                      onClick={() => showContact(contact.id)}
                    >
                      {contact.fullName}
                    </button>
                    {contact.role && (
                      <small className="block text-muted-foreground">{contact.role}</small>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.company}</TableCell>
                  <TableCell className="tabular-nums text-muted-foreground">
                    {contact.phone}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{contact.source}</TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex w-fit rounded-full px-2 py-1 text-xs font-medium",
                        contact.isComplete
                          ? "bg-success-soft text-success"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {contact.isComplete ? "Completo" : "Incompleto"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Ver ${contact.fullName}`}
                        onClick={() => showContact(contact.id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Editar ${contact.fullName}`}
                        onClick={() => editFromList(contact.id)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        aria-label={`Eliminar ${contact.fullName}`}
                        onClick={() => prepareDeleteFromList(contact.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        <TablePagination page={page} setPage={setPage} pages={pages} total={total} />
      </div>

      <Sheet open={basicOpen} onOpenChange={setBasicOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Novo contacto simples</SheetTitle>
            <SheetDescription>
              Este registo cria apenas um contacto, sem criar uma lead associada.
            </SheetDescription>
          </SheetHeader>
          <div className="my-6 grid gap-4 sm:grid-cols-2">
            <Field
              label="Nome completo *"
              value={basicForm.fullName}
              onChange={(value) => setBasicForm({ ...basicForm, fullName: value })}
            />
            <Field
              label="Empresa *"
              value={basicForm.company}
              onChange={(value) => setBasicForm({ ...basicForm, company: value })}
            />
            <Field
              label="Telefone *"
              value={basicForm.phone}
              onChange={(value) => setBasicForm({ ...basicForm, phone: value })}
            />
            <Field
              label="Cargo"
              value={basicForm.role}
              onChange={(value) => setBasicForm({ ...basicForm, role: value })}
            />
            <Field
              label="E-mail"
              value={basicForm.email}
              onChange={(value) => setBasicForm({ ...basicForm, email: value })}
            />
            <Field
              label="Área de actuação"
              value={basicForm.sector}
              onChange={(value) => setBasicForm({ ...basicForm, sector: value })}
            />
          </div>
          <div className="flex justify-end border-t pt-5">
            <Button disabled={basicSaving} onClick={saveBasicContact}>
              {basicSaving ? "A guardar..." : "Guardar contacto"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Detalhes do contacto</SheetTitle>
            <SheetDescription>Informação devolvida pelo endpoint do contacto.</SheetDescription>
          </SheetHeader>
          {detailLoading ? (
            <p className="py-8 text-sm text-muted-foreground">A carregar contacto...</p>
          ) : contactDetail ? (
            <>
              {editing ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <Field label="Nome completo *" value={editForm.fullName} onChange={(value) => setEditForm({ ...editForm, fullName: value })} />
                  <Field label="Empresa *" value={editForm.company} onChange={(value) => setEditForm({ ...editForm, company: value })} />
                  <Field label="Telefone *" value={editForm.phone} onChange={(value) => setEditForm({ ...editForm, phone: value })} />
                  <Field label="WhatsApp" value={editForm.whatsapp ?? ""} onChange={(value) => setEditForm({ ...editForm, whatsapp: value })} />
                  <Field label="Cargo" value={editForm.role ?? ""} onChange={(value) => setEditForm({ ...editForm, role: value })} />
                  <Field label="E-mail" value={editForm.email ?? ""} onChange={(value) => setEditForm({ ...editForm, email: value })} />
                  <Field label="Área de actuação" value={editForm.sector ?? ""} onChange={(value) => setEditForm({ ...editForm, sector: value })} />
                  <div className="space-y-2 sm:col-span-2">
                    <Label>Notas</Label>
                    <Textarea
                      value={editForm.notes ?? ""}
                      onChange={(event) => setEditForm({ ...editForm, notes: event.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2 sm:col-span-2">
                    <Button variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                    <Button disabled={editSaving} onClick={saveContactChanges}>
                      {editSaving ? "A guardar..." : "Guardar alterações"}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                    {[
                      ["Nome completo", contactDetail.fullName],
                      ["Empresa", contactDetail.company],
                      ["Telefone", contactDetail.phone],
                      ["WhatsApp", contactDetail.whatsapp],
                      ["E-mail", contactDetail.email],
                      ["Cargo", contactDetail.role],
                      ["Área de actuação", contactDetail.sector],
                      ["Origem", contactDetail.source],
                      ["Notas", contactDetail.notes],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs text-muted-foreground">{label}</dt>
                        <dd className="mt-1 break-words text-sm">{value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                  {(contactDetail.leads?.length || contactDetail.feedback?.length) ? (
                    <p className="mt-5 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                      Associado a {contactDetail.leads?.length ?? 0} lead(s) e {contactDetail.feedback?.length ?? 0} feedback(s).
                    </p>
                  ) : null}
                  <div className="mt-6 flex justify-between border-t pt-5">
                    <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
                      Eliminar contacto
                    </Button>
                    <Button onClick={beginEdit}>Editar contacto</Button>
                  </div>
                </>
              )}
            </>
          ) : null}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar este contacto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acção não pode ser desfeita. A API devolve leads e feedback associados ao contacto,
              mas não documenta se estes registos também serão removidos.
              {contactDetail?.leads?.length || contactDetail?.feedback?.length
                ? ` Este contacto tem ${contactDetail.leads?.length ?? 0} lead(s) e ${contactDetail.feedback?.length ?? 0} feedback(s) associado(s).`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteSaving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSaving}
              onClick={(event) => {
                event.preventDefault();
                void confirmDeleteContact();
              }}
            >
              {deleteSaving ? "A eliminar..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Novo contacto e lead</SheetTitle>
            <SheetDescription>
              Registe um visitante interessado e associe os dados comerciais da lead.
            </SheetDescription>
          </SheetHeader>
          <div className="my-6 flex items-center">
            {[1, 2, 3].map((number) => (
              <div key={number} className="flex flex-1 items-center">
                <span
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-full text-sm",
                    number <= step
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  {number < step ? <Check /> : number}
                </span>
                {number < 3 && <span className="h-px flex-1 bg-border" />}
              </div>
            ))}
          </div>
          {step === 1 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Nome completo *" value={form.fullName} onChange={(value) => setForm({ ...form, fullName: value })} />
              <Field label="Empresa *" value={form.company} onChange={(value) => setForm({ ...form, company: value })} />
              <Field label="Telefone *" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
              <Field label="Cargo" value={form.role} onChange={(value) => setForm({ ...form, role: value })} />
              <Field label="E-mail" value={form.email} onChange={(value) => setForm({ ...form, email: value })} />
              <Field label="Área de actuação" value={form.sector} onChange={(value) => setForm({ ...form, sector: value })} />
            </div>
          )}
          {step === 2 && (
            <div>
              <Label>Que soluções despertaram interesse?</Label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {solutions.map((solution) => {
                  const selected = form.solutions.includes(solution.name);
                  return (
                    <button
                      type="button"
                      key={solution.id}
                      onClick={() =>
                        setForm({
                          ...form,
                          solutions: selected
                            ? form.solutions.filter((item) => item !== solution.name)
                            : [...form.solutions, solution.name],
                          mainSolution:
                            form.solutions.length === 0 ? solution.name : form.mainSolution,
                        })
                      }
                      className={cn(
                        "rounded-lg border p-4 text-left transition-colors hover:border-primary",
                        selected && "border-2 border-primary bg-accent",
                      )}
                    >
                      <strong>{solution.name}</strong>
                      <p className="mt-1 text-xs text-muted-foreground">{solution.subtitle}</p>
                    </button>
                  );
                })}
              </div>
              <Label className="mt-5 block">Nível de interesse</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(["Alto", "Médio", "Baixo"] as InterestLevel[]).map((interest) => (
                  <Button
                    key={interest}
                    variant={form.interest === interest ? "default" : "outline"}
                    onClick={() => setForm({ ...form, interest })}
                  >
                    {interest}
                  </Button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <Label>Necessidade identificada</Label>
                <Textarea
                  className="mt-2"
                  value={form.need}
                  onChange={(event) => setForm({ ...form, need: event.target.value })}
                  placeholder="Ex.: A empresa pretende centralizar a gestão da frota e inventário."
                />
              </div>
              <div>
                <Label>Próxima acção</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      "Agendar reunião",
                      "Enviar apresentação",
                      "Fazer demonstração",
                      "Contactar via WhatsApp",
                    ] as NextAction[]
                  ).map((nextAction) => (
                    <Button
                      key={nextAction}
                      variant={form.nextAction === nextAction ? "secondary" : "outline"}
                      onClick={() => setForm({ ...form, nextAction })}
                    >
                      {nextAction}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 flex justify-between border-t pt-5">
            <Button
              variant="outline"
              disabled={step === 1}
              onClick={() => setStep((currentStep) => currentStep - 1)}
            >
              Anterior
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={saveFullContact}>
                Guardar agora
              </Button>
              {step < 3 ? (
                <Button onClick={() => setStep((currentStep) => currentStep + 1)}>
                  Continuar
                </Button>
              ) : (
                <Button onClick={saveFullContact}>Guardar contacto</Button>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
