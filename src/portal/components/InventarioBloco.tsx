import { TreePine } from "lucide-react";
import type { EspecieInventario } from "@/portal/data/concessaoFluxo";

const fmt = (v: number) => v.toLocaleString("pt-AO");

/** Resumo das espécies de árvores inventariadas num bloco. */
export function InventarioBloco({ inventario }: { inventario: EspecieInventario[] }) {
  if (!inventario.length) return null;
  const totalArvores = inventario.reduce((s, e) => s + e.arvores, 0);
  const totalVolume = inventario.reduce((s, e) => s + e.volumeM3, 0);

  return (
    <div className="mt-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <TreePine className="h-3.5 w-3.5 text-primary" /> Espécies de árvores no bloco
      </p>
      <div className="mt-2 overflow-hidden rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/60 text-left text-[11px] uppercase text-muted-foreground">
              <th className="px-3 py-2 font-semibold">Espécie</th>
              <th className="px-3 py-2 text-right font-semibold">Árvores</th>
              <th className="px-3 py-2 text-right font-semibold">Volume estimado</th>
              <th className="px-3 py-2 text-right font-semibold">% do bloco</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((e) => (
              <tr key={e.especie} className="border-t border-border">
                <td className="px-3 py-2 font-medium">{e.especie}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(e.arvores)}</td>
                <td className="px-3 py-2 text-right tabular-nums">{fmt(e.volumeM3)} m³</td>
                <td className="px-3 py-2 text-right tabular-nums text-muted-foreground">
                  {totalVolume > 0 ? Math.round((e.volumeM3 / totalVolume) * 100) : 0}%
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-border bg-muted/40 text-sm font-semibold">
              <td className="px-3 py-2">Total</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmt(totalArvores)}</td>
              <td className="px-3 py-2 text-right tabular-nums">{fmt(totalVolume)} m³</td>
              <td className="px-3 py-2" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
