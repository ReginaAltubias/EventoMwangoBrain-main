import { useEffect, useState } from "react";
import { Download,MessageSquareQuote,Plus,Star,Trash2 } from "lucide-react";
import { Bar,BarChart,PolarAngleAxis,PolarGrid,Radar,RadarChart,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { toast } from "sonner";
import { AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { KpiCard,PageTitle } from "../components/Common";
import { useBrain } from "../store/BrainStore";
import type { VisitorFeedback } from "../types";
function Stars({value,onChange}:{value:number;onChange?:(v:number)=>void}){return <div className="flex gap-1" aria-label={`${value} de 5 estrelas`}>{[1,2,3,4,5].map(n=><button type="button" key={n} disabled={!onChange} onClick={()=>onChange?.(n)} className="disabled:opacity-100"><Star className={n<=value?"h-6 w-6 fill-primary text-primary":"h-6 w-6 text-border"}/></button>)}</div>}
export function FeedbackPage(){
 const b=useBrain();
 const [open,setOpen]=useState(false);
 const [ratings,setRatings]=useState<{overall:VisitorFeedback["overall"]|null;team:number|null;presentation:number|null;relevance:number|null}>({overall:null,team:null,presentation:null,relevance:null});
 const [comment,setComment]=useState("");
 const [saving,setSaving]=useState(false);
 const distribution=[1,2,3,4,5].map(n=>({rating:`${n} estrelas`,count:b.feedback.filter(f=>f.overall===n).length}));
 const metrics=[
  {label:"Satisfação média",field:"overall"},
  {label:"Experiência com a equipa",field:"team"},
  {label:"Qualidade das apresentações",field:"presentation"},
  {label:"Relevância das soluções",field:"relevance"},
 ] as const;
 const average=(field:"overall"|"team"|"presentation"|"relevance")=>{
  if(!b.feedback.length)return null;
  return b.feedback.reduce((sum,item)=>sum+item[field],0)/b.feedback.length;
 };
 const save=async()=>{
  if(ratings.overall===null||ratings.team===null||ratings.presentation===null||ratings.relevance===null){
   toast.error("Classifique todos os critérios antes de guardar");
   return;
  }
  setSaving(true);
  try{
   await b.addFeedback({...ratings,highlights:[],wantsContact:false,comment:comment.trim()||undefined});
   setOpen(false);
   setComment("");
   setRatings({overall:null,team:null,presentation:null,relevance:null});
   toast.success("Feedback registado");
  }catch(err){
   toast.error(err instanceof Error?err.message:"Erro ao registar feedback");
  }finally{
   setSaving(false);
  }
 };
 return <>
  <PageTitle title="Feedback do Summit" subtitle="Como foi a experiência com a Mwango Brain?" actions={<Button onClick={()=>setOpen(true)}><Plus/> Registar feedback</Button>}/>
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
   {metrics.map(({label,field})=>{
    const value=average(field);
    return <article key={field} className="surface p-5">
     <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
     <p className="mt-3 text-2xl font-semibold">{value===null?"Sem dados":`${value.toFixed(1).replace(".",",")} / 5`}</p>
     {value!==null&&<Stars value={Math.round(value)}/>}
    </article>
   })}
  </div>
  <div className="mt-6 grid gap-6 lg:grid-cols-2">
   <section className="surface p-5">
    <h2 className="section-title">Distribuição das avaliações</h2>
    <div className="h-72"><ResponsiveContainer><BarChart data={distribution}><XAxis dataKey="rating" axisLine={false} tickLine={false} fontSize={12}/><YAxis hide/><Tooltip cursor={{fill:"hsl(var(--muted))"}} contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/><Bar dataKey="count" fill="hsl(var(--primary))" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>
   </section>
   <section className="surface">
    <div className="section-head"><h2>Comentários recentes</h2></div>
    <div className="divide-y">
     {b.feedback.filter(item=>item.comment?.trim()).slice(0,6).map(item=><div className="p-4" key={item.id}><div className="flex items-center gap-2"><MessageSquareQuote className="h-4 w-4 text-primary"/><Stars value={item.overall}/></div><p className="mt-2 text-sm text-muted-foreground">{item.comment}</p></div>)}
     {!b.feedback.some(item=>item.comment?.trim())&&<p className="p-4 text-sm text-muted-foreground">Ainda não existem comentários.</p>}
    </div>
   </section>
  </div>
  <Dialog open={open} onOpenChange={value=>!saving&&setOpen(value)}>
   <DialogContent>
    <DialogHeader><DialogTitle>Registar feedback</DialogTitle><DialogDescription>Avalie a experiência com a equipa e as soluções.</DialogDescription></DialogHeader>
    {metrics.map(({label,field})=><div key={field} className="space-y-2"><Label>{label}</Label><Stars value={ratings[field]??0} onChange={value=>setRatings(previous=>({...previous,[field]:value}))}/></div>)}
    <Label htmlFor="feedback-comment">Comentário</Label>
    <Textarea id="feedback-comment" value={comment} onChange={event=>setComment(event.target.value)} placeholder="O que mais chamou a sua atenção?"/>
    <Button className="h-12" onClick={save} disabled={saving||Object.values(ratings).some(value=>value===null)}>{saving?"A guardar…":"Guardar feedback"}</Button>
   </DialogContent>
  </Dialog>
 </>;
}
export function ParticipationPage(){const b=useBrain(),[evaluation,setEvaluation]=useState(b.evaluation);useEffect(()=>{setEvaluation(b.evaluation)},[b.evaluation]);const radar=Object.entries(evaluation.scores).map(([subject,value])=>({subject,value}));const save=()=>{b.updateEvaluation(evaluation).then(()=>toast.success("Avaliação guardada")).catch(err=>toast.error(err instanceof Error?err.message:"Erro ao guardar avaliação"))};return <><PageTitle title="Avaliação da participação" subtitle="Reflexão da equipa sobre a presença da Mwango Brain no Summit." actions={<span className="text-xs text-muted-foreground">{b.evaluation.savedAt?"Guardado recentemente":"Alterações guardadas localmente"}</span>}/><div className="grid gap-6 lg:grid-cols-[.9fr_1.1fr]"><section className="surface p-5"><h2 className="section-title">Pontuação geral</h2><div className="h-[360px]"><ResponsiveContainer><RadarChart data={radar}><PolarGrid stroke="hsl(var(--border))"/><PolarAngleAxis dataKey="subject" fontSize={11} stroke="hsl(var(--muted-foreground))"/><Radar dataKey="value" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={.15} strokeWidth={2}/><Tooltip contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/></RadarChart></ResponsiveContainer></div></section><section className="surface p-5"><h2 className="section-title">Critérios</h2><div className="mt-5 space-y-4">{Object.entries(evaluation.scores).map(([key,value])=><div key={key} className="flex flex-col justify-between gap-2 border-b pb-3 sm:flex-row sm:items-center"><span className="text-sm">{key}</span><Stars value={value} onChange={v=>setEvaluation({...evaluation,scores:{...evaluation.scores,[key]:v}})}/></div>)}</div></section></div><section className="surface mt-6 grid gap-5 p-6 md:grid-cols-2">{[["O que funcionou bem?","wentWell"],["Principais dificuldades","difficulties"],["Principais necessidades identificadas","mainNeeds"],["O que devemos melhorar?","improvements"]].map(([label,key])=><div key={key}><Label>{label}</Label><Textarea className="mt-2 min-h-28" value={String(evaluation[key as keyof typeof evaluation]??"")} onChange={e=>setEvaluation({...evaluation,[key]:e.target.value})}/></div>)}<div className="md:col-span-2 flex justify-end"><Button onClick={save}>Guardar avaliação</Button></div></section></>}
export function ReportsPage(){
 const b=useBrain();
 const cards=["Resumo da participação","Leads por solução","Leads por sector","Leads por nível de interesse","Follow-ups","Reuniões","Feedback","Oportunidades comerciais"];
 const [active,setActive]=useState<string|null>(null);
 const rows=(()=>{
  if(!active)return [];
  if(active==="Leads por solução"){
   return b.solutions.map(solution=>({name:solution.name,value:b.leads.filter(lead=>lead.mainSolution===solution.name||lead.solutions.includes(solution.name)).length})).filter(row=>row.value>0);
  }
  if(active==="Leads por sector"){
   const counts=new Map<string,number>();
   b.leads.forEach(lead=>{
    const sector=b.contacts.find(contact=>contact.id===lead.contactId)?.sector?.trim()||"Sem sector";
    counts.set(sector,(counts.get(sector)??0)+1);
   });
   return Array.from(counts,([name,value])=>({name,value}));
  }
  if(active==="Leads por nível de interesse"){
   const counts=new Map<string,number>();
   b.leads.forEach(lead=>counts.set(lead.interest,(counts.get(lead.interest)??0)+1));
   return Array.from(counts,([name,value])=>({name,value}));
  }
  if(active==="Follow-ups"){
   const counts=new Map<string,number>();
   b.followUps.forEach(item=>counts.set(item.status,(counts.get(item.status)??0)+1));
   return Array.from(counts,([name,value])=>({name,value}));
  }
  if(active==="Reuniões"){
   const counts=new Map<string,number>();
   b.meetings.forEach(item=>counts.set(item.type,(counts.get(item.type)??0)+1));
   return Array.from(counts,([name,value])=>({name,value}));
  }
  if(active==="Feedback"){
   const counts=new Map<string,number>();
   b.feedback.forEach(item=>counts.set(`${item.overall} estrelas`,(counts.get(`${item.overall} estrelas`)??0)+1));
   return Array.from(counts,([name,value])=>({name,value})).sort((a,c)=>Number(a.name[0])-Number(c.name[0]));
  }
  if(active==="Oportunidades comerciais"){
   const opportunityStatuses=new Set(["Qualificado","Demonstração","Reunião","Proposta enviada","Em negociação","Convertido"]);
   const values=new Map<string,number>();
   b.leads.filter(lead=>opportunityStatuses.has(lead.status)).forEach(lead=>{
    values.set(lead.status,(values.get(lead.status)??0)+(lead.estimatedValue??0));
   });
   return Array.from(values,([name,value])=>({name,value}));
  }
  const counts=new Map<string,number>();
  b.leads.forEach(lead=>counts.set(lead.status,(counts.get(lead.status)??0)+1));
  return Array.from(counts,([name,value])=>({name,value}));
 })();
 const monetary=active==="Oportunidades comerciais";
 const exportCsv=()=>{
  const escape=(value:string|number)=>`"${String(value).replace(/"/g,'""')}"`;
  const csv=[["Categoria",monetary?"Valor estimado (Kz)":"Quantidade"],...rows.map(row=>[row.name,row.value])]
   .map(line=>line.map(escape).join(",")).join("\r\n");
  const url=URL.createObjectURL(new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"}));
  const link=document.createElement("a");
  link.href=url;
  link.download="relatorio-mwango-brain.csv";
  link.click();
  URL.revokeObjectURL(url);
 };
 return <>
  <PageTitle title="Relatórios" subtitle="Relatórios calculados a partir dos dados carregados da API remota."/>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{cards.map(card=><button key={card} onClick={()=>setActive(card)} className="surface p-5 text-left transition-colors hover:border-primary"><span className="grid h-10 w-10 place-items-center rounded-lg bg-muted"><Download className="h-5 w-5"/></span><h2 className="mt-5 font-semibold">{card}</h2><p className="mt-2 text-xs text-muted-foreground">Ver e exportar dados disponíveis na API.</p></button>)}</div>
  <Dialog open={!!active} onOpenChange={open=>!open&&setActive(null)}>
   <DialogContent className="max-w-3xl">
    <DialogHeader><DialogTitle>{active}</DialogTitle><DialogDescription>Valores calculados com os registos actualmente recebidos da API remota.</DialogDescription></DialogHeader>
    {rows.length===0?<p className="py-16 text-center text-sm text-muted-foreground">Não existem dados para este relatório.</p>:<div className="h-64 rounded-lg bg-muted p-4"><ResponsiveContainer><BarChart data={rows}><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12}/><YAxis hide/><Tooltip cursor={{fill:"hsl(var(--muted))"}} formatter={value=>[Number(value).toLocaleString("pt-PT"),monetary?"Valor estimado (Kz)":"Quantidade"]} contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/><Bar dataKey="value" fill="hsl(var(--primary))" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></div>}
    <div className="flex justify-end gap-2"><Button variant="outline" onClick={()=>window.print()}>Imprimir / PDF</Button><Button onClick={exportCsv} disabled={rows.length===0}>Exportar CSV</Button></div>
   </DialogContent>
  </Dialog>
 </>;
}
export function UsersPage(){
 const b=useBrain();
 const [remove,setRemove]=useState<{id:string|number;name:string}|null>(null);
 const [deleting,setDeleting]=useState(false);
 const deleteUser=async()=>{
  if(!remove)return;
  setDeleting(true);
  try{
   await b.deleteUser(remove.id);
   toast.success("Utilizador eliminado");
   setRemove(null);
  }catch(err){
   toast.error(err instanceof Error?err.message:"Erro ao eliminar utilizador");
  }finally{
   setDeleting(false);
  }
 };
 return <>
  <PageTitle title="Utilizadores" subtitle="Contas disponibilizadas pela API remota."/>
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
   {b.loading?<div className="surface p-8 text-center text-muted-foreground">A carregar utilizadores…</div>:b.users.length===0?<div className="surface p-8 text-center text-muted-foreground">Nenhum utilizador encontrado.</div>:b.users.map(user=><article key={user.id} className="surface flex items-start justify-between gap-4 p-5">
    <div className="min-w-0"><h2 className="truncate font-semibold">{user.name}</h2><p className="mt-1 truncate text-sm text-muted-foreground">{user.email}</p></div>
    <Button type="button" variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" aria-label={`Eliminar ${user.name}`} onClick={()=>setRemove({id:user.id,name:user.name})}><Trash2 className="h-4 w-4"/></Button>
   </article>)}
  </div>
  <AlertDialog open={!!remove} onOpenChange={open=>!open&&!deleting&&setRemove(null)}>
   <AlertDialogContent>
    <AlertDialogHeader>
     <AlertDialogTitle>Eliminar utilizador?</AlertDialogTitle>
     <AlertDialogDescription>Esta acção irá eliminar a conta de {remove?.name} ({remove?.id}) pela API remota e não pode ser anulada.</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
     <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
     <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={deleting} onClick={event=>{event.preventDefault();void deleteUser()}}>{deleting?"A eliminar…":"Eliminar utilizador"}</AlertDialogAction>
    </AlertDialogFooter>
   </AlertDialogContent>
  </AlertDialog>
 </>;
}
export function SettingsPage(){return <><PageTitle title="Configurações" subtitle="Preferências do evento e da aplicação."/><section className="surface max-w-3xl p-6"><h2 className="section-title">Configurações do evento</h2><p className="mt-3 text-sm text-muted-foreground">A API remota ainda não disponibiliza endpoints para consultar ou guardar estas configurações.</p></section></>}
