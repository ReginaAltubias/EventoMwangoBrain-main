import { useState } from "react";
import { Bell, CircleHelp, Mail, Phone, Search } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { EstadoBadge } from "@/portal/components/Badges";
import { notificacoesIda } from "@/ida-portal/data";

export function NotificationsPage() {
  const reduced = useReducedMotion();
  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-bold"><Bell className="h-5 w-5 text-primary" />Notificações</h1>
      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Central de alertas</h2>
        <p className="mt-1 text-sm text-muted-foreground">Avisos sobre cadastros, colheitas, consumo e dívidas das quatro instituições.</p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-xs uppercase text-muted-foreground"><th className="p-3">Data</th><th className="p-3">Área</th><th className="p-3">Mensagem</th><th className="p-3">Estado</th></tr></thead>
            <tbody>
              {notificacoesIda.map((item, index) => (
                <motion.tr key={item.id} initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="border-b last:border-0">
                  <td className="p-3 text-muted-foreground">{item.data}</td>
                  <td className="p-3 font-medium">{item.tipo}</td>
                  <td className="p-3">{item.texto}</td>
                  <td className="p-3"><EstadoBadge estado={item.lida ? "Lida" : "Nova"} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export function HelpPage() {
  const [query, setQuery] = useState("");
  const faqs = [
    ["Que produtores aparecem neste painel?", "Todos os produtores registados pelo INCA, IDF, INCER e pelo próprio IDA, num único cadastro consolidado."],
    ["Como vejo tudo sobre um produtor?", "Abra Todos os produtores e clique no ícone de visualizar. A ficha reúne cadastro, mapa, terras, colheitas, consumo, finanças e dívidas."],
    ["Posso criar ou alterar registos?", "Não. Este painel é de consulta: os dados chegam das instituições de origem."],
    ["Como exporto uma lista?", "Em qualquer lista use o botão Exportar para gravar os registos filtrados."],
  ].filter(([question, answer]) => `${question} ${answer}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-bold"><CircleHelp className="h-5 w-5 text-primary" />Ajuda / Suporte</h1>
      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Perguntas frequentes</h2>
        <div className="relative mt-4 max-w-2xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar uma dúvida" />
        </div>
        <div className="mt-4 space-y-3">
          {faqs.map(([question, answer]) => (
            <article key={question} className="rounded-lg border p-4">
              <h3 className="font-semibold">{question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{answer}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Direcção Nacional do IDA</h2>
        <div className="mt-4 rounded-lg border p-4">
          <p className="font-semibold">Luanda · Sede Nacional</p>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" />+244 923 100 480</p>
            <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" />apoio@ida.gov.ao</p>
          </div>
        </div>
      </section>
    </div>
  );
}
