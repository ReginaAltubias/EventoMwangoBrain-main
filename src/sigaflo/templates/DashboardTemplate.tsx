import { motion, useReducedMotion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ArrowUpRight, Clock3, Coffee, TrendingUp } from "lucide-react";
import { KpiCards } from "@/sigaflo/templates/KpiCards";
import type { DashboardData } from "@/sigaflo/core/config";
import { statusLabel } from "@/sigaflo/templates/StatusBadge";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--info))", "hsl(var(--success))", "hsl(var(--warning))"];

const panelMotion = (delay: number, reduced: boolean | null) => ({
  initial: reduced ? false : { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: reduced ? 0 : 0.4, delay: reduced ? 0 : delay },
});

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return <div className="rounded-md border bg-card px-3 py-2 shadow-md"><p className="text-xs text-muted-foreground">{label ?? payload[0]?.name}</p><p className="mt-1 text-sm font-semibold text-foreground">{Number(payload[0]?.value ?? 0).toLocaleString("pt-AO")}</p></div>;
};

export const DashboardTemplate = ({ data }: { data: DashboardData }) => {
  const reduced = useReducedMotion();
  const provinceData = data.charts[2]?.data ?? [];
  const lotData = (data.charts[1]?.data ?? []).map((item) => ({ ...item, name: statusLabel(item.name) }));
  const harvestData = data.charts[3]?.data ?? [];
  const lotTotal = lotData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      <KpiCards items={data.cards} />

      <div className="grid gap-5 xl:grid-cols-3">
        <motion.section {...panelMotion(0.08, reduced)} className="overflow-hidden rounded-lg border bg-card shadow-sm xl:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b px-5 py-4">
            <div><p className="font-display text-base font-semibold">Área de exploração por província</p><p className="mt-1 text-xs text-muted-foreground">Superfície dedicada à produção de café, em hectares</p></div>
            <span className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary"><TrendingUp className="h-3.5 w-3.5"/>Campanha 2026</span>
          </div>
          <div className="h-[330px] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={provinceData} margin={{ left: -8, right: 8, top: 12 }} barCategoryGap="28%">
                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tickMargin={10} />
                <YAxis axisLine={false} tickLine={false} fontSize={11} width={42} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "hsl(var(--muted) / .45)" }} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[6, 6, 2, 2]} animationDuration={reduced ? 0 : 850} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <motion.section {...panelMotion(0.14, reduced)} className="flex flex-col rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between"><div><p className="font-display text-base font-semibold">Estado dos lotes</p><p className="mt-1 text-xs text-muted-foreground">Distribuição actual do processamento</p></div><span className="rounded-md bg-muted p-2 text-muted-foreground"><ArrowUpRight className="h-4 w-4"/></span></div>
          <div className="relative h-52">
            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={lotData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={82} paddingAngle={4} animationDuration={reduced ? 0 : 900}>{lotData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip content={<ChartTooltip />} /></PieChart></ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="font-display text-3xl text-foreground">{lotTotal}</strong><span className="text-[10px] font-semibold uppercase text-muted-foreground">Lotes</span></div>
          </div>
          <div className="mt-auto space-y-3">{lotData.map((item, i) => <motion.div key={item.name} initial={reduced ? false : { opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduced ? 0 : .22 + i * .06 }} className="flex items-center justify-between border-b pb-2 text-xs last:border-0"><span className="flex items-center gap-2 text-muted-foreground"><span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{item.name}</span><strong>{item.value}</strong></motion.div>)}</div>
        </motion.section>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(340px,1fr)]">
        <motion.section {...panelMotion(0.2, reduced)} className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-start justify-between gap-3"><div><p className="font-display text-base font-semibold">Colheita mensal</p><p className="mt-1 text-xs text-muted-foreground">Café colhido por mês, em quilogramas</p></div><span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/15 text-accent"><Coffee className="h-4 w-4"/></span></div>
          <div className="h-64"><ResponsiveContainer width="100%" height="100%"><LineChart data={harvestData} margin={{ left: -8, right: 12, top: 12 }}><CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="4 4"/><XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={11} tickMargin={10}/><YAxis axisLine={false} tickLine={false} fontSize={11} width={42}/><Tooltip content={<ChartTooltip />}/><Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={3} animationDuration={reduced ? 0 : 1100} dot={{ fill: "hsl(var(--card))", stroke: "hsl(var(--accent))", strokeWidth: 3, r: 5 }} activeDot={{ r: 7, fill: "hsl(var(--accent))" }}/></LineChart></ResponsiveContainer></div>
        </motion.section>

        <motion.section {...panelMotion(0.26, reduced)} className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between"><div><p className="font-display text-base font-semibold">Actividade recente</p><p className="mt-1 text-xs text-muted-foreground">Últimos movimentos da cadeia</p></div><span className="rounded-md bg-muted p-2 text-muted-foreground"><Clock3 className="h-4 w-4"/></span></div>
          <ul className="divide-y">{data.activity.slice(0, 5).map((item, index) => <motion.li key={`${item.date}-${index}`} initial={reduced ? false : { opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: reduced ? 0 : .3 + index * .06 }} className="group flex gap-3 py-3 first:pt-0 last:pb-0"><span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary ring-4 ring-primary/10 transition-transform group-hover:scale-125"/><div className="min-w-0"><p className="text-xs font-semibold leading-5 text-foreground">{item.label}</p><p className="mt-0.5 text-[11px] text-muted-foreground">{item.type} · {item.date}</p></div></motion.li>)}</ul>
        </motion.section>
      </div>
    </div>
  );
};
