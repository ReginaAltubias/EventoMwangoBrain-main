import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface PageHeaderProps {
  title: string;
  description?: string;
  crumbs?: string[];
  actions?: ReactNode;
}

export const PageHeader = ({ title, description, crumbs, actions }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25 }}
    className="flex flex-wrap items-end justify-between gap-3 border-b pb-5"
  >
    <div className="min-w-0">
      {crumbs && crumbs.length > 0 && (
        <p className="mb-1 text-[11px] font-semibold uppercase text-primary">{crumbs.join(" / ")}</p>
      )}
      <h1 className="font-display text-2xl font-semibold text-foreground md:text-3xl">{title}</h1>
      {description && <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{description}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </motion.div>
);
