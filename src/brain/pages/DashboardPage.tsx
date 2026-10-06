import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays,Clock,Contact,Download,MonitorPlay,Plus,Target } from "lucide-react";
import { Bar,BarChart,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { PageTitle,KpiCard,InterestBadge,LeadStatusBadge,SolutionChip } from "../components/Common";
import { QuickCapture } from "../components/QuickCapture";
import { useBrain } from "../store/BrainStore";

export default function DashboardPage(){
  const b=useBrain(),nav=useNavigate();
  const [quick,setQuick]=useState(false),[qr,setQr]=useState(false);
  const recent=b.leads.slice(0,5);
  const getContact=(id:string)=>b.contacts.find(c=>c.id===id);
  const pending=b.followUps.filter(f=>f.status!=="Concluído");

  const exportCsv=()=>{
    const rows=[
      ["Indicador","Valor"],
      ["Contactos captados",b.contacts.length],
      ["Leads",b.leads.length],
      ["Reuniões",b.meetings.length],
      ["Follow-ups pendentes",pending.length],
      ["Demonstrações",b.leads.filter(l=>l.status==="Demonstração").length],
      ["Propostas enviadas",b.leads.filter(l=>l.status==="Proposta enviada"||l.status==="Em negociação").length],
      ["Convertidos",b.leads.filter(l=>l.status==="Convertido").length],
    ];
    const blob=new Blob([rows.map(r=>r.join(",")).join("\n")],{type:"text/csv"});
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="resumo-hub-summit.csv";a.click();
  };

  const demoCount=b.leads.filter(l=>l.status==="Demonstração").length;
  const proposalCount=b.leads.filter(l=>l.status==="Proposta enviada"||l.status==="Em negociação").length;
  const convertedCount=b.leads.filter(l=>l.status==="Convertido").length;

  return <>
    <PageTitle title="Eventos MwangoBrain 2026" subtitle="Acompanhe contactos, interesses e oportunidades geradas durante a participação da Mwango Brain." actions={<>
      <Button onClick={()=>setQuick(true)}><Plus/> Registar contacto</Button>
      <Button variant="outline" onClick={()=>setQr(true)}>Mostrar QR Code</Button>
      <Button variant="outline" onClick={exportCsv}><Download/> Exportar relatório</Button>
    </>}/>

    {/* KPIs — todos reais */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard label="Contactos captados" value={b.contacts.length} icon={Contact}/>
      <KpiCard label="Interesse alto" value={b.leads.filter(l=>l.interest==="Alto").length} icon={Target}/>
      <KpiCard label="Demonstrações" value={demoCount} icon={MonitorPlay}/>
      <KpiCard label="Reuniões" value={b.meetings.length} icon={CalendarDays}/>
      <KpiCard label="Follow-ups pendentes" value={pending.length} icon={Clock} change={`${pending.filter(f=>f.status==="Atrasado").length} atrasados`} tone="critical"/>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
      {/* Interesse nas soluções */}
      <section className="surface">
        <div className="section-head"><h2>Interesse nas soluções</h2><p>Preferências registadas no stand e através do QR Code.</p></div>
        <div className="h-[280px] p-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={b.solutions.map(s=>({name:s.name,value:b.leads.filter(l=>l.solutions.includes(s.name)).length}))} margin={{left:20,right:25}}>
              <XAxis type="number" hide/>
              <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={112} fontSize={12}/>
              <Tooltip cursor={{fill:"hsl(var(--muted))"}} contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/>
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0,4,4,0]} label={{position:"right",fill:"hsl(var(--muted-foreground))",fontSize:12}}/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Funil comercial — dados reais */}
      <section className="surface">
        <div className="section-head"><h2>Funil comercial</h2><p>Conversão desde o contacto até à proposta.</p></div>
        <div className="space-y-4 p-6">
          {[
            ["Contactos",b.contacts.length],
            ["Leads",b.leads.length],
            ["Demonstrações",demoCount],
            ["Reuniões",b.meetings.length],
            ["Propostas",proposalCount],
            ["Convertidos",convertedCount],
          ].map(([label,value],i)=>{
            const max=Math.max(b.contacts.length,1);
            return <div key={String(label)}>
              <div className="mb-1 flex justify-between text-xs"><span className="font-medium">{label}</span><span className="tabular-nums text-muted-foreground">{value}</span></div>
              <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{width:`${Number(value)/max*100}%`,opacity:.55+i*.09}}/></div>
            </div>;
          })}
        </div>
      </section>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_0.7fr]">
      {/* Leads recentes */}
      <section className="surface overflow-hidden">
        <div className="section-head"><h2>Leads recentes</h2><p>Últimos contactos com potencial comercial.</p></div>
        <div className="divide-y">
          {recent.length===0&&<p className="p-6 text-sm text-muted-foreground">Sem leads registados ainda.</p>}
          {recent.map(l=>{
            const c=getContact(l.contactId);
            return <button key={l.id} onClick={()=>nav(`/leads/${l.id}`)} className="grid w-full grid-cols-[1fr_auto] items-center gap-4 p-4 text-left hover:bg-muted sm:grid-cols-[1.1fr_1fr_auto_auto]">
              <span><strong className="block text-sm">{c?.fullName}</strong><small className="text-muted-foreground">{c?.company}</small></span>
              <span className="hidden sm:block"><SolutionChip value={l.mainSolution}/></span>
              <InterestBadge value={l.interest}/>
              <span className="hidden sm:block"><LeadStatusBadge value={l.status}/></span>
            </button>;
          })}
        </div>
      </section>

      <div className="space-y-6">
        {/* Follow-ups de hoje */}
        <section className="surface">
          <div className="section-head"><h2>Follow-ups de hoje</h2></div>
          <div className="space-y-3 p-4">
            {pending.length===0&&<p className="text-sm text-muted-foreground">Sem follow-ups pendentes.</p>}
            {pending.slice(0,4).map(f=>{
              const l=b.leads.find(x=>x.id===f.leadId),c=getContact(l?.contactId??"");
              return <label key={f.id} className="flex items-start gap-3 rounded-md p-2 hover:bg-muted">
                <Checkbox onCheckedChange={checked=>{if(checked===true)b.completeFollowUp(f.id).then(()=>toast.success("Follow-up concluído")).catch(err=>toast.error(err instanceof Error?err.message:"Erro ao concluir follow-up"))}}/>
                <span><strong className="block text-sm">{c?.fullName}</strong><small className="text-muted-foreground">{f.action}</small></span>
              </label>;
            })}
          </div>
        </section>

        {/* Próximas reuniões */}
        <section className="surface">
          <div className="section-head"><h2>Próximas reuniões</h2></div>
          <div className="space-y-3 p-4">
            {b.meetings.length===0&&<p className="text-sm text-muted-foreground">Sem reuniões agendadas.</p>}
            {b.meetings.slice(0,3).map(m=>{
              const l=b.leads.find(x=>x.id===m.leadId),c=getContact(l?.contactId??"");
              return <div key={m.id} className="border-l-[3px] border-primary pl-3">
                <strong className="text-sm">{c?.fullName}</strong>
                <p className="text-xs text-muted-foreground">{m.type} · {new Date(m.start).toLocaleDateString("pt-PT",{day:"2-digit",month:"short"})}</p>
              </div>;
            })}
          </div>
        </section>
      </div>
    </div>

    <QuickCapture open={quick} onOpenChange={setQuick}/>
    <Dialog open={qr} onOpenChange={setQr}>
      <DialogContent className="max-w-sm text-center">
        <DialogHeader>
          <DialogTitle>QR Code público</DialogTitle>
          <DialogDescription>Os visitantes podem conhecer as soluções e deixar o seu contacto.</DialogDescription>
        </DialogHeader>
        <div className="mx-auto rounded-lg border bg-card p-5"><QRCodeSVG value={`${window.location.origin}/p/conheca`} size={220}/></div>
        <p className="text-xs text-muted-foreground">{window.location.origin}/p/conheca</p>
      </DialogContent>
    </Dialog>
  </>;
}
