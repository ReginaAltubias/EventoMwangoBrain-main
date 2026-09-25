import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  showText?: boolean;
  variant?: "default" | "inverted";
  size?: "sm" | "md" | "lg" | "xl";
}

const SIZES = { sm: "h-9 w-auto", md: "h-11 w-auto", lg: "h-16 w-auto", xl: "h-24 w-auto" };

export const BrandLogo = ({ className, showText = true, variant = "default", size = "md" }: BrandLogoProps) => {
  const inverted = variant === "inverted";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src="/favicon.png"
        alt="Logótipo do SIGAFLO"
        className={cn("shrink-0 rounded-full bg-card object-contain p-1 shadow-sm", SIZES[size], inverted && "ring-2 ring-sidebar-foreground/15")}
      />
      {showText && (
        <span className="min-w-0 leading-tight">
          <span
            className={cn(
              "block font-display text-lg font-extrabold",
              inverted ? "text-sidebar-foreground" : "text-foreground",
            )}
          >
            SIGAFLO
          </span>
          <span
            className={cn(
              "block text-[11px] font-medium",
              inverted ? "text-sidebar-foreground/65" : "text-muted-foreground",
            )}
          >
            Sistema Integrado de Gestão Florestal
          </span>
        </span>
      )}
    </div>
  );
};

export default BrandLogo;
