import { useState } from "react";
import { ArrowLeft,ArrowRight,Building2,Check,CheckCheck,Code2,ExternalLink,Package,Sparkles,Sprout,Trees } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { BrainBrand } from "../components/Brand";
import { useBrain } from "../store/BrainStore";
import type { Solution } from "../types";

const icons:Record<string,typeof Building2>={RIVO:Building2,SIGAFLO:Trees,SIGIA:Sprout,DONE:CheckCheck,Talkgenie:Sparkles,"Solução à medida":Code2};
const labels={fullName:"Nome",company:"Empresa",role:"Cargo",whatsapp:"WhatsApp",email:"E-mail"} as const;
type Field=keyof typeof labels;
const steps=["Interesse","Os seus dados","Próximo passo"];

export default function PublicPage(){
  const b=useBrain();
  const [step,setStep]=useState(0),[done,setDone]=useState(false),[consent,setConsent]=useState(false);
  const [selected,setSelected]=useState<Solution[]>([]);
  const [demo,setDemo]=useState<boolean|null>(null);
  const [notes,setNotes]=useState("");
  const [form,setForm]=useState<Record<Field,string>>({fullName:"",company:"",role:"",whatsapp:"",email:""});
  const toggle=(s:Solution)=>setSelected(p=>p.includes(s)?p.filter(x=>x!==s):[...p,s]);
  const emailOk=!form.email||/^\S+@\S+\.\S+$/.test(form.email);
  const canNext=[selected.length>0,form.fullName.trim()&&form.company.trim()&&(form.whatsapp.trim()||form.email.trim())&&emailOk,demo!==null&&consent][step];
  const [submitting,setSubmitting]=useState(false);

  const submit=()=>{
    setSubmitting(true);
    b.createQrContact({
      fullName:form.fullName.trim().slice(0,100),
      company:form.company.trim().slice(0,100),
      role:form.role.trim().slice(0,80)||undefined,
      whatsapp:form.whatsapp.trim().slice(0,20)||undefined,
      email:form.email.trim().slice(0,255)||undefined,
      solution:selected[0],
      solutions:selected,
      wantsDemo:!!demo,
      notes:notes.trim().slice(0,500)||undefined,
    }).then(()=>setDone(true)).catch(err=>{
      toast.error(err instanceof Error?err.message:"Erro ao enviar. Tente novamente.");
      setSubmitting(false);
    });
  };

  if(done)return <div className="grid min-h-screen lg:grid-cols-2">
  <section className="login-pattern bg-black relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-accent-foreground lg:flex">
    <BrainBrand/>
    <div className="max-w-lg">
      <span className="mb-6 block h-[3px] w-16 bg-sidebar-primary"/>
      <p className="text-sm font-medium uppercase text-sidebar-foreground/50">Angola Hub Summit 2026</p>
      <h1 className="mt-4 text-5xl font-semibold leading-tight">Transforme contactos em oportunidades.</h1>
      <p className="mt-5 text-xl text-sidebar-foreground">Let's Brain together.</p>
    </div>
    <p className="text-xs text-sidebar-foreground/40">Mwango Brain · Creative &amp; Technology Agency</p>
  </section>
  <section className="flex items-center justify-center bg-card p-6">
    <div className="w-full max-w-sm text-center">
      <div className="mb-10 lg:hidden"><BrainBrand/></div>
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success-soft text-success"><CheckCheck/></span>
      <h1 className="mt-6 text-3xl font-semibold">Obrigado por visitar a Mwango Brain.</h1>
      <p className="mt-3 text-muted-foreground">{demo?"A nossa equipa vai contactá-lo para marcar a apresentação ou demonstração.":"A nossa equipa entrará em contacto consigo."}</p>
      {form.email&&<p className="mt-3 text-sm text-muted-foreground">Enviámos uma confirmação para <strong>{form.email}</strong>.</p>}
      {form.whatsapp&&<p className="mt-2 text-sm text-muted-foreground">Também enviámos uma mensagem para <strong>{form.whatsapp}</strong>.</p>}
      <Button asChild size="lg" className="mt-8 w-full">
        <a href="https://mwangobrain.com/" target="_blank" rel="noopener noreferrer">Visitar site oficial<ExternalLink/></a>
      </Button>
    </div>
  </section>
</div>;

  return <div className="min-h-screen bg-background">
    <header className="bg-sidebar px-5 py-4"><div className="mx-auto max-w-2xl"><BrainBrand/></div></header>
    <main className="public-pattern mx-auto max-w-2xl px-5 py-8">
      <p className="text-xs font-medium uppercase tracking-wide text-primary">Angola Hub Summit 2026</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Conheça as soluções da Mwango Brain</h1>
      <ol className="mt-6 flex gap-2" aria-label="Passos">{steps.map((s,i)=><li key={s} className="flex-1"><div className={cn("h-1 rounded-full",i<=step?"bg-primary":"bg-border")}/><span className={cn("mt-2 block text-xs",i===step?"font-medium text-foreground":"text-muted-foreground")}>{s}</span></li>)}</ol>

      <section className="surface mt-6 p-5 sm:p-6">
        {/* Step 0 — Soluções */}
        {step===0&&<><h2 className="text-lg font-semibold">Qual solução despertou o seu interesse?</h2><p className="mt-1 text-sm text-muted-foreground">Pode escolher mais do que uma.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">{b.solutions.map(s=>{const Icon=icons[s.name]??Package;const on=selected.includes(s.name);return <button type="button" key={s.id} aria-pressed={on} onClick={()=>toggle(s.name)} className={cn("relative flex min-h-[72px] items-start gap-3 rounded-[10px] border p-4 text-left transition-colors",on?"border-2 border-primary bg-accent":"border-border bg-card hover:border-primary")}><Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary"/><span><span className="block font-semibold">{s.name}</span><span className="block text-sm text-muted-foreground">{s.subtitle}</span></span>{on&&<span className="absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground"><Check className="h-3 w-3"/></span>}</button>})}</div>
        </>}

        {/* Step 1 — Dados pessoais */}
        {step===1&&<><h2 className="text-lg font-semibold">Os seus dados</h2><p className="mt-1 text-sm text-muted-foreground">Indique pelo menos o WhatsApp ou o e-mail.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{(Object.keys(labels) as Field[]).map(k=><div key={k}><Label htmlFor={k}>{labels[k]}{(k==="fullName"||k==="company")&&" *"}</Label><Input id={k} className="mt-2 h-11" type={k==="email"?"email":k==="whatsapp"?"tel":"text"} placeholder={k==="whatsapp"?"+244 9XX XXX XXX":undefined} maxLength={k==="email"?255:100} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></div>)}</div>
          {!emailOk&&<p className="mt-3 text-sm text-destructive">E-mail inválido.</p>}
          <div className="mt-4">
            <Label htmlFor="qr-notes">Observação <span className="text-muted-foreground">(opcional)</span></Label>
            <Textarea id="qr-notes" className="mt-2" placeholder="Ex.: Prefiro ser contactado por WhatsApp, tarde" maxLength={500} value={notes} onChange={e=>setNotes(e.target.value)}/>
          </div>
        </>}

        {/* Step 2 — Demo + consentimento */}
        {step===2&&<><h2 className="text-lg font-semibold">Gostaria de receber uma apresentação ou agendar uma demonstração?</h2>
          <div className="mt-5 grid grid-cols-2 gap-3">{([true,false] as const).map(v=><button type="button" key={String(v)} aria-pressed={demo===v} onClick={()=>setDemo(v)} className={cn("h-14 rounded-[10px] border text-base font-semibold transition-colors",demo===v?"border-2 border-primary bg-accent text-accent-foreground":"border-border bg-card hover:border-primary")}>{v?"Sim":"Não"}</button>)}</div>
          <label className="mt-6 flex items-start gap-3"><Checkbox checked={consent} onCheckedChange={v=>setConsent(v===true)} className="mt-0.5"/><span className="text-sm text-muted-foreground">Autorizo a Mwango Brain a entrar em contacto comigo relativamente à solução seleccionada.</span></label>
        </>}

        <div className="mt-6 flex gap-3">
          {step>0&&<Button variant="outline" size="lg" onClick={()=>setStep(step-1)}><ArrowLeft/>Voltar</Button>}
          <Button size="lg" className="flex-1" disabled={!canNext||submitting} onClick={()=>step<2?setStep(step+1):submit()}>{step<2?<>Continuar<ArrowRight/></>:submitting?"A enviar…":"Enviar"}</Button>
        </div>
      </section>
    </main>
  </div>;
}
