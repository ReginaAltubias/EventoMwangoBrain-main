import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { INSTITUICOES_INFO, kz, produtores, resumoInstituicao, terrasDe } from "@/ida-portal/data";

export default function InstituicoesPage() {
  const reduced = useReducedMotion();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 font-display text-lg font-bold"><Building2 className="h-5 w-5 text-primary" />Instituições acompanhadas</h1>
        <p className="mt-1 text-sm text-muted-foreground">O IDA consolida os produtores registados pelas quatro instituições do sector.</p>
      </div>
      {INSTITUICOES_INFO.map((instituicao, index) => {
        const resumo = resumoInstituicao(instituicao.key);
        const lista = produtores.filter((item) => item.instituicao === instituicao.key);
        return (
          <motion.section key={instituicao.key} initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="card-elevated rounded-xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
              <div>
                <h2 className="font-semibold">{instituicao.key} · {instituicao.nome}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{instituicao.descricao}</p>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-right text-xs sm:grid-cols-4">
                <p><span className="block font-bold text-foreground">{resumo.produtores}</span>produtores</p>
                <p><span className="block font-bold text-foreground">{resumo.area.toLocaleString("pt-AO")} ha</span>terras</p>
                <p><span className="block font-bold text-foreground">{resumo.producao.toLocaleString("pt-AO")} kg</span>produção</p>
                <p><span className="block font-bold text-warning">{kz(resumo.divida)}</span>dívida em aberto</p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto rounded-md border">
              <Table>
                <TableHeader><TableRow className="bg-muted/55"><TableHead>Produtor</TableHead><TableHead>Actividade</TableHead><TableHead className="hidden md:table-cell">Localização</TableHead><TableHead>Área</TableHead><TableHead>Estado</TableHead><TableHead className="w-16 text-right">Ver</TableHead></TableRow></TableHeader>
                <TableBody>
                  {lista.map((produtor) => (
                    <TableRow key={produtor.id} className="hover:bg-primary/5">
                      <TableCell><p className="font-semibold">{produtor.nome}</p><p className="text-xs text-muted-foreground">{produtor.codigo}</p></TableCell>
                      <TableCell>{produtor.actividade}</TableCell>
                      <TableCell className="hidden md:table-cell">{produtor.municipio}, {produtor.provincia}</TableCell>
                      <TableCell>{terrasDe(produtor.id).reduce((sum, item) => sum + item.areaHa, 0).toLocaleString("pt-AO")} ha</TableCell>
                      <TableCell>{produtor.estado}</TableCell>
                      <TableCell className="text-right"><Button asChild variant="ghost" size="icon" aria-label="Visualizar"><Link to={`/painel/produtores/${produtor.id}`}><Eye className="h-4 w-4" /></Link></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
