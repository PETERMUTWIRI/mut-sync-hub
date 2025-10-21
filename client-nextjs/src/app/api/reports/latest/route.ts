export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { getOrgProfileInternal } from "@/lib/org-profile";
import { prisma } from "@/lib/prisma";
import { PDFDocument, rgb } from "pdf-lib";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orgId = searchParams.get("orgId")!;
  const wantPDF = searchParams.get("format") === "pdf";

  await getOrgProfileInternal(req); // auth

  const report = await prisma.analyticsReport.findFirst({
    where: { orgId },
    orderBy: { lastRun: "desc" },
  });

  if (!report) return NextResponse.json(null, { status: 404 });

  if (wantPDF) {
    const pdf = await buildPDF(report);
    return new NextResponse(Buffer.from(pdf), {
      headers: { "Content-Disposition": `attachment; filename="${report.type}-report-${orgId}.pdf` },
    });
  }

  // JSON for UI
  return NextResponse.json(report);
}

/* ----------  browser-side PDF builder  ---------- */
async function buildPDF(report: any): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([600, 800]);
  let y = page.getHeight() - 50;
  page.drawText(`${report.type} Report`, { x: 50, y, size: 20, color: rgb(0, 0, 0) });
  y -= 30;
  page.drawText(`Generated: ${new Date(report.lastRun).toLocaleString()}`, { x: 50, y, size: 12, color: rgb(0.3, 0.3, 0.3) });
  y -= 40;
  const kpis = report.results?.supermarket_kpis || report.results;
  Object.entries(kpis).forEach(([k, v]) => {
    y -= 20;
    page.drawText(`${k}: ${v}`, { x: 50, y, size: 12, color: rgb(0, 0, 0) });
  });
  return pdf.save();
}