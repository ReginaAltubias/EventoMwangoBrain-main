import { useLocation, useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, LogOut, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";
import { useEffect } from "react";

export default function EstadoRegistoPage() {
  const { operador, sair, simularAprovacao } = usePortalAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intent = (location.state as { intent?: { tipo: string; id: string } } | null)?.intent;

  useEffect(() => {
    if (!operador) navigate("/entrar", { replace: true });
    else if (operador.estado === "Activo") navigate("/painel", { replace: true });
  }, [operador, navigate]);

  if (!operador) return null;

  const emAnalise = operador.estado === "EmAnalise";

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card-elevated w-full max-w-lg rounded-2xl p-8 text-center animate-scale-in">
        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${emAnalise ? "bg-warning/10 text-warning" : "bg-destructive/10 text-destructive"}`}>
          {emAnalise ? <Clock className="h-7 w-7" /> : <ShieldAlert className="h-7 w-7" />}
        </div>
        <h1 className="mt-4 text-xl font-bold">
          {emAnalise ? "O seu registo está em análise" : "Registo suspenso"}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {emAnalise ? (
            <>
              <strong className="text-foreground">{operador.denominacao}</strong> — o pedido está a ser analisado pelo IDF.
              Prazo indicativo: <strong className="text-foreground">15 dias úteis</strong>. Poderá aceder ao portal
              {intent ? " e retomar a sua candidatura" : ""} assim que for aprovado.
            </>
          ) : (
            <>
              Motivo: <strong className="text-foreground">{operador.motivoSuspensao}</strong>
              <br />
              Para resolver: renove o documento em «Os Meus Dados» assim que o acesso for reposto, ou contacte o Departamento Provincial do IDF.
            </>
          )}
        </p>

        {emAnalise && (
          <div className="mt-5 rounded-lg border border-dashed border-warning/40 bg-warning/5 p-3 text-xs text-muted-foreground">
            <AlertTriangle className="mr-1 inline h-3.5 w-3.5 text-warning" />
            Demonstração: pode simular a aprovação do registo pelo IDF.
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => {
                simularAprovacao();
                if (intent?.tipo === "concurso") navigate(`/painel/concursos/${intent.id}/candidatar`);
                else navigate("/painel");
              }}>
                Simular aprovação
              </Button>
            </div>
          </div>
        )}

        <Button variant="ghost" className="mt-6" onClick={() => { sair(); navigate("/"); }}>
          <LogOut className="mr-1.5 h-4 w-4" /> Terminar sessão
        </Button>
      </div>
    </div>
  );
}
