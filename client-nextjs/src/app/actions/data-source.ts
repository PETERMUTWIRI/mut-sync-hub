"use server";

import { prisma } from "@/lib/prisma";
import type { DataSourceType } from '@prisma/client';
import { ensureAndFetchUserProfile } from "@/app/api/get-user-role/action";
import CryptoJS from "crypto-js";
import { revalidatePath } from "next/cache";
import { DataGateway } from "@/lib/websocket";

const ENCRYPTION_KEY = process.env.DATASOURCE_ENCRYPTION_KEY || "fallback-32-char-key-must-be-32-chars";

function encrypt(obj: Record<string, any>): string {
  return CryptoJS.AES.encrypt(JSON.stringify(obj), ENCRYPTION_KEY).toString();
}

export async function createDataSource(input: {
  type: string;
  name: string;
  config: Record<string, any>;
}) {
  const user = await ensureAndFetchUserProfile();
  const { orgId } = user;

  // 1.  Test connection before save (quick ping)
  if (input.type === "API") {
    const { endpoint, apiKey } = input.config;
    const res = await fetch(endpoint, {
      method: "HEAD",
      headers: { Authorization: `Bearer ${apiKey}` },
    }).catch(() => null);
    if (!res || res.status > 299) throw new Error("API unreachable or key invalid");
  }

  // 2.  Save encrypted
  const ALLOWED_TYPES = ['POS_SYSTEM', 'ERP', 'DATABASE', 'API', 'FILE_IMPORT', 'CUSTOM'] as const;
  if (!ALLOWED_TYPES.includes(input.type as any)) throw new Error(`Invalid data source type: ${input.type}`);
  const dsType = input.type as DataSourceType;

  const ds = await prisma.dataSource.create({
    data: {
      name: input.name,
      type: dsType,
      orgId,
      config: encrypt(input.config),
      status: "ACTIVE",
      createdBy: user.userId,
    },
  });
  if (input.type === "DATABASE") {
  const { host, port, database, username, password } = input.config;
  // trivial TCP reachability test (no full connect to avoid pool leak)
  const net = await import("net");
  await new Promise<void>((res, rej) => {
    const s = new net.Socket();
    s.setTimeout(3000);
    s.on("connect", () => { s.destroy(); res(); });
    s.on("error", () => rej(new Error("DB host unreachable")));
    s.connect(port, host);
  });
  }

  if (input.type === "FILE_IMPORT") {
    if (input.config.provider === "upload") {
     // small CSV < 2 MB – store as row, trigger parse job
     const { fileName, csvBase64 } = input.config;
     const csvText = Buffer.from(csvBase64, "base64").toString("utf8");
     // TODO: enqueue background parse job
     console.log(`CSV ${fileName} received, ${csvText.split("\n").length} lines`);
    }
    if (input.config.provider === "s3") {
       const { bucket, region, accessKey, secretKey } = input.config;
       const aws = await import("@aws-sdk/client-s3");
       const s3 = new aws.S3Client({ region, credentials: { accessKeyId: accessKey, secretAccessKey: secretKey } });
       await s3.send(new aws.HeadBucketCommand({ Bucket: bucket }));
    }
  }
  // 3.  Real-time broadcast
  await DataGateway.broadcastToOrg(orgId, "dataSource:created", ds);

  revalidatePath("/user-dashboard-main/datasource");
  return true;
} 
