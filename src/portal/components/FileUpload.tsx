import { useRef, useState } from "react";
import { FileText, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  obrigatorio?: boolean;
  ajuda?: string;
  value?: File | null;
  onChange?: (f: File | null) => void;
}

// Upload 100% mock: o ficheiro fica apenas em memória local com pré-visualização.
export function FileUpload({ label, obrigatorio, ajuda, value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [ficheiro, setFicheiro] = useState<File | null>(value ?? null);

  const escolher = (f: File | null) => {
    setFicheiro(f);
    onChange?.(f);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium">
        {label} {obrigatorio && <span className="text-destructive">*</span>}
      </p>
      {ficheiro ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5 animate-scale-in">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{ficheiro.name}</p>
            <p className="text-xs text-muted-foreground">{(ficheiro.size / 1024).toFixed(0)} KB · pronto para envio</p>
          </div>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => ref.current?.click()} title="Substituir">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => escolher(null)} title="Remover">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-4 py-5 text-sm text-muted-foreground transition-colors",
            "hover:border-primary/40 hover:bg-primary/5 hover:text-primary",
          )}
        >
          <UploadCloud className="h-5 w-5" /> Seleccionar ficheiro
        </button>
      )}
      {ajuda && <p className="text-xs text-muted-foreground">{ajuda}</p>}
      <input
        ref={ref}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={(e) => escolher(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}
