import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";

// Decisão de UX (extensão de produto, não requisito directo da DRF-02):
// modal de autenticação sobre a página do concurso, que guarda a intenção
// { tipo, id } e, após login com sucesso, retoma automaticamente o fluxo.
export function AuthModal() {
  const { authModalAberto, fecharAuthModal, entrar, intent } = usePortalAuth();
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [aEntrar, setAEntrar] = useState(false);

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    setAEntrar(true);
    setErro(null);
    setTimeout(() => {
      const res = entrar(identificador, password);
      setAEntrar(false);
      if (!res.ok) {
        setErro(res.erro ?? "Erro de autenticação");
        return;
      }
      fecharAuthModal();
      if (res.estado === "Activo") {
        toast.success("Sessão iniciada. A retomar a sua candidatura…");
        // Retoma a intenção guardada — nunca devolve à homepage.
        if (intent?.tipo === "concurso") navigate(`/painel/concursos/${intent.id}/candidatar`);
        else if (intent?.tipo === "concessao") navigate("/painel/concessoes/nova");
        else navigate("/painel");
      } else if (res.estado === "EmAnalise") {
        toast.info("O seu registo está em análise; poderá candidatar-se assim que for aprovado.");
        navigate("/estado-registo");
      } else {
        toast.error("A sua conta está suspensa.");
        navigate("/estado-registo");
      }
    }, 500);
  };

  return (
    <Dialog open={authModalAberto} onOpenChange={(v) => !v && fecharAuthModal()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Para continuar, identifique-se</DialogTitle>
          <DialogDescription>
            {intent?.tipo === "concurso"
              ? "Entre ou registe-se para se candidatar a este concurso. Voltará automaticamente ao formulário."
              : "Entre ou registe-se para continuar."}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="entrar">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entrar">Entrar</TabsTrigger>
            <TabsTrigger value="registar">Registar-me</TabsTrigger>
          </TabsList>
          <TabsContent value="entrar">
            <form onSubmit={submeter} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label htmlFor="m-id">NIF ou e-mail</Label>
                <Input id="m-id" value={identificador} onChange={(e) => setIdentificador(e.target.value)} required autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="m-pass">Palavra-passe</Label>
                <Input id="m-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {erro && <p className="text-sm font-medium text-destructive animate-fade-in">{erro}</p>}
              <Button type="submit" className="w-full" disabled={aEntrar}>
                {aEntrar ? "A entrar…" : "Entrar e continuar"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Demonstração: NIF 5000123456 · palavra-passe idf2026
              </p>
            </form>
          </TabsContent>
          <TabsContent value="registar">
            <div className="space-y-4 pt-2 text-center">
              <p className="text-sm text-muted-foreground">
                O registo de operador é feito num assistente de 5 passos. A intenção de candidatura fica guardada e é retomada após a aprovação.
              </p>
              <Button
                className="w-full"
                onClick={() => {
                  fecharAuthModal();
                  navigate("/registar", { state: { intent } });
                }}
              >
                Iniciar registo de operador
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
