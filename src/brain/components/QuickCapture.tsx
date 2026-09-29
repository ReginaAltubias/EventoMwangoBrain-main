import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useBrain } from "../store/BrainStore";
import type { InterestLevel,Solution } from "../types";

export function QuickCapture({open,onOpenChange}:{open:boolean;onOpenChange:(open:boolean)=>void}){
  const brain=useBrain(),navigate=useNavigate();
  const [data,setData]=useState({
    fullName:"",company:"",phone:"",
    mainSolution:(brain.solutions[0]?.name??"") as Solution,
    interest:"Alto" as InterestLevel,
    notes:"",
  });

  useEffect(()=>{if(open)setTimeout(()=>document.getElementById("quick-name")?.focus(),80)},[open]);

  const save=async()=>{
    if(!data.fullName||!data.company||!data.phone){toast.error("Preencha nome, empresa e telefone");return}
    try{
      const id=await brain.createQuickContact({
        fullName:data.fullName,company:data.company,phone:data.phone,
        mainSolution:data.mainSolution,interest:data.interest,
        notes:data.notes.trim()||undefined,
      });
      onOpenChange(false);
      toast.success("Contacto registado",{action:{label:"Completar dados",onClick:()=>navigate(`/leads/${id}`)}});
      setData({...data,fullName:"",company:"",phone:"",notes:""});
    }catch(err){toast.error(err instanceof Error?err.message:"Erro ao registar contacto")}
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl p-0 max-sm:inset-0 max-sm:h-dvh max-sm:max-w-none max-sm:translate-x-0 max-sm:translate-y-0 max-sm:rounded-none">
      <div className="border-b p-6">
        <DialogHeader>
          <DialogTitle>Captura rápida</DialogTitle>
          <DialogDescription>Registe o essencial em menos de um minuto.</DialogDescription>
        </DialogHeader>
      </div>
      <div className="grid gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="quick-name">Nome *</Label>
            <Input id="quick-name" value={data.fullName} onChange={e=>setData({...data,fullName:e.target.value})}/>
          </div>
          <div className="space-y-2">
            <Label>Empresa *</Label>
            <Input value={data.company} onChange={e=>setData({...data,company:e.target.value})}/>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Telefone / WhatsApp *</Label>
          <Input placeholder="+244 9XX XXX XXX" value={data.phone} onChange={e=>setData({...data,phone:e.target.value})}/>
        </div>
        <div className="space-y-2">
          <Label>Solução</Label>
          <div className="flex flex-wrap gap-2">
            {brain.solutions.map(s=><Button key={s.id} type="button" size="sm" variant={data.mainSolution===s.name?"default":"outline"} onClick={()=>setData({...data,mainSolution:s.name})}>{s.name}</Button>)}
          </div>
        </div>
        <div className="space-y-2">
          <Label>Interesse</Label>
          <div className="grid grid-cols-3 rounded-lg bg-muted p-1">
            {(["Alto","Médio","Baixo"] as InterestLevel[]).map(v=><Button key={v} variant="ghost" type="button" className={cn("rounded-md",data.interest===v&&"bg-card shadow-sm")} onClick={()=>setData({...data,interest:v})}>{v}</Button>)}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="quick-notes">Observação <span className="text-muted-foreground">(opcional)</span></Label>
          <Textarea id="quick-notes" placeholder="Ex.: Interessado em integração com ERP, ligar amanhã de manhã" maxLength={500} value={data.notes} onChange={e=>setData({...data,notes:e.target.value})}/>
        </div>
      </div>
      <div className="mt-auto flex justify-end gap-2 border-t p-4">
        <Button variant="outline" onClick={()=>onOpenChange(false)}>Cancelar</Button>
        <Button onClick={save}>Guardar contacto</Button>
      </div>
    </DialogContent>
  </Dialog>;
}
