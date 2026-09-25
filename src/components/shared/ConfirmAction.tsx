import { useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function ConfirmAction({ children, title, description, action = "Confirmar", destructive = true }: { children: React.ReactNode; title: string; description: string; action?: string; destructive?: boolean }) {
  const [reason, setReason] = useState("");
  return <AlertDialog><AlertDialogTrigger asChild>{children}</AlertDialogTrigger><AlertDialogContent className="rounded-[2rem]"><AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader><div className="space-y-2"><Label htmlFor="reason">Motivo obrigatório</Label><Textarea id="reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Registe o motivo desta acção…" className="min-h-28 rounded-2xl" /></div><AlertDialogFooter><AlertDialogCancel className="rounded-full">Cancelar</AlertDialogCancel><AlertDialogAction disabled={reason.trim().length < 5} className={destructive ? "rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90" : "rounded-full"} onClick={() => toast.success("Acção registada no histórico de auditoria")}>{action}</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}