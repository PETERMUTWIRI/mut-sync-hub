// app/api/upload/presigned-url/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getOrgProfileInternal } from "@/lib/org-profile";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "https://gateway.storjshare.io",
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY!,
    secretAccessKey: process.env.STORJ_SECRET_KEY!,
  },
  forcePathStyle: true,
});

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "Missing fileName or fileType" }, { status: 400 });
    }

    // Generate unique key
    const key = `orgs/${orgId}/uploads/${Date.now()}-${fileName}`;

    // Create presigned URL (valid for 5 minutes)
    const command = new PutObjectCommand({
      Bucket: process.env.STORJ_BUCKET!,
      Key: key,
      ContentType: fileType,
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return NextResponse.json({
      presignedUrl,
      key,
      publicUrl: `https://gateway.storjshare.io/insecure/${process.env.STORJ_BUCKET!}/${key}`,
    });

  } catch (err) {
    console.error("[presigned-url] error", err);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}