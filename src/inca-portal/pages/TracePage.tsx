import { useMemo, useState } from "react";
import { GitBranch, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TraceabilityTemplate } from "@/sigaflo/templates/TraceabilityTemplate";
import { incaDomain } from "@/sigaflo/domains/inca";
import { embalagens } from "@/inca-portal/data";

export default function TracePage() {
  const options = useMemo(() => embalagens.map((item) => ({ id: item.code, label: `${item.code} — ${item.processingLotCode}`, hint: `${item.packagingType.name} · ${item.totalWeightKg.toLocaleString("pt-AO")} kg` })), []);
  const [query, setQuery] = useState("");
  const filtered = options.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));
  const [selected, setSelected] = useState(options[0]?.id ?? "");
  const current = filtered.some((item) => item.id === selected) ? selected : filtered[0]?.id ?? "";
  return <div className="space-y-6"><div><h1 className="flex items-center gap-2 font-display text-lg font-bold"><GitBranch className="h-5 w-5 text-primary" />Rastreabilidade do meu café</h1><p className="mt-1 text-sm text-muted-foreground">Acompanhe o café desde a exploração até ao armazém.</p></div><div className="card-elevated grid gap-3 rounded-xl p-5 md:grid-cols-2"><label><span className="mb-2 block text-xs font-semibold">Pesquisar</span><span className="relative block"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Lote ou embalagem" /></span></label><label><span className="mb-2 block text-xs font-semibold">Embalagem</span><Select value={current} onValueChange={setSelected}><SelectTrigger><SelectValue placeholder="Escolher" /></SelectTrigger><SelectContent>{filtered.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></label></div><TraceabilityTemplate chain={current ? incaDomain.trace?.(current) ?? null : null} optionHint={options.find((item) => item.id === current)?.hint} /></div>;
}