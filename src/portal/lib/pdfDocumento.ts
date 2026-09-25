import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface CampoPdf {
  rotulo: string;
  valor: string;
}

interface Opcoes {
  titulo: string;
  subtitulo?: string;
  codigo: string;
  campos: CampoPdf[];
  notas?: string[];
  ficheiro: string;
}

const VERDE: [number, number, number] = [31, 82, 58];

// Geração 100% local (demonstração) — nenhum dado sai do navegador.
export function gerarDocumentoPdf({ titulo, subtitulo, codigo, campos, notas = [], ficheiro }: Opcoes) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const largura = doc.internal.pageSize.getWidth();

  doc.setFillColor(...VERDE);
  doc.rect(0, 0, largura, 92, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("IDF — Instituto de Desenvolvimento Florestal", 40, 40);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("República de Angola · Ministério da Agricultura e Florestas", 40, 58);
  doc.text("Portal do Operador · documento de demonstração", 40, 74);

  doc.setTextColor(20, 20, 20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(titulo.toUpperCase(), 40, 130);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (subtitulo) doc.text(subtitulo, 40, 148);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(codigo, 40, subtitulo ? 168 : 152);

  autoTable(doc, {
    startY: subtitulo ? 186 : 170,
    theme: "grid",
    styles: { fontSize: 10, cellPadding: 7, lineColor: [220, 224, 220] },
    headStyles: { fillColor: VERDE, textColor: 255, fontStyle: "bold" },
    columnStyles: { 0: { cellWidth: 170, fontStyle: "bold" } },
    head: [["Elemento", "Informação"]],
    body: campos.map((c) => [c.rotulo, c.valor]),
  });

  // @ts-expect-error propriedade adicionada pelo autotable
  let y: number = (doc.lastAutoTable?.finalY ?? 300) + 28;

  if (notas.length) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Observações", 40, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    notas.forEach((n) => {
      const linhas = doc.splitTextToSize(`• ${n}`, largura - 80) as string[];
      doc.text(linhas, 40, y);
      y += linhas.length * 13 + 4;
    });
    y += 14;
  }

  doc.setDrawColor(...VERDE);
  doc.line(40, y + 40, 240, y + 40);
  doc.setFontSize(9);
  doc.text("Instituto de Desenvolvimento Florestal", 40, y + 56);
  doc.setTextColor(120, 120, 120);
  doc.text(
    `Emitido em ${new Date().toLocaleString("pt-PT")} · documento de demonstração sem valor legal`,
    40,
    doc.internal.pageSize.getHeight() - 36,
  );

  doc.save(ficheiro);
}
