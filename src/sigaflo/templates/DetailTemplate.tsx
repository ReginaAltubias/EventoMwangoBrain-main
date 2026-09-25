import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CheckCircle2, Database, FileText, Layers3, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/sigaflo/templates/StatusBadge";
import type { DetailSection, ExpandedDetailRecord } from "@/sigaflo/core/config";
import { cn } from "@/lib/utils";

interface DetailTemplateProps {
  title: string;
  subtitle?: string;
  status?: string;
  sections: DetailSection[];
  related?: ExpandedDetailRecord[];
  tabbed?: boolean;
}

const SectionContent = ({ section, compact = false }: { section: DetailSection; compact?: boolean }) => {
  const reduced = useReducedMotion();

  return (
  <>
    {section.content}
    {section.fields && section.fields.length > 0 && (
      <dl className={cn("grid gap-x-7 gap-y-5", compact ? "sm:grid-cols-2" : "sm:grid-cols-2 xl:grid-cols-3")}>
        {section.fields.map((field) => (
          <div key={field.label} className={cn("min-w-0 border-l-2 border-primary/10 pl-3", field.full && (compact ? "sm:col-span-2" : "sm:col-span-2 xl:col-span-3"))}>
            <dt className="text-[11px] font-semibold uppercase text-muted-foreground">{field.label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold leading-5 text-foreground">{field.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    )}
    {section.table && (
      <div className="overflow-x-auto rounded-md border bg-card">
        <Table>
          <TableHeader><TableRow className="bg-muted/60">{section.table.columns.map((column) => <TableHead key={column.key}>{column.label}</TableHead>)}</TableRow></TableHeader>
          <TableBody>
            <AnimatePresence initial={false}>
              {section.table.rows.map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={reduced ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, delay: reduced ? 0 : Math.min(rowIndex * 0.025, 0.2) }}
                  className="border-b transition-colors hover:bg-muted/30"
                >
                  {section.table?.columns.map((column) => <TableCell key={column.key}>{column.render(row)}</TableCell>)}
                </motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
        {section.table.rows.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">Sem registos associados.</p>}
      </div>
    )}
  </>
  );
};

const RelatedRecord = ({ record, depth = 0 }: { record: ExpandedDetailRecord; depth?: number }) => (
  <article className={cn("overflow-hidden rounded-lg border bg-card shadow-sm", depth > 0 && "bg-muted/15 shadow-none")}>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b bg-muted/25 px-5 py-4">
      <div className="flex min-w-0 gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Database className="h-4 w-4"/></span><div><p className="text-[10px] font-bold uppercase text-primary">{record.label}</p><h3 className="font-display text-base font-semibold">{record.title}</h3>{record.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{record.subtitle}</p>}</div></div>
      {record.status && <StatusBadge status={record.status} />}
    </div>
    <div className="space-y-6 p-5">
      {record.sections.map((section) => <section key={section.title}><div className="mb-4 flex items-center gap-2"><span className="h-4 w-0.5 rounded-full bg-accent"/><h4 className="text-sm font-semibold">{section.title}</h4></div><SectionContent section={section} compact /></section>)}
      {record.related.length > 0 && <div className="space-y-3 border-t pt-5"><p className="flex items-center gap-2 text-[11px] font-bold uppercase text-muted-foreground"><Layers3 className="h-4 w-4"/>Relações desta entidade · {record.related.length}</p>{record.related.map((item) => <RelatedRecord key={item.key} record={item} depth={depth + 1} />)}</div>}
    </div>
  </article>
);

/** Template de Detalhe do shell: ficha só de leitura, com sub-objectos em tabela. */
export const DetailTemplate = ({ title, subtitle, status, sections, related = [], tabbed = false }: DetailTemplateProps) => {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const fieldCount = sections.reduce((total, section) => total + (section.fields?.length ?? 0), 0);
  const tableCount = sections.reduce((total, section) => total + (section.table?.rows.length ?? 0), 0);
  const tabGroups = sections.reduce<{ label: string; sections: DetailSection[] }[]>((groups, section) => {
    const label = section.tab ?? section.title;
    const group = groups.find((item) => item.label === label);
    if (group) group.sections.push(section);
    else groups.push({ label, sections: [section] });
    return groups;
  }, []);

  const renderSection = (section: DetailSection, index: number) => (
    <motion.section
      key={section.title}
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="rounded-lg border bg-card p-5 shadow-sm sm:p-6"
    >
      <header className="mb-5 border-b pb-4">
        <div className="flex items-center gap-3"><span className="h-6 w-1 rounded-full bg-primary"/><h2 className="font-display text-base font-semibold">{section.title}</h2></div>
        {section.description && <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>}
      </header>
      <SectionContent section={section} />
    </motion.section>
  );

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
      </Button>

      <motion.header initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="gradient-primary overflow-hidden rounded-lg px-6 py-7 text-primary-foreground shadow-lg sm:px-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex min-w-0 items-center gap-4"><span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-primary-foreground/20 bg-primary-foreground/10"><FileText className="h-6 w-6"/></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>{status && <StatusBadge status={status}/>}</div>{subtitle && <p className="mt-1 text-sm text-primary-foreground/70">{subtitle}</p>}</div></div>
          <Button variant="outline" onClick={() => window.print()} className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 hover:text-primary-foreground"><Printer className="mr-2 h-4 w-4"/>Imprimir ficha</Button>
        </div>
      </motion.header>

      <div className="grid items-start gap-6 xl:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-5">
          <div className="rounded-lg border bg-card p-5 shadow-sm"><p className="text-[11px] font-bold uppercase text-primary">Resumo da ficha</p><div className="mt-5 space-y-4"><div className="flex items-center justify-between border-b pb-3"><span className="text-xs text-muted-foreground">Secções</span><strong className="text-lg">{sections.length}</strong></div><div className="flex items-center justify-between border-b pb-3"><span className="text-xs text-muted-foreground">Dados principais</span><strong className="text-lg">{fieldCount}</strong></div><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Entidades ligadas</span><strong className="text-lg text-primary">{related.length}</strong></div></div></div>
          <div className="rounded-lg border bg-primary/5 p-5"><div className="flex items-center gap-2 text-primary"><CheckCircle2 className="h-5 w-5"/><p className="text-sm font-semibold">Informação consolidada</p></div><p className="mt-2 text-xs leading-5 text-muted-foreground">A ficha reúne os dados do registo e todas as relações disponíveis, sem sair desta página.</p>{tableCount > 0 && <p className="mt-3 border-t pt-3 text-xs font-medium text-foreground">{tableCount} registos em tabelas associadas</p>}</div>
        </aside>

        <div className="min-w-0 space-y-5">
          {tabbed ? (
            <Tabs defaultValue="tab-0" className="w-full">
              <div className="overflow-x-auto rounded-lg border bg-card p-2 shadow-sm">
                <TabsList className="h-auto min-w-max justify-start gap-1 bg-transparent p-0">
                  {tabGroups.map((group, index) => (
                    <TabsTrigger key={group.label} value={`tab-${index}`} className="min-h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      {group.label}
                    </TabsTrigger>
                  ))}
                  {related.length > 0 && <TabsTrigger value="tab-related" className="min-h-10 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Entidades ligadas</TabsTrigger>}
                </TabsList>
              </div>
              {tabGroups.map((group, groupIndex) => (
                <TabsContent key={group.label} value={`tab-${groupIndex}`} className="mt-5">
                  <motion.div
                    initial={reduced ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.24, ease: "easeOut" }}
                    className="space-y-5"
                  >
                    {group.sections.map((section, sectionIndex) => renderSection(section, sectionIndex))}
                  </motion.div>
                </TabsContent>
              ))}
              {related.length > 0 && (
                <TabsContent value="tab-related" className="mt-5">
                  <motion.div initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease: "easeOut" }} className="space-y-4">
                    <div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Layers3 className="h-5 w-5"/></span><div><h2 className="font-display text-lg font-semibold">Entidades ligadas</h2><p className="text-sm text-muted-foreground">Informação completa e contexto de cada registo associado.</p></div></div><span className="rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">{related.length} {related.length === 1 ? "entidade" : "entidades"}</span></div>
                    <div className="grid w-full gap-5">{related.map((record) => <RelatedRecord key={record.key} record={record}/>)}</div>
                  </motion.div>
                </TabsContent>
              )}
            </Tabs>
          ) : (
            <>
              {sections.map((section, index) => renderSection(section, index))}
              {related.length > 0 && <motion.section initial={reduced ? false : {opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:.12}} className="space-y-4"><div className="flex flex-wrap items-end justify-between gap-3 border-b pb-4"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Layers3 className="h-5 w-5"/></span><div><h2 className="font-display text-lg font-semibold">Entidades ligadas</h2><p className="text-sm text-muted-foreground">Informação completa e contexto de cada registo associado.</p></div></div><span className="rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">{related.length} {related.length === 1 ? "entidade" : "entidades"}</span></div><div className="grid w-full gap-5">{related.map((record) => <RelatedRecord key={record.key} record={record}/>)}</div></motion.section>}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
