import { PDFDocument, rgb } from 'pdf-lib';

export async function buildReportPDF(report: any) {
  const pdf  = await PDFDocument.create();
  const page = pdf.addPage([600, 800]);
  const { width, height } = page.getSize();
  const fontSize = 12;

  let y = height - 50;
  page.drawText(`${report.type} Report`, { x: 50, y, size: 20, color: rgb(0, 0, 0) });
  y -= 30;
  page.drawText(`Generated: ${new Date(report.lastRun).toLocaleString()}`, { x: 50, y, size: fontSize, color: rgb(0.3, 0.3, 0.3) });
  y -= 40;

  /* KPI table */
  const kpis = report.results?.supermarket_kpis || report.results;
  Object.entries(kpis).forEach(([k, v]) => {
    y -= 20;
    page.drawText(`${k}: ${v}`, { x: 50, y, size: fontSize, color: rgb(0, 0, 0) });
  });

  const pdfBytes = await pdf.save();
  return pdfBytes;
}