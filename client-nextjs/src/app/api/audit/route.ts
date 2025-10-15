import { NextRequest } from "next/server";
import { ensureAndFetchUserProfile } from "@/app/api/get-user-role/action";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await ensureAndFetchUserProfile();
  const logs = await prisma.auditLog.findMany({
    where: { orgId: user.orgId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
  return Response.json(logs);
}