import { HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { contactosProvinciais, faqs } from "@/portal/data/mock";
import { usePortalAuth } from "@/portal/auth/PortalAuthContext";

export default function AjudaPanelPage() {
  const { operador } = usePortalAuth();
  const meusContactos = contactosProvinciais.filter((c) => operador?.provincias.includes(c.provincia));
  const lista = meusContactos.length > 0 ? meusContactos : contactosProvinciais.slice(0, 2);

  return (
    <div className="space-y-6">
      <h1 className="flex items-center gap-2 text-lg font-bold"><HelpCircle className="h-5 w-5 text-primary" /> Ajuda / Suporte</h1>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="mt-2">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`f${i}`}>
              <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="card-elevated rounded-xl p-5">
        <h2 className="font-semibold">O seu Departamento Provincial do IDF</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {lista.map((c) => (
            <div key={c.provincia} className="rounded-lg border border-border p-4">
              <p className="flex items-center gap-1.5 font-semibold"><MapPin className="h-4 w-4 text-primary" /> {c.provincia}</p>
              <p className="mt-2 text-sm text-muted-foreground">{c.endereco}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {c.telefone}</p>
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {c.email}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
