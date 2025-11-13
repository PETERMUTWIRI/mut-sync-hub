// src/lib/storage.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  endpoint: 'https://gateway.storjshare.io',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.STORJ_ACCESS_KEY!,
    secretAccessKey: process.env.STORJ_SECRET_KEY!,
  },
});

export async function getPresignedUploadUrl(
  orgId: string,
  fileName: string,
  fileType: string
) {
  const key = `orgs/${orgId}/uploads/${Date.now()}-${fileName}`;

  // ✅ Upload URL (PUT) - expires in 1 hour
  const putCommand = new PutObjectCommand({
    Bucket: process.env.STORJ_BUCKET!,
    Key: key,
    ContentType: fileType,
  });
  
  const uploadUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 3600 });

  // ✅ Download URL (GET) - expires in 24 hours for async processing
  const getCommand = new GetObjectCommand({
    Bucket: process.env.STORJ_BUCKET!,
    Key: key,
  });
  
  const downloadUrl = await getSignedUrl(s3Client, getCommand, { 
    expiresIn: 24 * 60 * 60 // 24 hours
  });

  return {
    uploadUrl,      // Use this to PUT the file
    downloadUrl,    // ✅ Save this in Redis - lasts 24 hours!
    key,
  };
}