import { useState, type ComponentType } from "react";
import { Building2,CheckCheck,Code2,Ellipsis,Package,Plus,Sparkles,Sprout,Trees } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogDescription,DialogFooter,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageTitle,SolutionChip } from "../components/Common";
import { useBrain } from "../store/BrainStore";
import type { SolutionItem } from "../types";
const icons:Record<string,ComponentType<{className?:string}>>={RIVO:Building2,SIGAFLO:Trees,SIGIA:Sprout,DONE:CheckCheck,Talkgenie:Sparkles,"Solução à medida":Code2};
export function SolutionsPage(){const b=useBrain();const [open,setOpen]=useState(false);const [editing,setEditing]=useState<SolutionItem|null>(null);const [form,setForm]=useState({name:"",subtitle:""});const [remove,setRemove]=useState<SolutionItem|null>(null);const startCreate=()=>{setEditing(null);setForm({name:"",subtitle:""});setOpen(true)};const startEdit=(s:SolutionItem)=>{setEditing(s);setForm({name:s.name,subtitle:s.subtitle});setOpen(true)};const save=async()=>{if(!form.name.trim()){toast.error("Indique o nome da solução");return}try{if(editing){await b.updateSolution(editing.id,{name:form.name.trim(),subtitle:form.subtitle.trim()});toast.success("Solução actualizada")}else{await b.addSolution({name:form.name.trim(),subtitle:form.subtitle.trim()});toast.success("Solução adicionada")}setOpen(false)}catch(err){toast.error(err instanceof Error?err.message:"Erro ao guardar solução")}};return <><PageTitle title="Soluções" subtitle="Catálogo Mwango Brain e interesse gerado no evento." actions={<Button onClick={startCreate}><Plus/> Nova solução</Button>}/><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{b.solutions.map(s=>{const Icon=icons[s.name]??Package,count=b.leads.filter(l=>l.solutions.includes(s.name)).length;return <article key={s.id} className="surface p-6 transition-colors hover:border-primary"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-lg bg-muted"><Icon className="h-5 w-5"/></span><DropdownMenu><DropdownMenuTrigger asChild><Button size="icon" variant="ghost" aria-label="Acções"><Ellipsis/></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={()=>startEdit(s)}>Editar</DropdownMenuItem><DropdownMenuItem className="text-destructive focus:text-destructive" onClick={()=>setRemove(s)}>Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></div><h2 className="mt-5 text-lg font-semibold">{s.name}</h2><p className="mt-2 min-h-10 text-sm text-muted-foreground">{s.subtitle}</p><div className="mt-6 border-t pt-4"><strong className="text-2xl tabular-nums text-primary">{count}</strong><span className="ml-2 text-xs text-muted-foreground">interessados registados</span></div></article>})}</div><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>{editing?"Editar solução":"Nova solução"}</DialogTitle><DialogDescription>{editing?"Actualize o nome e a descrição da solução.":"Adicione uma nova solução ao catálogo Mwango Brain."}</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>Nome *</Label><Input value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div><div className="space-y-2"><Label>Descrição</Label><Input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})}/></div></div><DialogFooter><Button variant="outline" onClick={()=>setOpen(false)}>Cancelar</Button><Button onClick={save}>Guardar</Button></DialogFooter></DialogContent></Dialog><AlertDialog open={!!remove} onOpenChange={v=>!v&&setRemove(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Eliminar solução</AlertDialogTitle><AlertDialogDescription>Tem a certeza que pretende eliminar "{remove?.name}"? Os leads já registados mantêm a referência, mas deixa de estar disponível para novos registos.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={()=>{if(remove){b.deleteSolution(remove.id).then(()=>toast.success("Solução eliminada")).catch(err=>toast.error(err instanceof Error?err.message:"Erro ao eliminar solução"))}setRemove(null)}}>Eliminar</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></>}
export function InteractionsPage(){
 const b=useBrain();
 const [open,setOpen]=useState(false);
 const [leadId,setLeadId]=useState("");
 const [type,setType]=useState<"Nota"|"Chamada"|"WhatsApp"|"E-mail"|"Demonstração"|"Reunião"|"Estado alterado">("Nota");
 const [description,setDescription]=useState("");
 const [saving,setSaving]=useState(false);
 const startCreate=()=>{setLeadId("");setType("Nota");setDescription("");setOpen(true)};
 const save=async()=>{
  if(!leadId){toast.error("Seleccione a lead associada");return}
  if(!description.trim()){toast.error("Indique a descrição da interacção");return}
  setSaving(true);
  try{
   await b.createInteraction({leadId,type,description:description.trim()});
   toast.success("Interacção registada");
   setOpen(false);
  }catch(err){
   toast.error(err instanceof Error?err.message:"Erro ao registar interacção");
  }finally{
   setSaving(false);
  }
 };
 return <>
  <PageTitle title="Interacções" subtitle="Registo cronológico de toda a actividade comercial." actions={<Button onClick={startCreate} disabled={!b.leads.length}><Plus/> Nova interacção</Button>}/>
  <div className="surface divide-y">
   {[...b.interactions].sort((a,z)=>z.date.localeCompare(a.date)).slice(0,30).map(i=>{
    const lead=b.leads.find(x=>x.id===i.leadId),contact=b.contacts.find(x=>x.id===lead?.contactId);
    return <div key={i.id} className="flex gap-4 p-4">
     <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary"/>
     <div className="flex-1">
      <div className="flex flex-wrap items-center gap-2">
       <strong className="text-sm">{contact?.fullName??`Lead ${i.leadId}`}</strong>
       {lead&&<SolutionChip value={lead.mainSolution}/>}
       <span className="text-xs text-muted-foreground">{i.type}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{i.description}</p>
     </div>
     <time className="text-xs tabular-nums text-muted-foreground">{new Date(i.date).toLocaleDateString("pt-PT",{day:"2-digit",month:"short"})}</time>
    </div>
   })}
   {!b.interactions.length&&<p className="p-6 text-sm text-muted-foreground">Ainda não existem interacções registadas.</p>}
  </div>
  <Dialog open={open} onOpenChange={setOpen}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>Nova interacção</DialogTitle>
     <DialogDescription>Associe o registo a uma lead e descreva a actividade comercial.</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
     <div className="space-y-2">
      <Label htmlFor="interaction-lead">Lead *</Label>
      <select id="interaction-lead" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={leadId} onChange={event=>setLeadId(event.target.value)}>
       <option value="">Seleccione uma lead</option>
       {b.leads.map(lead=>{
        const contact=b.contacts.find(item=>item.id===lead.contactId);
        return <option key={lead.id} value={lead.id}>{contact?.fullName??lead.id} — {lead.mainSolution}</option>
       })}
      </select>
     </div>
     <div className="space-y-2">
      <Label htmlFor="interaction-type">Tipo *</Label>
      <select id="interaction-type" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={type} onChange={event=>setType(event.target.value as typeof type)}>
       {["Nota","Chamada","WhatsApp","E-mail","Demonstração","Reunião","Estado alterado"].map(value=><option key={value} value={value}>{value}</option>)}
      </select>
     </div>
     <div className="space-y-2">
      <Label htmlFor="interaction-description">Descrição *</Label>
      <Textarea id="interaction-description" value={description} onChange={event=>setDescription(event.target.value)} rows={4}/>
     </div>
    </div>
    <DialogFooter>
     <Button variant="outline" onClick={()=>setOpen(false)} disabled={saving}>Cancelar</Button>
     <Button onClick={save} disabled={saving}>{saving?"A guardar…":"Guardar interacção"}</Button>
    </DialogFooter>
   </DialogContent>
  </Dialog>
 </>;
}
