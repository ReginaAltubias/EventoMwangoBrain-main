import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { toast } from "sonner";
import idfLogo from "@/assets/idf-logo.png";

export default function LoginPage() {
  const { entrar } = usePortalAuth();
  const navigate = useNavigate();
  const [identificador, setIdentificador] = useState("");
  const [password, setPassword] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [recuperar, setRecuperar] = useState(false);

  const submeter = (e: React.FormEvent) => {
    e.preventDefault();
    const res = entrar(identificador, password);
    if (!res.ok) {
      setErro(res.erro ?? null);
      return;
    }
    if (res.estado === "Activo") {
      toast.success("Bem-vindo ao seu portal.");
      navigate("/painel");
    } else {
      navigate("/estado-registo");
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-scale-in">
        <div className="card-elevated rounded-2xl p-8">
          <div className="mb-6 text-center">
            <img src={idfLogo} alt="IDF" className="mx-auto h-14 w-14 rounded-full object-contain" />
            <h1 className="mt-3 text-xl font-bold">Entrar no portal</h1>
            <p className="mt-1 text-sm text-muted-foreground">Área reservada ao operador florestal</p>
          </div>

          {recuperar ? (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Se o e-mail existir, receberá instruções de recuperação (demonstração).");
                setRecuperar(false);
              }}
            >
              <div className="space-y-1.5">
                <Label htmlFor="rec">E-mail da conta</Label>
                <Input id="rec" type="email" required placeholder="o.seu@email.ao" />
              </div>
              <Button type="submit" className="w-full">Enviar instruções</Button>
              <Button type="button" variant="ghost" className="w-full" onClick={() => setRecuperar(false)}>
                Voltar ao login
              </Button>
            </form>
          ) : (
            <form onSubmit={submeter} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="id">NIF ou e-mail</Label>
                <Input id="id" value={identificador} onChange={(e) => setIdentificador(e.target.value)} required placeholder="5000123456" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pw">Palavra-passe</Label>
                <Input id="pw" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
              </div>
              {erro && <p className="text-sm font-medium text-destructive animate-fade-in">{erro}</p>}
              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" /> Entrar
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" className="text-primary hover:underline" onClick={() => setRecuperar(true)}>
                  Esqueci-me da palavra-passe
                </button>
                <Link to="/registar" className="text-primary hover:underline">
                  Registar-me
                </Link>
              </div>
              <p className="rounded-lg bg-muted px-3 py-2 text-center text-xs text-muted-foreground">
                Demonstração — Activo: 5000123456 · Suspenso: 5000654321 · Em análise: 5000999000 · palavra-passe: idf2026
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
