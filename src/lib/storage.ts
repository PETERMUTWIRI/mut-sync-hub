// lib/storage.ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3 = new S3Client({
  region: "us-east-1",
  endpoint: "https://gateway.storjshare.io",
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY!,
    secretAccessKey: process.env.STORJ_SECRET_KEY!,
  },
  forcePathStyle: true,
}) as any; // Bypass TypeScript version issues

export async function getPresignedUploadUrl(
  orgId: string, 
  fileName: string, 
  contentType: string
): Promise<{ presignedUrl: string; publicUrl: string }> {
  const key = `orgs/${orgId}/uploads/${Date.now()}-${fileName}`;
  
  const command = new PutObjectCommand({
    Bucket: process.env.STORJ_BUCKET!,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });
  
  return {
    presignedUrl,
    publicUrl: `https://gateway.storjshare.io/insecure/${process.env.STORJ_BUCKET!}/${key}`,
  };
}