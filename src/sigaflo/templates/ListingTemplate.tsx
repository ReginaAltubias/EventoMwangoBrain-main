import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Download, Eye, Search, Table2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, statusLabel } from "@/sigaflo/templates/StatusBadge";
import { paginate } from "@/sigaflo/core/types";
import type { EntityConfig } from "@/sigaflo/core/config";
import { cn } from "@/lib/utils";

const toCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: unknown) => {
    const text = value == null ? "" : String(value);
    return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  };
  return [headers.join(";"), ...rows.map((row) => headers.map((h) => escape(row[h])).join(";"))].join("\n");
};

interface ListingTemplateProps<T> {
  entity: EntityConfig<T>;
  basePath: string;
}

/** Template de Listagem do shell: pesquisa + filtros + tabela paginada (PagedResult). */
export function ListingTemplate<T>({ entity, basePath }: ListingTemplateProps<T>) {
  const reduced = useReducedMotion();
  const all = entity.rows();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return all.filter((row) => {
      if (term && !entity.searchText(row).toLowerCase().includes(term)) return false;
      for (const filter of entity.filters ?? []) {
        const value = filters[filter.key];
        if (value && value !== "all" && !filter.match(row, value)) return false;
      }
      return true;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, search, filters]);

  const result = paginate(filtered, { page, pageSize });

  const exportCsv = () => {
    const rows = filtered.map((row) => {
      const record: Record<string, unknown> = {};
      entity.columns.forEach((column) => {
        const value = column.render(row);
        record[column.label] = typeof value === "object" ? entity.title(row) : (value as string | number);
      });
      record["Estado"] = entity.status?.(row) ?? "";
      return record;
    });
    const blob = new Blob(["\uFEFF" + toCsv(rows)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${entity.key}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={`Pesquisar em ${entity.label.toLowerCase()}…`}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>
        {(entity.filters ?? []).map((filter) => (
          <Select
            key={filter.key}
            value={filters[filter.key] ?? "all"}
            onValueChange={(value) => {
              setFilters((prev) => ({ ...prev, [filter.key]: value }));
              setPage(1);
            }}
          >
            <SelectTrigger className="lg:w-56">
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">{filter.label}: todos</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option} value={option}>
                  {statusLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="mr-2 h-4 w-4" />
          Exportar
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/55">
              {entity.columns.map((column) => (
                <TableHead key={column.key} className={cn(column.hideOnMobile && "hidden md:table-cell")}>
                  {column.label}
                </TableHead>
              ))}
              {entity.status && <TableHead>Estado</TableHead>}
              <TableHead className="w-16 text-right">Ver</TableHead>
            </TableRow>
          </TableHeader>
          <motion.tbody
            key={`${page}-${search}-${JSON.stringify(filters)}`}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18 }}
            className="[&_tr:last-child]:border-0"
          >
            <AnimatePresence initial={false}>
              {result.items.map((row, index) => (
                <motion.tr
                  key={entity.id(row)}
                  initial={reduced ? false : { opacity: 0, y: 7 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, delay: reduced ? 0 : Math.min(index * 0.025, 0.2) }}
                  className={cn("border-b transition-colors hover:bg-primary/5", index % 2 === 1 && "bg-muted/20")}
                >
                  {entity.columns.map((column) => (
                    <TableCell key={column.key} className={cn("py-3", column.hideOnMobile && "hidden md:table-cell")}>
                      {column.render(row)}
                    </TableCell>
                  ))}
                  {entity.status && (
                    <TableCell>
                      <StatusBadge status={entity.status(row)} />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="icon" aria-label="Visualizar">
                      <Link to={`${basePath}/${entity.key}/${entity.id(row)}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </Table>

        {result.items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Table2 className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Sem registos para os filtros aplicados.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <p>
          {result.totalCount.toLocaleString("pt-AO")} registo(s) · página {result.page} de {result.totalPages}
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!result.hasPreviousPage} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={!result.hasNextPage} onClick={() => setPage((p) => p + 1)}>
            Seguinte
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
