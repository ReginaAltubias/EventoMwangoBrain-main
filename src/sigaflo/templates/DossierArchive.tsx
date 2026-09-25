import { motion, useReducedMotion } from "framer-motion";
import { CalendarDays, Download, Eye, FileCheck2, FileSignature, Files, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/sigaflo/templates/StatusBadge";

export interface DossierDocument {
  id: string;
  title: string;
  category: string;
  fileName: string;
  status: string;
  date?: string;
  signedBy?: string;
  size?: string;
  reference?: string;
}

interface DossierArchiveProps {
  documents: DossierDocument[];
  emptyMessage?: string;
}

const safeText = (value: string) => value.replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[character] ?? character));

const documentHtml = (document: DossierDocument) => `<!doctype html><html lang="pt"><head><meta charset="utf-8"><title>${safeText(document.title)}</title><style>body{font-family:Arial,sans-serif;color:#19352a;margin:48px;line-height:1.55}header{border-bottom:3px solid #1f523a;padding-bottom:20px;margin-bottom:32px}small{color:#65766f;text-transform:uppercase;font-weight:700}h1{font-size:25px;margin:8px 0}dl{display:grid;grid-template-columns:180px 1fr;gap:12px;border:1px solid #dbe3df;padding:24px}dt{color:#65766f}dd{margin:0;font-weight:600}.seal{margin-top:48px;border-top:1px solid #dbe3df;padding-top:18px;color:#65766f;font-size:12px}</style></head><body><header><small>SIGAFLO · Café · INCA</small><h1>${safeText(document.title)}</h1><p>Cópia digital integrante do dossiê administrativo.</p></header><dl><dt>Categoria</dt><dd>${safeText(document.category)}</dd><dt>Referência</dt><dd>${safeText(document.reference ?? document.id)}</dd><dt>Ficheiro</dt><dd>${safeText(document.fileName)}</dd><dt>Estado</dt><dd>${safeText(document.status)}</dd><dt>Data</dt><dd>${safeText(document.date ?? "Registada no processo")}</dd><dt>Responsável / assinante</dt><dd>${safeText(document.signedBy ?? "Instituto Nacional do Café")}</dd></dl><p class="seal">Documento de demonstração, gerado localmente para consulta no dossiê do SIGAFLO.</p></body></html>`;

const openDocument = (document: DossierDocument, download = false) => {
  const blob = new Blob([documentHtml(document)], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  if (download) {
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = document.fileName.replace(/\.pdf$/i, ".html");
    anchor.click();
  } else {
    window.open(url, "_blank", "noopener,noreferrer");
  }
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

export const DossierArchive = ({ documents, emptyMessage = "Sem documentos associados." }: DossierArchiveProps) => {
  const reduced = useReducedMotion();

  if (documents.length === 0) return <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground"><Files className="h-4 w-4 text-primary" />Arquivo digital consolidado</span>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{documents.length} {documents.length === 1 ? "documento" : "documentos"}</span>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Documento</TableHead>
              <TableHead>Categoria / referência</TableHead>
              <TableHead className="hidden lg:table-cell">Data / responsável</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-28 text-right">Cópia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document, index) => (
              <motion.tr
                key={document.id}
                initial={reduced ? false : { opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035, duration: 0.25 }}
                className="border-b transition-colors last:border-0 hover:bg-muted/20"
              >
                <TableCell className="min-w-64 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{document.signedBy ? <FileSignature className="h-4 w-4" /> : <FileCheck2 className="h-4 w-4" />}</span>
                    <div className="min-w-0"><p className="font-semibold text-foreground">{document.title}</p><p className="mt-1 break-all text-xs font-medium text-primary">{document.fileName}</p>{document.size && <p className="mt-1 text-xs text-muted-foreground">{document.size}</p>}</div>
                  </div>
                </TableCell>
                <TableCell className="min-w-44"><p className="text-sm text-foreground">{document.category}</p><p className="mt-1 text-xs text-muted-foreground">Ref. {document.reference ?? document.id}</p></TableCell>
                <TableCell className="hidden min-w-52 lg:table-cell"><p className="flex items-center gap-1.5 text-xs text-foreground"><CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />{document.date ?? "Registada no processo"}</p><p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />{document.signedBy ?? "Instituto Nacional do Café"}</p></TableCell>
                <TableCell><StatusBadge status={document.status} /></TableCell>
                <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" title="Ver cópia" aria-label={`Ver ${document.title}`} onClick={() => openDocument(document)}><Eye className="h-4 w-4" /></Button><Button variant="ghost" size="icon" title="Descarregar cópia" aria-label={`Descarregar ${document.title}`} onClick={() => openDocument(document, true)}><Download className="h-4 w-4" /></Button></div></TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};