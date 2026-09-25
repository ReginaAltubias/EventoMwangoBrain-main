import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { PageHeader } from "@/sigaflo/templates/PageHeader";
import { TraceabilityTemplate } from "@/sigaflo/templates/TraceabilityTemplate";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { findDomain } from "@/sigaflo/domains/registry";

const DomainTracePage = () => {
  const domain = findDomain("cafe");
  const options = domain?.traceOptions?.() ?? [];
  const [entry, setEntry] = useState<string>(options[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [lot, setLot] = useState("todos");
  if (!domain || !domain.trace) return null;

  const optionLots = useMemo(() => [...new Set(options.map((option) => option.label.split("—")[1]?.trim()).filter(Boolean) as string[])], [options]);
  const filteredOptions = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("pt-AO");
    return options.filter((option) => {
      const optionLot = option.label.split("—")[1]?.trim();
      const matchesLot = lot === "todos" || optionLot === lot;
      const matchesQuery = !normalized || `${option.label} ${option.hint}`.toLocaleLowerCase("pt-AO").includes(normalized);
      return matchesLot && matchesQuery;
    });
  }, [lot, options, query]);

  const selected = filteredOptions.some((option) => option.id === entry) ? entry : filteredOptions[0]?.id ?? "";
  const chain = selected ? domain.trace(selected) : null;
  const selectedOption = options.find((option) => option.id === selected);

  const resetFilters = () => {
    setQuery("");
    setLot("todos");
    setEntry(options[0]?.id ?? "");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rastreabilidade"
        description="Consulte a origem e cada etapa percorrida por um lote de café."
        crumbs={["Café · INCA", "Rastreabilidade"]}
      />

      <div className="rounded-lg border bg-card p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(240px,1.2fr)_minmax(190px,.75fr)_minmax(260px,1fr)_auto] lg:items-end">
          <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">Pesquisar na cadeia</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Código do lote ou embalagem"/></span></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">Lote de processamento</span><Select value={lot} onValueChange={(value) => { setLot(value); setEntry(""); }}><SelectTrigger><SelectValue placeholder="Todos os lotes"/></SelectTrigger><SelectContent><SelectItem value="todos">Todos os lotes</SelectItem>{optionLots.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select></label>
          <label className="block"><span className="mb-2 block text-xs font-semibold text-foreground">Embalagem</span><Select value={selected} onValueChange={setEntry} disabled={!filteredOptions.length}><SelectTrigger><SelectValue placeholder={filteredOptions.length ? "Escolher embalagem" : "Sem resultados"}/></SelectTrigger><SelectContent>{filteredOptions.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></label>
          <Button variant="outline" size="icon" onClick={resetFilters} aria-label="Limpar filtros" title="Limpar filtros"><RotateCcw className="h-4 w-4"/></Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-xs text-muted-foreground"><span>{filteredOptions.length} {filteredOptions.length === 1 ? "registo encontrado" : "registos encontrados"}</span><span>Consulta por lote e embalagem</span></div>
      </div>

      <TraceabilityTemplate chain={chain} optionHint={selectedOption?.hint} />
    </div>
  );
};

export default DomainTracePage;
