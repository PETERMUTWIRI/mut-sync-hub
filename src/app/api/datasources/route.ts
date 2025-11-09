export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DataSourceType } from "@prisma/client";
import { getOrgProfileInternal } from "@/lib/org-profile";
import { v4 as uuid } from "uuid";
import { uploadToStorage } from "@/lib/storage"; // 🔥 ADD THIS

export async function POST(req: NextRequest) {
  try {
    console.log("[datasources] ➜ create request");

    const { orgId } = await getOrgProfileInternal();
    const form = await req.formData();
    
    const type = form.get("type") as DataSourceType | null;
    const name = form.get("name") as string | null;
    const provider = form.get("provider") as string | null;
    const configRaw = form.get("config") as string | null;

    if (!type || !name || !provider) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let config: any = {};
    try {
      if (configRaw) config = JSON.parse(configRaw);
    } catch (e) {
      console.error("[datasources] invalid config JSON", e);
      return NextResponse.json({ error: "Invalid JSON in config field" }, { status: 400 });
    }

    // 🔥🔥🔥 HANDLE FILE UPLOAD
    if (type === 'FILE_IMPORT') {
      const file = form.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ error: "No file provided for CSV upload" }, { status: 400 });
      }

      console.log(`[datasources] 📤 uploading ${file.name} to Storj...`);
      const storjUrl = await uploadToStorage(file, orgId, uuid()); // Use temp UUID for path
      console.log("[datasources] ✅ uploaded to:", storjUrl);

      config = {
        ...config,
        fileUrl: storjUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    const ds = await prisma.dataSource.create({
      data: {
        id: uuid(),
        orgId,
        name,
        type,
        config,
        status: "ACTIVE",
      },
    });

    console.log("[datasources] ✅ created", ds.id);
    return NextResponse.json({ id: ds.id, orgId: ds.orgId, createdAt: ds.createdAt });

  } catch (err: any) {
    console.error("[datasources] ➜ crash", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}