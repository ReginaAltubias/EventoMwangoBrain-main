import { motion, useReducedMotion } from "framer-motion";
import { Check, Coffee, Eye, GitBranch, PackageCheck, Route } from "lucide-react";
import { Link } from "react-router-dom";
import type { TraceChain } from "@/sigaflo/core/config";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

/** Template de Rastreabilidade do shell — timeline ponta-a-ponta comum a todos os domínios. */
export const TraceabilityTemplate = ({ chain, optionHint }: { chain: TraceChain | null; optionHint?: string }) => {
  const reduced = useReducedMotion();
  if (!chain) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed bg-card py-16 text-center">
        <GitBranch className="h-8 w-8 text-muted-foreground" />
        <p className="font-display text-sm font-semibold text-foreground">Nenhum registo encontrado</p>
        <p className="text-xs text-muted-foreground">Ajuste os filtros para consultar a cadeia completa.</p>
      </div>
    );
  }

  const lotNode = chain.nodes.find((node) => node.label.toLocaleLowerCase("pt-AO").includes("lote"));
  const producerNode = chain.nodes.find((node) => node.label === "Produtor");
  const farmNode = chain.nodes.find((node) => node.label === "Exploração");
  const destinationNode = chain.nodes.find((node) => node.label === "Armazém") ?? chain.nodes.at(-1);
  const volume = lotNode?.detail?.split("·")[0]?.trim() ?? optionHint ?? "—";

  return (
    <div className="grid items-start gap-5 xl:grid-cols-[300px_minmax(0,1fr)]">
      <motion.aside initial={reduced ? false : { opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden rounded-lg border bg-card shadow-sm xl:sticky xl:top-5">
        <div className="border-b bg-primary/10 px-5 py-4"><p className="text-[11px] font-bold uppercase text-primary">Resumo seleccionado</p></div>
        <div className="p-5">
          <div className="flex items-center gap-3 border-b pb-5"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-primary text-primary-foreground"><Coffee className="h-5 w-5"/></span><div className="min-w-0"><p className="text-xs text-muted-foreground">{chain.entryLabel}</p><p className="truncate font-display text-base font-semibold">{chain.entryReference}</p></div></div>
          <dl className="space-y-4 py-5 text-sm">
             <div><dt className="text-xs text-muted-foreground">Lote de café</dt><dd className="mt-1 font-semibold text-foreground">{lotNode?.reference ?? "—"}</dd></div>
             <div><dt className="text-xs text-muted-foreground">Produtor</dt><dd className="mt-1 font-medium text-foreground">{producerNode?.reference ?? "—"}</dd></div>
             <div><dt className="text-xs text-muted-foreground">Exploração</dt><dd className="mt-1 font-medium text-foreground">{farmNode?.reference ?? "—"}</dd></div>
             <div><dt className="text-xs text-muted-foreground">Peso identificado</dt><dd className="mt-1 flex items-center gap-2 font-medium text-foreground"><Coffee className="h-4 w-4 text-primary"/>{volume}</dd></div>
            <div><dt className="text-xs text-muted-foreground">Destino actual</dt><dd className="mt-1 font-medium text-foreground">{destinationNode?.reference ?? "Em circulação"}</dd></div>
          </dl>
          <div className="flex items-center gap-2 rounded-md bg-success/10 px-3 py-2.5 text-xs font-semibold text-success"><PackageCheck className="h-4 w-4"/>Cadeia verificada</div>
        </div>
      </motion.aside>

      <motion.section initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : .08 }} className="rounded-lg border bg-card p-5 shadow-sm sm:p-6">
         <div className="mb-6 flex flex-wrap items-start justify-between gap-3 border-b pb-5"><div><p className="font-display text-base font-semibold">Percurso completo</p><p className="mt-1 text-xs text-muted-foreground">Do produtor ao destino actual do café</p></div><span className="flex items-center gap-2 rounded-md bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground"><Route className="h-4 w-4"/>{chain.nodes.length} etapas</span></div>
        <ol className="relative space-y-4 before:absolute before:bottom-4 before:left-[18px] before:top-4 before:w-px before:bg-border">
          {chain.nodes.map((node, index) => (
            <motion.li
              key={`${node.id}-${index}`}
              initial={reduced ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: reduced ? 0 : .12 + index * .045 }}
              className="group relative grid grid-cols-[38px_minmax(0,1fr)] gap-4"
            >
              <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-4 border-card bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                {index === chain.nodes.length - 1 ? <Check className="h-3.5 w-3.5"/> : <span className="text-[10px] font-bold">{index + 1}</span>}
              </span>
              <div className="rounded-md border bg-background/60 p-4 transition-colors group-hover:border-primary/25 group-hover:bg-primary/[0.025]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-[10px] font-bold uppercase text-muted-foreground">Etapa {String(index + 1).padStart(2, "0")} · {node.label}</p><p className="mt-1 font-display text-sm font-semibold text-foreground">{node.reference}</p></div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-success/10 px-2 py-1 text-[10px] font-semibold text-success">Concluída</span>
                    {node.link && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button asChild variant="outline" size="icon" className="h-8 w-8" aria-label={`Visualizar ${node.label}`}>
                            <Link to={node.link}><Eye className="h-4 w-4" /></Link>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Visualizar {node.label.toLocaleLowerCase("pt-AO")}</TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                {node.detail && <p className="mt-2 text-xs leading-5 text-muted-foreground">{node.detail}</p>}
              </div>
            </motion.li>
          ))}
        </ol>
      </motion.section>
    </div>
  );
};
