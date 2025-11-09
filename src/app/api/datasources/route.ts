export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DataSourceType } from "@prisma/client";
import { getOrgProfileInternal } from "@/lib/org-profile";
import { v4 as uuid } from "uuid";

export async function POST(req: NextRequest) {
  try {
    console.log("[datasources] ➜ create request");

    // ✅ 1. Get authenticated user org
    const { orgId } = await getOrgProfileInternal();

    const form = await req.formData();
    const type = form.get("type") as DataSourceType | null;
    const name = form.get("name") as string | null;
    const provider = form.get("provider") as string | null;
    const configRaw = form.get("config") as string | null;

    if (!type || !name || !provider) {
      return NextResponse.json(
        { error: "Missing required fields: type, name, provider" },
        { status: 400 }
      );
    }

    // ✅ Parse config JSON safely
    let config: any = {};
    try {
      if (configRaw) config = JSON.parse(configRaw);
    } catch (e) {
      console.error("[datasources] invalid config JSON", e);
      return NextResponse.json(
        { error: "Invalid JSON in config field" },
        { status: 400 }
      );
    }

    // ✅ 3. Create datasource entry in Neon
    const ds = await prisma.dataSource.create({
      data: {
        id: uuid(),
        orgId,
        name,
        type,         // e.g. FILE_IMPORT, API, DB, POS_SYSTEM
        config,       // complete metadata from modal
        status: "ACTIVE",
      },
    });

    console.log("[datasources] ✅ created", ds.id);

    // ✅ 4. Return datasource id to frontend
    return NextResponse.json({
      id: ds.id,
      orgId: ds.orgId,
      createdAt: ds.createdAt,
    });

  } catch (err: any) {
    console.error("[datasources] ➜ crash", err);
    return NextResponse.json(
      { error: err.message || "Failed to create datasource" },
      { status: 500 }
    );
  }
}
