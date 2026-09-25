import { motion, useReducedMotion } from "framer-motion";
import type { ComponentType } from "react";

export function MetricCard({ label, value, change, icon: Icon, tone = "primary" }: { label: string; value: string; change: string; icon: ComponentType<{ className?: string }>; tone?: "primary" | "secondary" | "success" | "warning" }) {
  const reduce = useReducedMotion();
  const toneClass = { primary: "bg-primary-soft text-primary", secondary: "bg-secondary-soft text-secondary", success: "bg-success/10 text-success", warning: "bg-warning-soft text-warning" }[tone];
  return <motion.article initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="surface p-5"><div className="flex items-start justify-between"><div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneClass}`}><Icon className="h-6 w-6" /></div><span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">{change}</span></div><p className="mt-5 text-2xl font-extrabold">{value}</p><p className="mt-1 text-sm text-muted-foreground">{label}</p><svg viewBox="0 0 120 24" className="mt-4 h-6 w-full text-primary" aria-hidden="true"><path d="M0 20 C18 21 18 8 35 13 S55 19 70 8 S95 14 120 2" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg></motion.article>;
}