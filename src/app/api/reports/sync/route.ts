export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from "next/server";
import { getOrgProfileInternal } from "@/lib/org-profile";
import { prisma } from "@/lib/prisma";

interface AnalyticReport {
  orgId: string;
  type: string;
  results: any;
  lastRun: string;
  schedule?: string | null;
}

export async function POST(req: NextRequest) {
  const { orgId, type, results, lastRun, schedule } = (await req.json()) as AnalyticReport;
  await getOrgProfileInternal(req); // auth

  const report = await prisma.analyticsReport.upsert({
    where: { id: `${orgId}-${type}` },
    update: { lastRun: new Date(lastRun), results, updatedAt: new Date() },
    create: {
      id: `${orgId}-${type}`,
      name: `${type} report`,
      description: `Auto-generated ${type}`,
      orgId,
      type,
      config: {},
      schedule: schedule ?? null,
      lastRun: new Date(lastRun),
      results,
    },
  });

  return NextResponse.json({ status: "stored", id: report.id });
}