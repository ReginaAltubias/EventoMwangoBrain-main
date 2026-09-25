import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ArrowRight, KeyRound, LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Brand } from "@/components/shared/Brand";
import { useAuth } from "@/features/auth/AuthContext";

const schema = z.object({ email: z.string().email("Introduza um email válido"), password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres") });
type Values = z.infer<typeof schema>;

export default function LoginPage() {
  const { authenticated, login } = useAuth(); const navigate = useNavigate(); const [step, setStep] = useState<"login" | "otp">("login"); const [otp, setOtp] = useState("");
  const form = useForm<Values>({ resolver: zodResolver(schema), defaultValues: { email: "admin@mokamba.ao", password: "mokamba2026" } });
  if (authenticated) return <Navigate to="/dashboard" replace />;
  const verify = () => { if (otp.length === 6) { login(); navigate("/dashboard"); } };
  return <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4 py-10"><div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_15%_15%,hsl(var(--primary)/.16),transparent_26%),radial-gradient(circle_at_85%_75%,hsl(var(--secondary)/.13),transparent_28%)]" /><div className="relative w-full max-w-md rounded-[2rem] border bg-card p-7 shadow-soft sm:p-9"><Brand className="mb-9 justify-center" />{step === "login" ? <><div className="mb-7 text-center"><h1 className="text-2xl font-extrabold">Bem-vindo de volta</h1><p className="mt-2 text-sm text-muted-foreground">Entre na administração segura da Mô'Kamba.</p></div><Form {...form}><form className="space-y-5" onSubmit={form.handleSubmit(() => setStep("otp"))}><FormField control={form.control} name="email" render={({ field }) => <FormItem><FormLabel>Email de administrador</FormLabel><FormControl><div className="relative"><Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><Input {...field} className="h-12 rounded-full bg-element pl-12" /></div></FormControl><FormMessage /></FormItem>} /><FormField control={form.control} name="password" render={({ field }) => <FormItem><FormLabel>Palavra-passe</FormLabel><FormControl><div className="relative"><LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" /><Input {...field} type="password" className="h-12 rounded-full bg-element pl-12" /></div></FormControl><FormMessage /></FormItem>} /><div className="flex items-center justify-between text-sm"><label className="flex items-center gap-2 text-muted-foreground"><input type="checkbox" className="accent-primary" /> Manter sessão</label><button type="button" className="font-semibold text-primary">Recuperar acesso</button></div><Button type="submit" className="h-12 w-full">Continuar <ArrowRight /></Button></form></Form></> : <div className="text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-soft text-primary"><KeyRound className="h-7 w-7" /></span><h1 className="mt-5 text-2xl font-extrabold">Verificação em dois passos</h1><p className="mt-2 text-sm text-muted-foreground">Introduza o código de seis dígitos da sua aplicação autenticadora.</p><InputOTP maxLength={6} value={otp} onChange={setOtp} containerClassName="my-8 justify-center"><InputOTPGroup>{Array.from({ length: 6 }, (_, index) => <InputOTPSlot key={index} index={index} className="h-12 w-11 border bg-element text-lg first:rounded-l-2xl last:rounded-r-2xl" />)}</InputOTPGroup></InputOTP><Button className="h-12 w-full" disabled={otp.length !== 6} onClick={verify}>Verificar e entrar</Button><Button variant="ghost" className="mt-3" onClick={() => setStep("login")}>Voltar ao login</Button><p className="mt-5 text-xs text-muted-foreground">Demonstração: qualquer código de 6 dígitos é aceite.</p></div>}</div></div>;
}