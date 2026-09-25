import type { ReactNode } from "react";

export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase text-primary">Administração Mô'Kamba</p><h1 className="text-2xl font-extrabold text-foreground sm:text-3xl">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}</div>;
}