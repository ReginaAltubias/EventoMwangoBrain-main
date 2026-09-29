import { CalendarDays,Clock,Contact,Handshake,Star,Target } from "lucide-react";
import { Area,AreaChart,Bar,BarChart,CartesianGrid,ResponsiveContainer,Tooltip,XAxis,YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { KpiCard,PageTitle } from "../components/Common";
import { useBrain } from "../store/BrainStore";

export default function ExecutivePage(){
  const b=useBrain();

  // KPIs calculados directamente dos dados reais
  const totalContacts=b.contacts.length;
  const highInterest=b.leads.filter(l=>l.interest==="Alto").length;
  const totalMeetings=b.meetings.length;
  const pendingFollowUps=b.followUps.filter(f=>f.status!=="Concluído").length;
  const pipeline=b.leads.reduce((sum,l)=>sum+(l.estimatedValue??0),0);

  // Satisfação média real calculada do feedback
  const avgSatisfaction=b.feedback.length
    ? (b.feedback.reduce((s,f)=>s+f.overall,0)/b.feedback.length).toFixed(1)
    : "—";

  // Contactos por dia — agrupados pela data de createdAt real
  const contactsByDay=Object.entries(
    b.contacts.reduce<Record<string,number>>((acc,c)=>{
      const d=new Date(c.createdAt).toLocaleDateString("pt-PT",{day:"2-digit",month:"short"});
      acc[d]=(acc[d]??0)+1;
      return acc;
    },{})
  )
  .map(([d,v])=>({d,v}))
  .slice(-7); // últimos 7 dias com dados

  // Funil de conversão comercial — contagens reais dos leads por estado
  const funnelData=[
    {n:"Demonstrações",v:b.leads.filter(l=>l.status==="Demonstração").length},
    {n:"Reuniões",v:b.meetings.length},
    {n:"Propostas",v:b.leads.filter(l=>l.status==="Proposta enviada"||l.status==="Em negociação").length},
    {n:"Convertidos",v:b.leads.filter(l=>l.status==="Convertido").length},
  ].filter(x=>x.v>0);

  const priorityLeads=b.leads.filter(l=>l.interest==="Alto").slice(0,5);

  return <>
    <PageTitle title="Dashboard executivo" subtitle="A participação da Mwango Brain em tempo real." actions={<Button variant="outline" onClick={()=>window.print()}>Imprimir / PDF</Button>}/>

    {/* KPIs */}
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <KpiCard label="Contactos captados" value={totalContacts} icon={Contact}/>
      <KpiCard label="Interesse alto" value={highInterest} icon={Target}/>
      <KpiCard label="Reuniões agendadas" value={totalMeetings} icon={CalendarDays}/>
      <KpiCard label="Follow-ups pendentes" value={pendingFollowUps} icon={Clock}/>
      <KpiCard label="Pipeline estimado" value={pipeline>0?`${Math.round(pipeline/1000000)} M Kz`:"Sem valor"} icon={Handshake}/>
      <KpiCard label="Satisfação média" value={b.feedback.length?`${avgSatisfaction} / 5`:"Sem dados"} icon={Star}/>
    </div>

    {/* Gráficos */}
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <section className="surface p-5">
        <h2 className="section-title">Contactos por dia</h2>
        {contactsByDay.length===0
          ? <p className="mt-8 text-center text-sm text-muted-foreground">Sem dados ainda</p>
          : <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={contactsByDay}>
                  <defs>
                    <linearGradient id="exec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor="hsl(var(--primary))" stopOpacity=".25"/>
                      <stop offset="1" stopColor="hsl(var(--primary))" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="hsl(var(--border))"/>
                  <XAxis dataKey="d" axisLine={false} tickLine={false} fontSize={12}/>
                  <YAxis hide allowDecimals={false}/>
                  <Tooltip contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/>
                  <Area dataKey="v" stroke="hsl(var(--primary))" fill="url(#exec)" strokeWidth={2}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
        }
      </section>

      <section className="surface p-5">
        <h2 className="section-title">Conversão comercial</h2>
        {funnelData.length===0
          ? <p className="mt-8 text-center text-sm text-muted-foreground">Sem dados ainda</p>
          : <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={funnelData}>
                  <XAxis dataKey="n" axisLine={false} tickLine={false} fontSize={12}/>
                  <YAxis hide allowDecimals={false}/>
                  <Tooltip cursor={{fill:"hsl(var(--muted))"}} contentStyle={{background:"hsl(var(--popover))",border:"1px solid hsl(var(--border))",borderRadius:8,fontSize:12}}/>
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[5,5,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
        }
      </section>
    </div>

    {/* Leads prioritários */}
    <section className="surface mt-6 p-6">
      <h2 className="section-title">Leads prioritários</h2>
      {priorityLeads.length===0
        ? <p className="mt-4 text-sm text-muted-foreground">Nenhum lead de interesse alto registado ainda.</p>
        : <div className="mt-4 grid gap-3 md:grid-cols-5">
            {priorityLeads.map(l=>{
              const c=b.contacts.find(x=>x.id===l.contactId);
              return <div key={l.id} className="rounded-lg border p-4">
                <strong className="text-sm">{c?.fullName}</strong>
                <p className="mt-1 text-xs text-muted-foreground">{c?.company}</p>
                <p className="mt-3 text-xs font-semibold text-primary">{l.mainSolution}</p>
              </div>;
            })}
          </div>
      }
    </section>
  </>;
}
