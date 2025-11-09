// lib/storage.ts
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({
  region: "us-east-1", // Required but ignored by Storj
  endpoint: "https://gateway.storjshare.io",
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY!,
    secretAccessKey: process.env.STORJ_SECRET_KEY!,
  },
  forcePathStyle: true, // CRITICAL for Storj
});

export async function uploadToStorage(file: File, orgId: string, sourceId: string): Promise<string> {
  const filename = `orgs/${orgId}/sources/${sourceId}/${Date.now()}-${file.name}`;
  
  await client.send(new PutObjectCommand({
    Bucket: "mut-sync-bucket", // Create this bucket in Storj first
    Key: filename,
    Body: Buffer.from(await file.arrayBuffer()),
    ContentType: file.type,
  }));
  
  // Public URL for n8n to fetch
  return `https://gateway.storjshare.io/insecure/mut-sync-bucket/${filename}`;
}

export async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}