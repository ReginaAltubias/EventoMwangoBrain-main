import logo from "@/assets/cropped-icon.png";
import { cn } from "@/lib/utils";
export function BrainBrand({compact=false,className}:{compact?:boolean;className?:string}){return <div className={cn("flex items-center",className)}>{compact?<span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-sidebar-border bg-sidebar-accent text-sm font-semibold text-sidebar-primary">M</span>:<img src={logo} alt="Mwango Brain" className="h-11 w-auto object-contain"/>}</div>}
