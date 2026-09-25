import { motion } from "framer-motion";
import type { KpiCard } from "@/sigaflo/core/config";
import { cn } from "@/lib/utils";

export const KpiCards = ({ items, columns = 4 }: { items: KpiCard[]; columns?: number }) => (
  <div
    className={cn(
      "grid gap-4",
      columns === 3 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-4",
    )}
  >
    {items.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.03, duration: 0.25 }}
          whileHover={{ y: -2 }}
          className="min-h-36 rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-muted-foreground">{item.label}</p>
              <p className="mt-2 font-display text-2xl font-semibold text-foreground">
                {typeof item.value === "number" ? item.value.toLocaleString("pt-AO") : item.value}
              </p>
              <p className="mt-3 text-[11px] font-medium text-success">{item.hint ?? "Dados consolidados"}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <Icon className="h-4 w-4" />
            </span>
          </div>
        </motion.div>
      );
    })}
  </div>
);
