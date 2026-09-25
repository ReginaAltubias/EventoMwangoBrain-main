import {
  Award,
  Banknote,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CircleDollarSign,
  FileCheck2,
  FileSignature,
  Gavel,
  Gauge,
  Globe2,
  Layers,
  Leaf,
  Map as MapIcon,
  Package,
  ScrollText,
  Ship,
  TreePine,
  Truck,
  UserRound,
  Warehouse,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import * as idf from "@/mocks/idf";
import type { DashboardData, DomainConfig, EntityConfig, MapArea, MapPoint, TraceChain } from "@/sigaflo/core/config";
import { StatusBadge, statusLabel } from "@/sigaflo/templates/StatusBadge";
import type {
  ConcessionDto,
  ExploitationOperationDto,
  ExportProcessDto,
  ForestCertificateDto,
  ForestInventoryDto,
  ForestLicenseDto,
  ForestLotDto,
  ForestOperatorDto,
  ForestQuotaDto,
  InspectionDto,
  LogDto,
  ManagementPlanDto,
  RevenueTransactionDto,
  TransitGuideDto,
  WarehouseDto,
} from "@/modules/idf/types";
import type { AreaRegistryDto, EnforcementRecordDto } from "@/modules/idf/registry/types";
import type { LicensingRecord } from "@/modules/idf/licensing/types";
import { PROCESS_PHASES } from "@/modules/idf/registry/concessionPhases";
import { DossierArchive, type DossierDocument } from "@/sigaflo/templates/DossierArchive";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const m3 = (value?: number) => `${(value ?? 0).toLocaleString("pt-AO")} m³`;
const aoa = (value: number) => `${value.toLocaleString("pt-AO")} AOA`;
const bold = (text: string) => <span className="font-medium text-foreground">{text}</span>;
const period = (p?: { startDate: string; endDate: string }) => (p ? `${p.startDate} → ${p.endDate}` : "—");
const opName = (id?: string) => idf.findOperator(id)?.legalName ?? "—";
const conCode = (id?: string) => idf.findConcession(id)?.code ?? "—";
const fileSize = (size?: number) => size ? `${(size / 1024).toLocaleString("pt-AO", { maximumFractionDigits: 0 })} KB` : "—";

interface ConcessionPhaseRecord {
  concession: string;
  key: string;
  label: string;
  deadlineLabel: string;
  status: string;
  signedBy: string;
  signedAt: string;
  document: DossierDocument;
}

const ProcessPhaseFlow = ({ phases }: { phases: ConcessionPhaseRecord[] }) => {
  const reduced = useReducedMotion();
  const groups = [...new Set(phases.map((phase) => phase.concession))];

  return (
    <div className="space-y-6">
      {groups.map((concession) => {
        const items = phases.filter((phase) => phase.concession === concession);
        const completed = items.filter((phase) => phase.status === "Concluída").length;
        const progress = items.length ? Math.round((completed / items.length) * 100) : 0;

        return (
          <div key={concession} className="overflow-hidden rounded-lg border bg-muted/10">
            <div className="border-b bg-muted/35 px-5 py-4 sm:px-6">
              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <p className="text-[11px] font-bold uppercase text-muted-foreground">Processo de concessão</p>
                  <p className="mt-1 font-display text-base font-semibold text-foreground">{concession}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-border" aria-label={`${progress}% concluído`}>
                    <motion.div
                      className="h-full rounded-full bg-primary"
                      initial={reduced ? false : { width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.55, ease: "easeOut" }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-xs font-semibold text-primary">{completed} de {items.length} fases</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader><TableRow className="bg-muted/20"><TableHead className="w-20">Fase</TableHead><TableHead>Descrição</TableHead><TableHead>Prazo</TableHead><TableHead>Assinante / data</TableHead><TableHead>Documento</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader>
                <TableBody>
              {items.map((phase, index) => {
                const complete = phase.status === "Concluída";
                const signed = phase.signedBy !== "—";
                return (
                  <motion.tr
                    key={`${concession}-${phase.key}`}
                    initial={reduced ? false : { opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.045, duration: 0.3 }}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <TableCell><span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">{phase.key}</span></TableCell>
                    <TableCell className="min-w-56 font-semibold text-foreground">{phase.label}</TableCell>
                    <TableCell className="min-w-36 text-xs">{phase.deadlineLabel}</TableCell>
                    <TableCell className="min-w-48"><p className={signed ? "text-xs font-medium text-foreground" : "text-xs text-muted-foreground"}>{signed ? phase.signedBy : "Não aplicável"}</p><p className="mt-1 text-xs text-muted-foreground">{signed ? phase.signedAt : "—"}</p></TableCell>
                    <TableCell className="min-w-48 break-all text-xs font-medium text-primary">{phase.document.fileName}</TableCell>
                    <TableCell><span className={complete ? "inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success" : "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold text-muted-foreground"}>{complete ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{phase.status}</span></TableCell>
                  </motion.tr>
                );
              })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-card/60 px-5 py-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2"><FileSignature className="h-4 w-4 text-primary" />{items.filter((phase) => phase.signedBy !== "—").length} assinaturas formais registadas</span>
              <span>{progress}% do processo concluído</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ConcessionSummaryRecord {
  id: string;
  code: string;
  type: string;
  area: number;
  validity: string;
  status: string;
  instruments: number;
  documents: number;
}

const ConcessionCards = ({ concessions }: { concessions: ConcessionSummaryRecord[] }) => {
  const reduced = useReducedMotion();
  return (
    <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
      <Table><TableHeader><TableRow className="bg-muted/40"><TableHead>Concessão</TableHead><TableHead>Tipo</TableHead><TableHead className="text-right">Área</TableHead><TableHead>Validade</TableHead><TableHead className="text-center">Instrumentos</TableHead><TableHead className="text-center">Documentos</TableHead><TableHead>Estado</TableHead></TableRow></TableHeader><TableBody>
        {concessions.map((concession, index) => <motion.tr key={concession.id} initial={reduced ? false : { opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="border-b transition-colors last:border-0 hover:bg-muted/20"><TableCell className="font-semibold text-primary">{concession.code}</TableCell><TableCell>{statusLabel(concession.type)}</TableCell><TableCell className="whitespace-nowrap text-right font-semibold">{concession.area.toLocaleString("pt-AO")} ha</TableCell><TableCell className="min-w-44">{concession.validity}</TableCell><TableCell className="text-center">{concession.instruments}</TableCell><TableCell className="text-center font-semibold text-primary">{concession.documents}</TableCell><TableCell><StatusBadge status={concession.status} /></TableCell></motion.tr>)}
      </TableBody></Table>
      {concessions.length === 0 && <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">Sem concessões associadas.</p>}
    </div>
  );
};

const formatFinancialDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("pt-AO", { day: "2-digit", month: "short", year: "numeric" }).format(date);
};

interface ConsumptionRecord {
  id: string;
  concession: string;
  quota: string;
  contracted: number;
  consumed: number;
  remaining: number;
  status: string;
}

const ConsumptionOverview = ({ rows }: { rows: ConsumptionRecord[] }) => {
  const reduced = useReducedMotion();
  const contracted = rows.reduce((sum, item) => sum + item.contracted, 0);
  const consumed = rows.reduce((sum, item) => sum + item.consumed, 0);
  const remaining = Math.max(0, contracted - consumed);
  const percentage = contracted > 0 ? Math.min(100, Math.round((consumed / contracted) * 100)) : 0;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Volume contratado", value: contracted, hint: `${rows.length} ${rows.length === 1 ? "quota associada" : "quotas associadas"}`, tone: "primary" },
          { label: "Volume consumido", value: consumed, hint: `${percentage}% do volume contratado`, tone: "warning" },
          { label: "Volume disponível", value: remaining, hint: `${100 - percentage}% ainda disponível`, tone: "success" },
        ].map((item, index) => (
          <motion.article key={item.label} initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="rounded-lg border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{item.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${item.tone === "success" ? "bg-success/10 text-success" : item.tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}><Gauge className="h-4 w-4" /></span>
            </div>
            <p className={`mt-4 text-2xl font-bold ${item.tone === "success" ? "text-success" : item.tone === "warning" ? "text-warning" : "text-foreground"}`}>{m3(item.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
          </motion.article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="border-b bg-muted/30 px-5 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h3 className="text-sm font-semibold text-foreground">Consumo por concessão</h3><p className="mt-0.5 text-xs text-muted-foreground">O saldo é calculado pelo volume contratado menos o volume consumido.</p></div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">{percentage}% consumido</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div className="h-full rounded-full bg-primary" initial={reduced ? false : { width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.65, ease: "easeOut" }} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b bg-muted/20 text-left text-[11px] uppercase text-muted-foreground"><th className="px-5 py-3 font-semibold">Concessão / quota</th><th className="px-5 py-3 text-right font-semibold">Contratado</th><th className="px-5 py-3 text-right font-semibold">Consumido</th><th className="px-5 py-3 text-right font-semibold">Disponível</th><th className="px-5 py-3 font-semibold">Progresso</th></tr></thead>
            <tbody>
              {rows.map((item, index) => {
                const rowPercentage = item.contracted > 0 ? Math.min(100, Math.round((item.consumed / item.contracted) * 100)) : 0;
                return (
                  <motion.tr
                    key={item.id}
                    initial={reduced ? false : { opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: reduced ? 0 : Math.min(index * 0.04, 0.2) }}
                    className="border-b transition-colors last:border-0 hover:bg-muted/20"
                  >
                    <td className="px-5 py-4"><p className="font-semibold text-foreground">{item.concession}</p><p className="mt-0.5 text-xs text-muted-foreground">{item.quota}</p></td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold">{m3(item.contracted)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-warning">{m3(item.consumed)}</td>
                    <td className="whitespace-nowrap px-5 py-4 text-right font-bold text-success">{m3(item.remaining)}</td>
                    <td className="min-w-40 px-5 py-4"><div className="flex items-center gap-3"><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{ width: `${rowPercentage}%` }} /></div><span className="w-9 text-right text-xs font-bold text-primary">{rowPercentage}%</span></div></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {rows.length === 0 && <p className="px-6 py-10 text-center text-sm text-muted-foreground">Sem volumes contratados para este operador.</p>}
        </div>
      </div>
    </div>
  );
};

const FinancialOverview = ({ paid, unpaid }: { paid: RevenueTransactionDto[]; unpaid: RevenueTransactionDto[] }) => {
  const reduced = useReducedMotion();
  const paidTotal = paid.reduce((sum, item) => sum + item.amount, 0);
  const unpaidTotal = unpaid.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = paidTotal + unpaidTotal;
  const paidShare = grandTotal ? Math.round((paidTotal / grandTotal) * 100) : 0;

  const summary = [
    { label: "Total liquidado", value: paidTotal, hint: `${paid.length} ${paid.length === 1 ? "cobrança regularizada" : "cobranças regularizadas"}`, tone: "success" },
    { label: "Total pendente", value: unpaidTotal, hint: `${unpaid.length} ${unpaid.length === 1 ? "cobrança por regularizar" : "cobranças por regularizar"}`, tone: "warning" },
    { label: "Total apurado", value: grandTotal, hint: `${paid.length + unpaid.length} cobranças registadas`, tone: "primary" },
  ] as const;

  const RevenueRows = ({ rows, settled }: { rows: RevenueTransactionDto[]; settled: boolean }) => (
    <div className="overflow-x-auto">
      <Table><TableHeader><TableRow className="bg-muted/20"><TableHead>Código</TableHead><TableHead>Origem</TableHead><TableHead>Descrição</TableHead><TableHead>Data</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Montante</TableHead></TableRow></TableHeader><TableBody>
      {rows.map((item, index) => (
        <motion.tr
          key={item.id}
          initial={reduced ? false : { opacity: 0, y: 7 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className="border-b transition-colors last:border-0 hover:bg-muted/20"
        >
          <TableCell className="font-mono text-xs font-semibold text-primary">{item.code}</TableCell><TableCell><span className="rounded-md bg-muted px-2 py-1 text-[11px] font-semibold text-muted-foreground">{statusLabel(item.sourceType)}</span></TableCell><TableCell className="min-w-64 font-medium text-foreground">{item.description}</TableCell><TableCell className="whitespace-nowrap text-xs text-muted-foreground">{settled ? formatFinancialDate(item.paidAt) : "—"}</TableCell><TableCell><StatusBadge status={settled ? "Pago" : item.status} /></TableCell><TableCell className={settled ? "whitespace-nowrap text-right font-bold text-success" : "whitespace-nowrap text-right font-bold text-warning"}>{aoa(item.amount)}</TableCell>
        </motion.tr>
      ))}
      </TableBody></Table>
      {rows.length === 0 && <p className="px-6 py-8 text-center text-sm text-muted-foreground">Sem cobranças nesta situação.</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {summary.map((item, index) => (
          <motion.article
            key={item.label}
            initial={reduced ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06, duration: 0.32 }}
            className="rounded-lg border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase text-muted-foreground">{item.label}</p>
              <span className={`flex h-8 w-8 items-center justify-center rounded-md ${item.tone === "success" ? "bg-success/10 text-success" : item.tone === "warning" ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}><CircleDollarSign className="h-4 w-4" /></span>
            </div>
            <p className={`mt-4 whitespace-nowrap text-xl font-bold sm:text-2xl ${item.tone === "success" ? "text-success" : item.tone === "warning" ? "text-warning" : "text-foreground"}`}>{aoa(item.value)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{item.hint}</p>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
              <motion.div className={`h-full rounded-full ${item.tone === "success" ? "bg-success" : item.tone === "warning" ? "bg-warning" : "bg-primary"}`} initial={reduced ? false : { width: 0 }} animate={{ width: item.tone === "success" ? `${paidShare}%` : item.tone === "warning" ? `${100 - paidShare}%` : "100%" }} transition={{ duration: 0.55, ease: "easeOut" }} />
            </div>
          </motion.article>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-warning/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="h-7 w-1 rounded-full bg-warning" /><div><h3 className="text-sm font-semibold text-foreground">Dívidas não pagas</h3><p className="text-xs text-muted-foreground">Cobranças que ainda aguardam regularização.</p></div></div>
          <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-bold text-warning">{unpaid.length} {unpaid.length === 1 ? "pendente" : "pendentes"}</span>
        </header>
        <RevenueRows rows={unpaid} settled={false} />
      </div>

      <div className="overflow-hidden rounded-lg border bg-card shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-success/5 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3"><span className="h-7 w-1 rounded-full bg-success" /><div><h3 className="text-sm font-semibold text-foreground">Histórico de dívidas pagas</h3><p className="text-xs text-muted-foreground">Cobranças liquidadas e respectivas datas de pagamento.</p></div></div>
          <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">{paid.length} {paid.length === 1 ? "liquidada" : "liquidadas"}</span>
        </header>
        <RevenueRows rows={paid} settled />
      </div>
    </div>
  );
};

/** Centróides aproximados das províncias (mock) para localizar produtores/operadores. */
const PROVINCE_CENTROIDS: Record<string, { latitude: number; longitude: number }> = {
  Bengo: { latitude: -8.5833, longitude: 13.6167 },
  Benguela: { latitude: -12.5763, longitude: 13.4055 },
  Bié: { latitude: -12.3833, longitude: 16.9333 },
  Cabinda: { latitude: -5.55, longitude: 12.2 },
  "Cuando Cubango": { latitude: -14.6585, longitude: 17.6907 },
  "Cuanza Norte": { latitude: -9.2989, longitude: 14.9109 },
  "Cuanza Sul": { latitude: -11.2058, longitude: 13.8437 },
  Cunene: { latitude: -16.7833, longitude: 15.0 },
  Huambo: { latitude: -12.7761, longitude: 15.7392 },
  Huíla: { latitude: -14.9177, longitude: 13.4925 },
  Luanda: { latitude: -8.8383, longitude: 13.2344 },
  "Lunda Norte": { latitude: -7.3667, longitude: 20.8333 },
  "Lunda Sul": { latitude: -9.6608, longitude: 20.3894 },
  Malanje: { latitude: -9.5402, longitude: 16.341 },
  Moxico: { latitude: -11.7833, longitude: 19.9167 },
  Namibe: { latitude: -15.1961, longitude: 12.1522 },
  Uíge: { latitude: -7.6087, longitude: 15.0613 },
  Zaire: { latitude: -6.2667, longitude: 12.3667 },
};

/** Coordenada do produtor: centróide da província com desvio estável por índice. */
const operatorCoordinate = (province: string, index: number) => {
  const base = PROVINCE_CENTROIDS[province] ?? { latitude: -11.2, longitude: 17.87 };
  const offset = ((index % 5) - 2) * 0.12;
  return { latitude: base.latitude + offset, longitude: base.longitude + offset / 2 };
};

/* --------------------------------------------------------------- entidades */

const operatorsEntity: EntityConfig<ForestOperatorDto> = {
  key: "operadores",
  label: "Operadores florestais",
  singular: "Operador",
  group: "Registo florestal",
  icon: Building2,
  rows: idf.operators,
  id: (r) => r.id,
  title: (r) => r.legalName,
  subtitle: (r) => r.taxIdentificationNumber,
  status: (r) => r.status,
  searchText: (r) => `${r.legalName} ${r.taxIdentificationNumber} ${r.address.province}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Active", "Approved", "Submitted", "Suspended", "Rejected", "Draft"],
      match: (r, v) => r.status === v,
    },
    {
      key: "tipo",
      label: "Tipo",
      options: ["Individual", "Company", "Cooperative", "PublicEntity"],
      match: (r, v) => r.type === v,
    },
  ],
  columns: [
    { key: "name", label: "Operador", render: (r) => bold(r.legalName) },
    { key: "nif", label: "NIF", render: (r) => r.taxIdentificationNumber },
    { key: "type", label: "Tipo", hideOnMobile: true, render: (r) => statusLabel(r.type) },
    { key: "prov", label: "Província", hideOnMobile: true, render: (r) => r.address.province },
  ],
  sections: (r) => {
    const concessions = idf.concessions().filter((item) => item.forestOperatorId === r.id);
    const concessionIds = new Set(concessions.map((item) => item.id));
    const concessionCodes = new Set(concessions.map((item) => item.code));
    const inventories = idf.inventories().filter((item) => concessionIds.has(item.concessionId));
    const plans = idf.managementPlans().filter((item) => concessionIds.has(item.concessionId));
    const quotas = idf.quotas().filter((item) => concessionIds.has(item.concessionId));
    const licenses = idf.licenses().filter((item) => concessionIds.has(item.concessionId));
    const operations = idf.operations().filter((item) => concessionIds.has(item.concessionId));
    const operationIds = new Set(operations.map((item) => item.id));
    const logs = idf.logs().filter((item) => operationIds.has(item.operationId));
    const lots = idf.lots().filter((item) => concessionIds.has(item.concessionId));
    const lotIds = new Set(lots.map((item) => item.id));
    const guides = idf.transitGuides().filter((item) => lotIds.has(item.lotId));
    const certificates = idf.certificates().filter((item) => lotIds.has(item.lotId));
    const exports = idf.exportProcesses().filter((item) => lotIds.has(item.lotId));
    const inspections = idf.inspections().filter((item) =>
      (item.targetType === "Concession" && concessionCodes.has(item.targetReference)) ||
      (item.targetType === "Operator" && [r.id, r.legalName, r.taxIdentificationNumber].includes(item.targetReference)),
    );
    const enforcement = [
      ...idf.enforcementCases().filter((item) => item.forestOperatorId === r.id),
      ...idf.enforcementRecords().filter((item) => item.operatorId === r.id || item.operatorName === r.legalName),
    ];
    const sourceIds = new Set([
      ...licenses.map((item) => item.id),
      ...guides.map((item) => item.id),
      ...enforcement.map((item) => item.id),
    ]);
    const revenue = idf.revenue().filter((item) => sourceIds.has(item.sourceId));
    const paid = revenue.filter((item) => item.status === "Paid");
    const unpaid = revenue.filter((item) => item.status !== "Paid");
    const phases = concessions.flatMap((concession) => PROCESS_PHASES.map((phase, index) => ({
      concession: concession.code,
      ...phase,
      status: concession.status === "Active" || index < 3 ? "Concluída" : concession.status === "Submitted" && index === 0 ? "Concluída" : "Pendente",
      signedBy: concession.status === "Active" && [3, 4, 5, 7].includes(index)
        ? (["Governador Provincial", "Direcção Nacional de Florestas", "Ministro da Agricultura e Florestas", "Director-Geral do IDF"][index === 3 ? 0 : index === 4 ? 1 : index === 5 ? 2 : 3])
        : "—",
      signedAt: concession.status === "Active" && [3, 4, 5, 7].includes(index)
        ? ["2025-02-12", "2025-02-26", "2025-03-11", "2025-09-22"][index === 3 ? 0 : index === 4 ? 1 : index === 5 ? 2 : 3]
        : "—",
      document: {
        id: `${concession.id}-${phase.key}`,
        title: phase.label,
        category: ["D", "E", "F"].includes(phase.key) ? "Parecer e decisão" : phase.key === "H" ? "Contrato e activação" : "Documento de tramitação",
        fileName: `${phase.key.toLowerCase()}-${phase.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-")}-${concession.code.toLowerCase()}.pdf`,
        status: concession.status === "Active" || index < 3 ? "Validado" : "Pendente",
        date: concession.status === "Active" ? `2025-${String(Math.min(index + 2, 9)).padStart(2, "0")}-${String(10 + index).padStart(2, "0")}` : undefined,
        signedBy: concession.status === "Active" && [3, 4, 5, 7].includes(index)
          ? (["Governador Provincial", "Direcção Nacional de Florestas", "Ministro da Agricultura e Florestas", "Director-Geral do IDF"][index === 3 ? 0 : index === 4 ? 1 : index === 5 ? 2 : 3])
          : undefined,
        reference: `${concession.code}/${phase.key}`,
      },
    })));
    const concessionCards = concessions.map((concession) => ({
      id: concession.id,
      code: concession.code,
      type: concession.type,
      area: concession.areaHectares,
      validity: period(concession.validityPeriod),
      status: concession.status,
      instruments: inventories.filter((item) => item.concessionId === concession.id).length + plans.filter((item) => item.concessionId === concession.id).length + quotas.filter((item) => item.concessionId === concession.id).length + licenses.filter((item) => item.concessionId === concession.id).length,
      documents: PROCESS_PHASES.length + (concession.status === "Active" ? 1 : 0),
    }));
    const archiveDocuments: DossierDocument[] = [
      ...r.documents.map((document, index) => ({
        id: `operator-${r.id}-${index}`,
        title: document.documentType,
        category: "Documento obrigatório",
        fileName: document.fileReference?.fileName ?? `documento-em-falta-${index + 1}.pdf`,
        size: fileSize(document.fileReference?.size),
        status: document.fileReference ? "Validado" : "Em falta",
        reference: r.taxIdentificationNumber,
      })),
      ...phases.map((phase) => phase.document),
      ...concessions.filter((concession) => concession.status === "Active").map((concession) => ({
        id: `contract-${concession.id}`,
        title: `Contrato de concessão ${concession.code}`,
        category: "Contrato assinado",
        fileName: `contrato-${concession.code.toLowerCase()}-assinado.pdf`,
        status: "Assinado",
        date: "2025-09-22",
        signedBy: "Director-Geral do IDF e operador",
        reference: concession.code,
      })),
      ...plans.filter((plan) => plan.technicalReport).map((plan) => ({
        id: `report-${plan.id}`,
        title: `Relatório técnico — ${plan.code}`,
        category: "Instrumento técnico",
        fileName: plan.technicalReport?.fileName ?? `relatorio-${plan.code}.pdf`,
        size: fileSize(plan.technicalReport?.size),
        status: "Validado",
        reference: plan.code,
      })),
      ...exports.filter((item) => item.contractFile).map((item) => ({
        id: `export-contract-${item.id}`,
        title: `Contrato de exportação — ${item.code}`,
        category: "Contrato comercial",
        fileName: item.contractFile?.fileName ?? `contrato-${item.code}.pdf`,
        size: fileSize(item.contractFile?.size),
        status: "Validado",
        reference: item.code,
      })),
      ...revenue.filter((item) => item.paymentProof).map((item) => ({
        id: `payment-${item.id}`,
        title: `Comprovativo de pagamento — ${item.code}`,
        category: "Comprovativo financeiro",
        fileName: item.paymentProof?.fileName ?? `comprovativo-${item.code}.pdf`,
        size: fileSize(item.paymentProof?.size),
        status: "Pago",
        date: item.paidAt,
        reference: item.code,
      })),
    ];
    const productiveRows = [
      ...inventories.map((item) => ({ type: "Inventário", reference: item.code, detail: `${item.trees.length} árvores · ${m3(item.trees.reduce((sum, tree) => sum + tree.volume.value, 0))}`, status: item.status })),
      ...plans.map((item) => ({ type: "Plano de maneio", reference: item.code, detail: period(item.validityPeriod), status: item.status })),
      ...quotas.map((item) => ({ type: "Quota", reference: item.code, detail: `${m3(item.consumedVolume.value)} de ${m3(item.authorizedVolume.value)}`, status: item.status })),
      ...licenses.map((item) => ({ type: "Licença", reference: item.code, detail: `${m3(item.authorizedVolume.value)} · ${period(item.validityPeriod)}`, status: item.status })),
      ...operations.map((item) => ({ type: "Exploração", reference: item.code, detail: `${item.harvestedTrees.length} árvores abatidas`, status: item.status })),
      ...lots.map((item) => ({ type: "Lote", reference: item.code, detail: `${item.logIds.length} toros · ${m3(item.totalVolume.value)}`, status: item.status })),
    ];
    const circulationRows = [
      ...guides.map((item) => ({ type: "Guia de trânsito", reference: item.guideNumber, detail: `${item.originProvince} → ${item.destinationProvince}`, status: item.status })),
      ...certificates.map((item) => ({ type: "Certificado", reference: item.code, detail: statusLabel(item.type), status: item.status })),
      ...exports.map((item) => ({ type: "Exportação", reference: item.code, detail: `${item.destinationCountry} · ${m3(item.volume.value)}`, status: item.status })),
    ];
    const consumptionRows: ConsumptionRecord[] = concessions.flatMap((concession) => {
      const concessionQuotas = quotas.filter((quota) => quota.concessionId === concession.id);
      return concessionQuotas.map((quota) => ({
        id: quota.id,
        concession: concession.code,
        quota: `${quota.code} · ${quota.year}`,
        contracted: quota.authorizedVolume.value,
        consumed: quota.consumedVolume.value,
        remaining: Math.max(0, quota.authorizedVolume.value - quota.consumedVolume.value),
        status: quota.status,
      }));
    });

    return [
      {
        tab: "Resumo",
        title: "Identificação e situação cadastral",
        description: "Dados oficiais e enquadramento actual do operador florestal.",
        fields: [
          { label: "Designação", value: r.legalName },
          { label: "NIF", value: r.taxIdentificationNumber },
          { label: "Tipo", value: statusLabel(r.type) },
          { label: "Estado", value: <StatusBadge status={r.status} /> },
          { label: "Província", value: r.address.province },
          { label: "Município", value: r.address.municipality },
          { label: "Comuna", value: r.address.commune ?? "—" },
          { label: "Morada", value: r.address.street, full: true },
        ],
      },
      {
        tab: "Resumo",
        title: "Contactos",
        table: {
          columns: [
            { key: "n", label: "Nome", render: (c: any) => c.name },
            { key: "e", label: "Email", render: (c: any) => c.email },
            { key: "t", label: "Telefone", render: (c: any) => c.phoneNumber ?? "—" },
            { key: "p", label: "Principal", render: (c: any) => (c.isPrimary ? "Sim" : "Não") },
          ],
          rows: r.contacts,
        },
      },
      {
        tab: "Consumo",
        title: "Consumo de volume contratado",
        description: "Controlo consolidado do volume autorizado, consumido e ainda disponível em metros cúbicos.",
        content: <ConsumptionOverview rows={consumptionRows} />,
      },
      {
        tab: "Financeiro",
        title: "Dados financeiros e dívidas",
        description: "Resumo integral das cobranças do operador, valores liquidados e montantes por regularizar.",
        content: <FinancialOverview paid={paid} unpaid={unpaid} />,
      },
      {
        tab: "Documentos",
        title: "Documentos obrigatórios",
        description: `Dossiê documental completo: ${r.documents.length} de 9 documentos disponíveis para consulta.`,
        content: <DossierArchive documents={archiveDocuments.filter((document) => document.category === "Documento obrigatório")} />,
      },
      {
        tab: "Concessões",
        title: "Concessões",
        description: "Todos os direitos de concessão associados ao operador.",
        content: <ConcessionCards concessions={concessionCards} />,
      },
      {
        tab: "Tramitação",
        title: "Tramitação, pareceres e assinaturas",
        description: "Fases A–H, decisões formais e assinaturas registadas em cada concessão.",
        content: <ProcessPhaseFlow phases={phases} />,
      },
      {
        tab: "Arquivo",
        title: "Arquivo documental e decisório",
        description: "Cópias de contratos assinados, pareceres, decisões, requerimentos, comprovativos e documentos trocados durante toda a relação do operador com o IDF.",
        content: <DossierArchive documents={archiveDocuments} />,
      },
      {
        tab: "Produção",
        title: "Gestão, exploração e produção",
        description: `Visão consolidada de ${logs.length} toros e de todos os instrumentos produtivos do operador.`,
        table: {
          columns: [
            { key: "t", label: "Tipo", render: (item: any) => item.type },
            { key: "r", label: "Referência", render: (item: any) => bold(item.reference) },
            { key: "d", label: "Detalhe", render: (item: any) => item.detail },
            { key: "s", label: "Estado", render: (item: any) => <StatusBadge status={item.status} /> },
          ],
          rows: productiveRows,
        },
      },
      {
        tab: "Circulação",
        title: "Circulação, certificação e exportação",
        table: {
          columns: [
            { key: "t", label: "Tipo", render: (item: any) => item.type },
            { key: "r", label: "Referência", render: (item: any) => bold(item.reference) },
            { key: "d", label: "Detalhe", render: (item: any) => item.detail },
            { key: "s", label: "Estado", render: (item: any) => <StatusBadge status={item.status} /> },
          ],
          rows: circulationRows,
        },
      },
      {
        tab: "Fiscalização",
        title: "Inspecções",
        table: {
          columns: [
            { key: "c", label: "Inspecção", render: (item: any) => bold(item.code) },
            { key: "a", label: "Alvo", render: (item: any) => `${statusLabel(item.targetType)} · ${item.targetReference}` },
            { key: "i", label: "Inspector", render: (item: any) => item.inspectorName },
            { key: "n", label: "Constatações", render: (item: any) => item.findings.length },
            { key: "s", label: "Estado", render: (item: any) => <StatusBadge status={item.status} /> },
          ],
          rows: inspections,
        },
      },
      {
        tab: "Fiscalização",
        title: "Infracções e processos de fiscalização",
        description: "Histórico integral, incluindo processos sanados, arquivados, em curso e em execução.",
        table: {
          columns: [
            { key: "c", label: "Processo", render: (item: any) => bold(item.code) },
            { key: "a", label: "Assunto / infracção", render: (item: any) => item.subject ?? item.violations?.map((violation: any) => violation.description).join("; ") ?? "—" },
            { key: "d", label: "Abertura", render: (item: any) => item.openedAt ?? item.openedDate },
            { key: "m", label: "Multa", render: (item: any) => aoa(item.fineAmount ?? item.fines?.reduce((sum: number, fine: any) => sum + fine.amount, 0) ?? 0) },
            { key: "e", label: "Estado", render: (item: any) => <StatusBadge status={item.phase ?? item.status} /> },
          ],
          rows: enforcement,
        },
      },
    ];
  },
};

const areasEntity: EntityConfig<AreaRegistryDto> = {
  key: "areas",
  label: "Registo de área",
  singular: "Área",
  group: "Registo florestal",
  icon: MapIcon,
  rows: idf.areas,
  id: (r) => r.id,
  title: (r) => r.designation,
  subtitle: (r) => r.code,
  status: (r) => r.verdict,
  searchText: (r) => `${r.code} ${r.designation} ${r.province} ${r.municipality}`,
  filters: [
    {
      key: "verdict",
      label: "Veredicto",
      options: ["Conforme", "ConformeComReserva", "NaoConforme"],
      match: (r, v) => r.verdict === v,
    },
    {
      key: "prov",
      label: "Província",
      options: [...new Set(idf.areas().map((a) => a.province))],
      match: (r, v) => r.province === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "des", label: "Designação", render: (r) => r.designation },
    { key: "ha", label: "Área (ha)", render: (r) => r.areaHectares.toLocaleString("pt-AO") },
    { key: "loc", label: "Localização", hideOnMobile: true, render: (r) => `${r.province} · ${r.municipality}` },
  ],
  sections: (r) => {
    const occ = idf.areaOccupancy(r.id, r.areaHectares);
    return [
      {
        title: "Área registada",
        fields: [
          { label: "Código", value: r.code },
          { label: "Designação", value: r.designation },
          { label: "Área", value: `${r.areaHectares.toLocaleString("pt-AO")} ha` },
          { label: "Província", value: r.province },
          { label: "Município", value: r.municipality },
          { label: "Situação jurídica", value: r.legalSituation },
          { label: "Vértices do polígono", value: r.polygon.length },
          { label: "Croqui", value: r.sketchFile?.fileName ?? "—" },
          { label: "Memória descritiva", value: r.descriptiveMemoryFile?.fileName ?? "—" },
        ],
      },
      {
        title: "Ocupação",
        fields: [
          { label: "Ocupado", value: `${occ.occupiedHectares.toLocaleString("pt-AO")} ha` },
          { label: "Disponível", value: `${occ.availableHectares.toLocaleString("pt-AO")} ha` },
          { label: "Taxa de ocupação", value: `${occ.usagePercent.toFixed(1)}%` },
        ],
      },
      {
        title: "Análise de sobreposições",
        table: {
          columns: [
            { key: "l", label: "Camada", render: (o: any) => o.layer },
            { key: "r", label: "Resultado", render: (o: any) => <StatusBadge status={o.verdict ?? o.result} /> },
            { key: "n", label: "Nota", render: (o: any) => o.note ?? o.detail ?? "—" },
          ],
          rows: r.overlaps,
        },
      },
      {
        title: "Ligações",
        links: occ.concessions.map((c) => ({ label: `Concessão ${c.code}`, entity: "concessoes", id: c.id })),
      },
    ];
  },
};

const concessionsEntity: EntityConfig<ConcessionDto> = {
  key: "concessoes",
  label: "Concessões",
  singular: "Concessão",
  group: "Registo florestal",
  icon: TreePine,
  rows: idf.concessions,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => opName(r.forestOperatorId),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${opName(r.forestOperatorId)}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Draft", "Submitted", "UnderReview", "Approved", "Active", "Rejected", "Expired"],
      match: (r, v) => r.status === v,
    },
    {
      key: "tipo",
      label: "Tipo",
      options: ["ForestConcession", "CommunityForest", "Other"],
      match: (r, v) => r.type === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "op", label: "Operador", render: (r) => opName(r.forestOperatorId) },
    { key: "ha", label: "Área (ha)", render: (r) => r.areaHectares.toLocaleString("pt-AO") },
    { key: "val", label: "Validade", hideOnMobile: true, render: (r) => period(r.validityPeriod) },
  ],
  sections: (r) => {
    const area = idf.findArea(r.areaRegistryId);
    return [
      {
        title: "Concessão",
        fields: [
          { label: "Código", value: r.code },
          { label: "Operador", value: opName(r.forestOperatorId) },
          { label: "Tipo", value: statusLabel(r.type) },
          { label: "Via de atribuição", value: r.grantRoute ?? "—" },
          { label: "Área", value: `${r.areaHectares.toLocaleString("pt-AO")} ha` },
          { label: "Validade", value: period(r.validityPeriod) },
          { label: "Área registada", value: area ? `${area.code} — ${area.designation}` : "—" },
          {
            label: "Coordenada central",
            value: r.center ? `${r.center.latitude}, ${r.center.longitude}` : "—",
          },
        ],
      },
      {
        title: "Instrumentos e operações ligadas",
        table: {
          columns: [
            { key: "t", label: "Instrumento", render: (i: any) => i.tipo },
            { key: "c", label: "Referência", render: (i: any) => i.code },
            { key: "s", label: "Estado", render: (i: any) => <StatusBadge status={i.status} /> },
          ],
          rows: [
            ...idf.inventories().filter((i) => i.concessionId === r.id).map((i) => ({ tipo: "Inventário", ...i })),
            ...idf.managementPlans().filter((p) => p.concessionId === r.id).map((p) => ({ tipo: "Plano de maneio", ...p })),
            ...idf.quotas().filter((q) => q.concessionId === r.id).map((q) => ({ tipo: "Quota", ...q })),
            ...idf.licenses().filter((l) => l.concessionId === r.id).map((l) => ({ tipo: "Licença", ...l })),
          ],
        },
      },
      {
        title: "Ligações",
        links: [
          { label: `Operador: ${opName(r.forestOperatorId)}`, entity: "operadores", id: r.forestOperatorId },
          ...(area ? [{ label: `Área ${area.code}`, entity: "areas", id: area.id }] : []),
        ],
      },
    ];
  },
};

const licensingEntity: EntityConfig<LicensingRecord> = {
  key: "licenciamento",
  label: "Licenciamento",
  singular: "Licença de campanha",
  group: "Registo florestal",
  icon: FileSignature,
  rows: idf.licensingRecords,
  id: (r) => r.id,
  title: (r) => r.licenseNumber,
  subtitle: (r) => r.applicantName,
  status: (r) => r.status,
  searchText: (r) => `${r.licenseNumber} ${r.applicantName} ${r.productLabel} ${r.province}`,
  filters: [
    {
      key: "kind",
      label: "Tipo",
      options: ["forestry", "pfnl", "fauna", "apiculture"],
      match: (r, v) => r.kind === v,
    },
    {
      key: "prov",
      label: "Província",
      options: [...new Set(idf.licensingRecords().map((r) => r.province))],
      match: (r, v) => r.province === v,
    },
  ],
  columns: [
    { key: "num", label: "N.º de licença", render: (r) => bold(r.licenseNumber) },
    { key: "req", label: "Requerente", render: (r) => r.applicantName },
    { key: "prod", label: "Produto", hideOnMobile: true, render: (r) => r.productLabel },
    { key: "qtd", label: "Quantidade", render: (r) => r.quantityLabel },
  ],
  sections: (r) => [
    {
      title: "Licença",
      fields: [
        { label: "Número", value: r.licenseNumber },
        { label: "Tipo", value: r.kind },
        { label: "Requerente", value: r.applicantName },
        { label: "Contacto", value: r.applicantContact },
        { label: "Província", value: r.province },
        { label: "Produto", value: r.productLabel },
        { label: "Quantidade autorizada", value: r.quantityLabel },
        { label: "Taxa", value: aoa(r.feeAmount) },
        { label: "Pagamento confirmado", value: r.paymentConfirmed ? "Sim" : "Não" },
        { label: "Emitida em", value: r.issuedAt ?? "—" },
        { label: "Válida até", value: r.validUntil },
        { label: "Código de verificação", value: r.verificationCode ?? "—" },
      ],
    },
    ...(r.kind === "forestry"
      ? [
          {
            title: "Espécies e limites de abate",
            table: {
              columns: [
                { key: "sp", label: "Espécie", render: (s: any) => s.speciesName },
                { key: "v", label: "Volume", render: (s: any) => m3(s.volumeM3) },
                { key: "t", label: "Árvores", render: (s: any) => s.treeCount },
                { key: "l", label: "Limite de abate", render: (s: any) => `${s.fellingLimitTrees} árvores` },
              ],
              rows: r.species,
            },
          },
        ]
      : []),
  ],
};

const inventoriesEntity: EntityConfig<ForestInventoryDto> = {
  key: "inventarios",
  label: "Inventários florestais",
  singular: "Inventário",
  group: "Gestão florestal",
  icon: Leaf,
  rows: idf.inventories,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => conCode(r.concessionId),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.responsible} ${conCode(r.concessionId)}`,
  filters: [
    { key: "status", label: "Estado", options: ["Draft", "Submitted", "Validated", "Rejected"], match: (r, v) => r.status === v },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "con", label: "Concessão", render: (r) => conCode(r.concessionId) },
    { key: "date", label: "Levantamento", render: (r) => r.surveyDate },
    { key: "trees", label: "Árvores", hideOnMobile: true, render: (r) => r.trees.length },
  ],
  sections: (r) => [
    {
      title: "Inventário",
      fields: [
        { label: "Código", value: r.code },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Data de levantamento", value: r.surveyDate },
        { label: "Responsável", value: r.responsible },
        { label: "Árvores registadas", value: r.trees.length },
        { label: "Volume total", value: m3(r.trees.reduce((s, t) => s + t.volume.value, 0)) },
      ],
    },
    {
      title: "Árvores",
      table: {
        columns: [
          { key: "c", label: "Código", render: (t: any) => t.code },
          { key: "sp", label: "Espécie", render: (t: any) => t.speciesCode },
          { key: "d", label: "DAP (cm)", render: (t: any) => t.diameter },
          { key: "h", label: "Altura (m)", render: (t: any) => t.height },
          { key: "v", label: "Volume", render: (t: any) => m3(t.volume.value) },
        ],
        rows: r.trees,
      },
    },
    { title: "Ligações", links: [{ label: `Concessão ${conCode(r.concessionId)}`, entity: "concessoes", id: r.concessionId }] },
  ],
};

const plansEntity: EntityConfig<ManagementPlanDto> = {
  key: "planos",
  label: "Planos de maneio",
  singular: "Plano de maneio",
  group: "Gestão florestal",
  icon: ScrollText,
  rows: idf.managementPlans,
  id: (r) => r.id,
  title: (r) => r.title,
  subtitle: (r) => r.code,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.title} ${conCode(r.concessionId)}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Draft", "Submitted", "UnderReview", "Approved", "Rejected"],
      match: (r, v) => r.status === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "t", label: "Título", render: (r) => r.title },
    { key: "con", label: "Concessão", hideOnMobile: true, render: (r) => conCode(r.concessionId) },
    { key: "val", label: "Validade", hideOnMobile: true, render: (r) => period(r.validityPeriod) },
  ],
  sections: (r) => [
    {
      title: "Plano",
      fields: [
        { label: "Código", value: r.code },
        { label: "Título", value: r.title },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Validade", value: period(r.validityPeriod) },
        { label: "Relatório técnico", value: r.technicalReport?.fileName ?? "—" },
      ],
    },
    {
      title: "Talhões de corte",
      table: {
        columns: [
          { key: "c", label: "Código", render: (a: any) => a.code },
          { key: "ha", label: "Área (ha)", render: (a: any) => a.areaHectares },
          { key: "v", label: "Volume previsto", render: (a: any) => m3(a.plannedVolume.value) },
          { key: "y", label: "Ano do ciclo", render: (a: any) => a.cycleYear },
        ],
        rows: r.cuttingAreas,
      },
    },
    { title: "Ligações", links: [{ label: `Concessão ${conCode(r.concessionId)}`, entity: "concessoes", id: r.concessionId }] },
  ],
};

const quotasEntity: EntityConfig<ForestQuotaDto> = {
  key: "quotas",
  label: "Quotas",
  singular: "Quota",
  group: "Gestão florestal",
  icon: Layers,
  rows: idf.quotas,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${conCode(r.concessionId)} · ${r.year}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${conCode(r.concessionId)} ${r.year}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Draft", "Submitted", "Approved", "Consumed", "Rejected"],
      match: (r, v) => r.status === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "con", label: "Concessão", render: (r) => conCode(r.concessionId) },
    { key: "aut", label: "Autorizado", render: (r) => m3(r.authorizedVolume.value) },
    { key: "con2", label: "Consumido", hideOnMobile: true, render: (r) => m3(r.consumedVolume.value) },
  ],
  sections: (r) => [
    {
      title: "Quota",
      fields: [
        { label: "Código", value: r.code },
        { label: "Ano", value: r.year },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Volume autorizado", value: m3(r.authorizedVolume.value) },
        { label: "Volume consumido", value: m3(r.consumedVolume.value) },
        { label: "Saldo", value: m3(r.authorizedVolume.value - r.consumedVolume.value) },
      ],
    },
    { title: "Ligações", links: [{ label: `Concessão ${conCode(r.concessionId)}`, entity: "concessoes", id: r.concessionId }] },
  ],
};

const licensesEntity: EntityConfig<ForestLicenseDto> = {
  key: "licencas",
  label: "Licenças de corte",
  singular: "Licença",
  group: "Gestão florestal",
  icon: FileCheck2,
  rows: idf.licenses,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => conCode(r.concessionId),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${conCode(r.concessionId)}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Requested", "Issued", "Active", "Suspended", "Expired"],
      match: (r, v) => r.status === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "con", label: "Concessão", render: (r) => conCode(r.concessionId) },
    { key: "vol", label: "Volume", render: (r) => m3(r.authorizedVolume.value) },
    { key: "taxa", label: "Taxa", hideOnMobile: true, render: (r) => aoa(r.feeAmount) },
  ],
  sections: (r) => [
    {
      title: "Licença",
      fields: [
        { label: "Código", value: r.code },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Volume autorizado", value: m3(r.authorizedVolume.value) },
        { label: "Taxa", value: aoa(r.feeAmount) },
        { label: "Validade", value: period(r.validityPeriod) },
        { label: "Transacção de receita", value: r.revenueTransactionId ?? "—" },
      ],
    },
    { title: "Ligações", links: [{ label: `Concessão ${conCode(r.concessionId)}`, entity: "concessoes", id: r.concessionId }] },
  ],
};

const operationsEntity: EntityConfig<ExploitationOperationDto> = {
  key: "exploracao",
  label: "Operações de exploração",
  singular: "Operação",
  group: "Produção",
  icon: TreePine,
  rows: idf.operations,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => conCode(r.concessionId),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.teamLeader} ${conCode(r.concessionId)}`,
  filters: [
    { key: "status", label: "Estado", options: ["Draft", "Active", "Completed"], match: (r, v) => r.status === v },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "con", label: "Concessão", render: (r) => conCode(r.concessionId) },
    { key: "chefe", label: "Chefe de equipa", hideOnMobile: true, render: (r) => r.teamLeader },
    { key: "arv", label: "Árvores abatidas", render: (r) => r.harvestedTrees.length },
  ],
  sections: (r) => [
    {
      title: "Operação",
      fields: [
        { label: "Código", value: r.code },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Início", value: r.startDate },
        { label: "Chefe de equipa", value: r.teamLeader },
        { label: "Volume abatido", value: m3(r.harvestedTrees.reduce((s, t) => s + t.volume.value, 0)) },
      ],
    },
    {
      title: "Árvores abatidas",
      table: {
        columns: [
          { key: "c", label: "Árvore", render: (t: any) => t.treeCode },
          { key: "sp", label: "Espécie", render: (t: any) => t.speciesCode },
          { key: "v", label: "Volume", render: (t: any) => m3(t.volume.value) },
          { key: "d", label: "Data", render: (t: any) => t.harvestDate },
        ],
        rows: r.harvestedTrees,
      },
    },
    { title: "Ligações", links: [{ label: `Concessão ${conCode(r.concessionId)}`, entity: "concessoes", id: r.concessionId }] },
  ],
};

const logsEntity: EntityConfig<LogDto> = {
  key: "toros",
  label: "Toros",
  singular: "Toro",
  group: "Produção",
  icon: Package,
  rows: idf.logs,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => r.speciesCode,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.speciesCode}`,
  filters: [{ key: "status", label: "Estado", options: ["Registered", "InLot"], match: (r, v) => r.status === v }],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "sp", label: "Espécie", render: (r) => r.speciesCode },
    { key: "v", label: "Volume", render: (r) => m3(r.volume.value) },
    { key: "lote", label: "Lote", hideOnMobile: true, render: (r) => idf.findLot(r.lotId)?.code ?? "—" },
  ],
  sections: (r) => [
    {
      title: "Toro",
      fields: [
        { label: "Código", value: r.code },
        { label: "Espécie", value: r.speciesCode },
        { label: "Comprimento", value: `${r.length} m` },
        { label: "Diâmetro", value: `${r.diameter} cm` },
        { label: "Volume", value: m3(r.volume.value) },
        { label: "Operação", value: idf.findOperation(r.operationId)?.code ?? "—" },
        { label: "Lote", value: idf.findLot(r.lotId)?.code ?? "—" },
      ],
    },
    {
      title: "Ligações",
      links: [
        { label: `Operação ${idf.findOperation(r.operationId)?.code ?? ""}`, entity: "exploracao", id: r.operationId },
        ...(r.lotId ? [{ label: `Lote ${idf.findLot(r.lotId)?.code ?? ""}`, entity: "lotes", id: r.lotId }] : []),
      ],
    },
  ],
};

const forestLotsEntity: EntityConfig<ForestLotDto> = {
  key: "lotes",
  label: "Lotes de madeira",
  singular: "Lote",
  group: "Produção",
  icon: Layers,
  rows: idf.lots,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => conCode(r.concessionId),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${conCode(r.concessionId)}`,
  filters: [{ key: "status", label: "Estado", options: ["Open", "Closed"], match: (r, v) => r.status === v }],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "con", label: "Concessão", render: (r) => conCode(r.concessionId) },
    { key: "toros", label: "Toros", render: (r) => r.logIds.length },
    { key: "v", label: "Volume", hideOnMobile: true, render: (r) => m3(r.totalVolume.value) },
  ],
  sections: (r) => [
    {
      title: "Lote",
      fields: [
        { label: "Código", value: r.code },
        { label: "Concessão", value: conCode(r.concessionId) },
        { label: "Operação", value: idf.findOperation(r.operationId)?.code ?? "—" },
        { label: "Toros", value: r.logIds.length },
        { label: "Volume total", value: m3(r.totalVolume.value) },
      ],
    },
    {
      title: "Toros do lote",
      table: {
        columns: [
          { key: "c", label: "Código", render: (l: any) => l.code },
          { key: "sp", label: "Espécie", render: (l: any) => l.speciesCode },
          { key: "v", label: "Volume", render: (l: any) => m3(l.volume.value) },
        ],
        rows: idf.logs().filter((l) => l.lotId === r.id),
      },
    },
    {
      title: "Ligações",
      links: idf
        .transitGuides()
        .filter((g) => g.lotId === r.id)
        .map((g) => ({ label: `Guia ${g.guideNumber}`, entity: "guias", id: g.id })),
    },
  ],
};

const guidesEntity: EntityConfig<TransitGuideDto> = {
  key: "guias",
  label: "Guias de trânsito",
  singular: "Guia",
  group: "Circulação",
  icon: Truck,
  rows: idf.transitGuides,
  id: (r) => r.id,
  title: (r) => r.guideNumber,
  subtitle: (r) => `${r.origin} → ${r.destination}`,
  status: (r) => r.status,
  searchText: (r) => `${r.guideNumber} ${r.transporter} ${r.vehiclePlate} ${r.origin} ${r.destination}`,
  filters: [
    { key: "status", label: "Estado", options: ["Draft", "Issued", "Completed"], match: (r, v) => r.status === v },
    { key: "prod", label: "Produto", options: ["RoundWood", "SawnWood"], match: (r, v) => r.productType === v },
  ],
  columns: [
    { key: "num", label: "Guia", render: (r) => bold(r.guideNumber) },
    { key: "rota", label: "Rota", render: (r) => `${r.originProvince} → ${r.destinationProvince}` },
    { key: "transp", label: "Transportador", hideOnMobile: true, render: (r) => r.transporter },
    { key: "mat", label: "Matrícula", render: (r) => r.vehiclePlate },
  ],
  sections: (r) => [
    {
      title: "Guia de trânsito",
      fields: [
        { label: "Número", value: r.guideNumber },
        { label: "Produto", value: r.productType },
        { label: "Origem", value: `${r.origin} (${r.originProvince})` },
        { label: "Destino", value: `${r.destination} (${r.destinationProvince})` },
        { label: "Transportador", value: r.transporter },
        { label: "Matrícula", value: r.vehiclePlate },
        { label: "Data de partida", value: r.departureDate },
        { label: "Lote", value: idf.findLot(r.lotId)?.code ?? "—" },
      ],
    },
    { title: "Ligações", links: [{ label: `Lote ${idf.findLot(r.lotId)?.code ?? ""}`, entity: "lotes", id: r.lotId }] },
  ],
};

const warehousesEntity: EntityConfig<WarehouseDto> = {
  key: "entrepostos",
  label: "Entrepostos",
  singular: "Entreposto",
  group: "Circulação",
  icon: Warehouse,
  rows: idf.warehouses,
  id: (r) => r.id,
  title: (r) => r.name,
  subtitle: (r) => r.code,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.name} ${r.address.province}`,
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "n", label: "Entreposto", render: (r) => r.name },
    { key: "f", label: "Stock físico", render: (r) => m3(r.physicalStock) },
    { key: "d", label: "Stock documental", hideOnMobile: true, render: (r) => m3(r.documentaryStock) },
  ],
  sections: (r) => [
    {
      title: "Entreposto",
      fields: [
        { label: "Código", value: r.code },
        { label: "Nome", value: r.name },
        { label: "Província", value: r.address.province },
        { label: "Município", value: r.address.municipality },
        { label: "Stock físico", value: m3(r.physicalStock) },
        { label: "Stock documental", value: m3(r.documentaryStock) },
        { label: "Divergência", value: m3(r.physicalStock - r.documentaryStock) },
      ],
    },
    {
      title: "Movimentos",
      table: {
        columns: [
          { key: "t", label: "Tipo", render: (m: any) => m.type },
          { key: "l", label: "Lote", render: (m: any) => idf.findLot(m.lotId)?.code ?? m.lotId },
          { key: "v", label: "Volume", render: (m: any) => m3(m.volume.value) },
          { key: "d", label: "Data", render: (m: any) => m.movementDate },
        ],
        rows: r.movements,
      },
    },
  ],
};

const certificatesEntity: EntityConfig<ForestCertificateDto> = {
  key: "certificados",
  label: "Certificados",
  singular: "Certificado",
  group: "Circulação",
  icon: Award,
  rows: idf.certificates,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => statusLabel(r.type),
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.type}`,
  filters: [
    {
      key: "tipo",
      label: "Tipo",
      options: ["Origin", "Legality", "Phytosanitary", "Sustainability", "ProductInStorage"],
      match: (r, v) => r.type === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "t", label: "Tipo", render: (r) => statusLabel(r.type) },
    { key: "l", label: "Lote", hideOnMobile: true, render: (r) => idf.findLot(r.lotId)?.code ?? "—" },
    { key: "v", label: "Validade", render: (r) => period(r.validityPeriod) },
  ],
  sections: (r) => [
    {
      title: "Certificado",
      fields: [
        { label: "Código", value: r.code },
        { label: "Tipo", value: statusLabel(r.type) },
        { label: "Lote", value: idf.findLot(r.lotId)?.code ?? "—" },
        { label: "Validade", value: period(r.validityPeriod) },
        { label: "Coordenada", value: r.coordinate ? `${r.coordinate.latitude}, ${r.coordinate.longitude}` : "—" },
      ],
    },
    { title: "Ligações", links: [{ label: `Lote ${idf.findLot(r.lotId)?.code ?? ""}`, entity: "lotes", id: r.lotId }] },
  ],
};

const inspectionsEntity: EntityConfig<InspectionDto> = {
  key: "inspeccoes",
  label: "Inspecções",
  singular: "Inspecção",
  group: "Controlo",
  icon: ClipboardCheck,
  rows: idf.inspections,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.targetType} · ${r.targetReference}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.inspectorName} ${r.targetReference}`,
  filters: [
    { key: "status", label: "Estado", options: ["Draft", "InProgress", "Completed"], match: (r, v) => r.status === v },
    {
      key: "alvo",
      label: "Alvo",
      options: ["Concession", "Warehouse", "TransitGuide", "Operator"],
      match: (r, v) => r.targetType === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "alvo", label: "Alvo", render: (r) => `${r.targetType} · ${r.targetReference}` },
    { key: "insp", label: "Inspector", hideOnMobile: true, render: (r) => r.inspectorName },
    { key: "d", label: "Data", render: (r) => r.scheduledDate },
  ],
  sections: (r) => [
    {
      title: "Inspecção",
      fields: [
        { label: "Código", value: r.code },
        { label: "Alvo", value: `${r.targetType} — ${r.targetReference}` },
        { label: "Data prevista", value: r.scheduledDate },
        { label: "Inspector", value: r.inspectorName },
        { label: "Coordenada", value: r.coordinate ? `${r.coordinate.latitude}, ${r.coordinate.longitude}` : "—" },
      ],
    },
    {
      title: "Constatações",
      table: {
        columns: [
          { key: "d", label: "Descrição", render: (f: any) => f.description },
          { key: "s", label: "Severidade", render: (f: any) => <StatusBadge status={f.severity} /> },
          { key: "r", label: "Registada em", render: (f: any) => f.recordedAt },
        ],
        rows: r.findings,
      },
    },
  ],
};

const enforcementEntity: EntityConfig<EnforcementRecordDto> = {
  key: "fiscalizacao",
  label: "Fiscalização",
  singular: "Processo",
  group: "Controlo",
  icon: Gavel,
  rows: idf.enforcementRecords,
  id: (r) => r.id,
  title: (r) => r.code ?? r.id,
  subtitle: (r) => (r as any).operatorName ?? (r as any).subject ?? "",
  status: (r) => (r as any).phase ?? (r as any).status,
  searchText: (r) => JSON.stringify(r),
  columns: [
    { key: "code", label: "Processo", render: (r) => bold(r.code ?? r.id) },
    { key: "fase", label: "Fase", render: (r) => (r as any).phase ?? "—" },
    { key: "auto", label: "Auto", hideOnMobile: true, render: (r) => (r as any).offenceType ?? (r as any).subject ?? "—" },
    { key: "data", label: "Data", render: (r) => (r as any).openedAt ?? (r as any).createdAt ?? "—" },
  ],
  sections: (r) => [
    {
      title: "Processo de fiscalização",
      fields: Object.entries(r)
        .filter(([, v]) => typeof v === "string" || typeof v === "number" || typeof v === "boolean")
        .map(([k, v]) => ({ label: k, value: String(v) })),
    },
  ],
};

const exportsEntity: EntityConfig<ExportProcessDto> = {
  key: "exportacao",
  label: "Exportação",
  singular: "Processo de exportação",
  group: "Controlo",
  icon: Ship,
  rows: idf.exportProcesses,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => `${r.buyer} · ${r.destinationCountry}`,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.buyer} ${r.destinationCountry}`,
  filters: [
    {
      key: "status",
      label: "Estado",
      options: ["Draft", "Submitted", "Authorized", "Rejected"],
      match: (r, v) => r.status === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "dest", label: "Destino", render: (r) => r.destinationCountry },
    { key: "buyer", label: "Comprador", hideOnMobile: true, render: (r) => r.buyer },
    { key: "v", label: "Volume", render: (r) => m3(r.volume.value) },
  ],
  sections: (r) => [
    {
      title: "Exportação",
      fields: [
        { label: "Código", value: r.code },
        { label: "Lote", value: idf.findLot(r.lotId)?.code ?? "—" },
        { label: "País de destino", value: r.destinationCountry },
        { label: "Comprador", value: r.buyer },
        { label: "Volume", value: m3(r.volume.value) },
        { label: "Contrato", value: r.contractFile?.fileName ?? "—" },
      ],
    },
    { title: "Ligações", links: [{ label: `Lote ${idf.findLot(r.lotId)?.code ?? ""}`, entity: "lotes", id: r.lotId }] },
  ],
};

const revenueEntity: EntityConfig<RevenueTransactionDto> = {
  key: "receitas",
  label: "Receitas",
  singular: "Transacção",
  group: "Controlo",
  icon: Banknote,
  rows: idf.revenue,
  id: (r) => r.id,
  title: (r) => r.code,
  subtitle: (r) => r.description,
  status: (r) => r.status,
  searchText: (r) => `${r.code} ${r.description} ${r.sourceType}`,
  filters: [
    { key: "status", label: "Estado", options: ["Pending", "Liquidated", "Paid"], match: (r, v) => r.status === v },
    {
      key: "fonte",
      label: "Fonte",
      options: ["License", "TransitGuide", "Certificate", "Export", "Inspection", "Fine"],
      match: (r, v) => r.sourceType === v,
    },
  ],
  columns: [
    { key: "code", label: "Código", render: (r) => bold(r.code) },
    { key: "f", label: "Fonte", render: (r) => statusLabel(r.sourceType) },
    { key: "d", label: "Descrição", hideOnMobile: true, render: (r) => r.description },
    { key: "a", label: "Montante", render: (r) => aoa(r.amount) },
  ],
  sections: (r) => [
    {
      title: "Transacção",
      fields: [
        { label: "Código", value: r.code },
        { label: "Fonte", value: statusLabel(r.sourceType) },
        { label: "Descrição", value: r.description },
        { label: "Montante", value: `${r.amount.toLocaleString("pt-AO")} ${r.currency}` },
        { label: "Pago em", value: r.paidAt ?? "—" },
        { label: "Comprovativo", value: r.paymentProof?.fileName ?? "—" },
      ],
    },
  ],
};

/* --------------------------------------------------------------- agregados */

const dashboard = (): DashboardData => {
  const lots = idf.lots();
  const totalVolume = lots.reduce((s, l) => s + l.totalVolume.value, 0);
  const authorized = idf.quotas().reduce((s, q) => s + q.authorizedVolume.value, 0);
  const consumed = idf.quotas().reduce((s, q) => s + q.consumedVolume.value, 0);
  const revenueTotal = idf.revenue().reduce((s, t) => s + t.amount, 0);

  const byConcessionStatus = [...new Set(idf.concessions().map((c) => c.status))].map((name) => ({
    name,
    value: idf.concessions().filter((c) => c.status === name).length,
  }));

  const areaByProvince = [...new Set(idf.areas().map((a) => a.province))].map((name) => ({
    name,
    value: idf.areas().filter((a) => a.province === name).reduce((s, a) => s + a.areaHectares, 0),
  }));

  const revenueBySource = [...new Set(idf.revenue().map((t) => t.sourceType))].map((name) => ({
    name,
    value: idf.revenue().filter((t) => t.sourceType === name).reduce((s, t) => s + t.amount, 0),
  }));

  const volumeBySpecies = [...new Set(idf.logs().map((l) => l.speciesCode))].map((name) => ({
    name,
    value: idf.logs().filter((l) => l.speciesCode === name).reduce((s, l) => s + l.volume.value, 0),
  }));

  return {
    cards: [
      { label: "Operadores", value: idf.operators().length, icon: Building2, tone: "primary" },
      { label: "Áreas registadas", value: idf.areas().length, icon: MapIcon, tone: "info" },
      { label: "Concessões", value: idf.concessions().length, icon: TreePine, tone: "success" },
      { label: "Licenciamentos", value: idf.licensingRecords().length, icon: FileSignature, tone: "accent" },
      { label: "Volume em lotes", value: m3(totalVolume), icon: Layers, tone: "primary" },
      { label: "Quota autorizada", value: m3(authorized), icon: FileCheck2, tone: "info" },
      { label: "Quota consumida", value: m3(consumed), icon: Leaf, tone: "warning" },
      { label: "Receita registada", value: aoa(revenueTotal), icon: Banknote, tone: "success" },
    ],
    charts: [
      { title: "Concessões por estado", type: "pie", data: byConcessionStatus },
      { title: "Área registada por província (ha)", type: "bar", data: areaByProvince },
      { title: "Receita por fonte (AOA)", type: "bar", data: revenueBySource },
      { title: "Volume por espécie (m³)", type: "line", data: volumeBySpecies },
    ],
    activity: [
      ...idf.transitGuides().map((g) => ({
        date: g.departureDate,
        label: `Guia ${g.guideNumber}: ${g.origin} → ${g.destination}`,
        type: "Trânsito",
      })),
      ...idf.inspections().map((i) => ({
        date: i.scheduledDate,
        label: `Inspecção ${i.code} — ${i.targetReference}`,
        type: "Controlo",
      })),
      ...idf.exportProcesses().map((e) => ({
        date: e.createdAt.slice(0, 10),
        label: `Exportação ${e.code} para ${e.destinationCountry}`,
        type: "Exportação",
      })),
    ]
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 8),
  };
};

const mapPoints = (): MapPoint[] => [
  ...idf.operators().map((o, index) => {
    const concessions = idf.concessions().filter((c) => c.forestOperatorId === o.id);
    return {
      id: o.id,
      kind: "operator",
      title: o.legalName,
      subtitle: `${o.address.municipality}, ${o.address.province} · ${concessions.length} concessão(ões)`,
      status: o.status,
      coordinate: concessions.find((c) => c.center)?.center ?? operatorCoordinate(o.address.province, index),
      link: `/madeira/operadores/${o.id}`,
    };
  }),
  ...idf
    .concessions()
    .filter((c) => c.center)
    .map((c) => ({
      id: c.id,
      kind: "concession",
      title: c.code,
      subtitle: `${opName(c.forestOperatorId)} · ${c.areaHectares.toLocaleString("pt-AO")} ha`,
      status: c.status,
      coordinate: c.center ?? { latitude: -11.2, longitude: 17.87 },
      link: `/madeira/concessoes/${c.id}`,
    })),
  ...idf
    .areas()
    .filter((a) => a.polygon.length > 0)
    .map((a) => ({
      id: a.id,
      kind: "area",
      title: a.designation,
      subtitle: `${a.code} · ${a.areaHectares.toLocaleString("pt-AO")} ha`,
      status: a.verdict,
      coordinate: { latitude: a.polygon[0][1], longitude: a.polygon[0][0] },
      link: `/madeira/areas/${a.id}`,
    })),
  ...idf
    .inspections()
    .filter((i) => i.coordinate)
    .map((i) => ({
      id: i.id,
      kind: "inspection",
      title: i.code,
      subtitle: `${i.targetType} · ${i.inspectorName}`,
      status: i.status,
      coordinate: i.coordinate ?? { latitude: -11.2, longitude: 17.87 },
      link: `/madeira/inspeccoes/${i.id}`,
    })),
];

const mapAreas = (): MapArea[] => {
  const areas = idf.areas();
  const concessions = idf.concessions();
  const operators = idf.operators();
  return areas.map((area, areaIndex) => {
    const linkedConcessions = concessions.filter((concession, concessionIndex) =>
      concession.areaRegistryId === area.id || (!concession.areaRegistryId && concessionIndex === areaIndex),
    );
    const concessionCount = areaIndex % 2 === 0 ? 4 : 3;
    const mappedConcessions = Array.from({ length: concessionCount }, (_, concessionIndex) => {
      const source = linkedConcessions[concessionIndex] ?? concessions[(areaIndex + concessionIndex) % concessions.length];
      const operator = operators[(areaIndex + concessionIndex) % operators.length];
      const occupiedHectares = Math.round(area.areaHectares * (0.1 + concessionIndex * 0.018));
      const blockCount = concessionIndex % 2 === 0 ? 3 : 4;
      const baseBlockArea = Math.floor(occupiedHectares / blockCount);
      return {
        id: `${area.id}-concession-${concessionIndex + 1}`,
        code: source?.code ? `${source.code.split("-").slice(0, 2).join("-")}-${String(areaIndex + 1).padStart(2, "0")}${concessionIndex + 1}` : `CON-${String(areaIndex + 1).padStart(2, "0")}${concessionIndex + 1}`,
        operator: operator?.legalName ?? `Operador florestal ${concessionIndex + 1}`,
        occupiedHectares,
        status: source?.status ?? "Active",
        blocks: Array.from({ length: blockCount }, (_, blockIndex) => ({
          code: `Bloco ${String.fromCharCode(65 + blockIndex)}`,
          hectares: blockIndex === blockCount - 1 ? occupiedHectares - baseBlockArea * (blockCount - 1) : baseBlockArea,
        })),
      };
    });
    return {
      id: area.id,
      code: area.code,
      title: area.designation,
      province: area.province,
      municipality: area.municipality,
      areaHectares: area.areaHectares,
      verdict: area.verdict,
      polygon: area.polygon,
      concessions: mappedConcessions,
      overlaps: area.overlaps,
    };
  });
};

const trace = (id: string): TraceChain | null => {
  const chain = idf.getTraceabilityChain(id);
  if (!chain) return null;
  return {
    entryLabel: "Lote de madeira",
    entryReference: idf.findLot(id)?.code ?? id,
    nodes: chain.nodes,
  };
};

export const idfDomain: DomainConfig = {
  key: "madeira",
  label: "Madeira — IDF",
  short: "Madeira",
  description: "Cadeia da madeira: operador, área, concessão, licença, exploração, lote, trânsito e exportação.",
  icon: TreePine,
  available: true,
  entities: [
    operatorsEntity,
    areasEntity,
    concessionsEntity,
    licensingEntity,
    inventoriesEntity,
    plansEntity,
    quotasEntity,
    licensesEntity,
    operationsEntity,
    logsEntity,
    forestLotsEntity,
    guidesEntity,
    warehousesEntity,
    certificatesEntity,
    inspectionsEntity,
    enforcementEntity,
    exportsEntity,
    revenueEntity,
  ],
  dashboard,
  mapKinds: [
    { kind: "operator", label: "Produtores/Operadores" },
    { kind: "concession", label: "Concessões" },
    { kind: "area", label: "Áreas registadas" },
    { kind: "inspection", label: "Inspecções" },
  ],
  mapPoints,
  mapAreas,
  traceOptions: () =>
    idf.lots().map((l) => ({
      id: l.id,
      label: `${l.code} — ${conCode(l.concessionId)}`,
      hint: `${l.logIds.length} toros · ${m3(l.totalVolume.value)}`,
    })),
  trace,
};

export const idfGlobe = Globe2;
