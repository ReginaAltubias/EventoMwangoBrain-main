import { MessageCircleMore } from "lucide-react";
import { cn } from "@/lib/utils";

export function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return <div className={cn("flex items-center gap-3", className)}><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-soft"><MessageCircleMore className="h-6 w-6" strokeWidth={2.4} /></span>{!compact && <span className="text-xl font-extrabold tracking-normal text-foreground">Mô'<span className="text-primary">Kamba</span></span>}</div>;
}