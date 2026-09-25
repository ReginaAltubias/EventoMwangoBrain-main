import { HelpCircle, Mail, MapPin, Phone } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { contactosProvinciais, faqs } from "@/portal/data/mock";

export default function AjudaPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="flex items-center gap-2 text-2xl font-bold">
        <HelpCircle className="h-6 w-6 text-primary" /> Ajuda / Perguntas Frequentes
      </h1>

      <Accordion type="single" collapsible className="mt-8">
        {faqs.map((f, i) => (
          <AccordionItem key={i} value={`f${i}`}>
            <AccordionTrigger className="text-left text-sm font-medium">{f.q}</AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <h2 className="mt-12 text-lg font-bold">Contactos por província</h2>
      <p className="mt-1 text-sm text-muted-foreground">Departamentos Provinciais do IDF.</p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {contactosProvinciais.map((c) => (
          <div key={c.provincia} className="card-elevated rounded-xl p-4">
            <p className="flex items-center gap-1.5 font-semibold">
              <MapPin className="h-4 w-4 text-primary" /> {c.provincia}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{c.endereco}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {c.telefone}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {c.email}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
