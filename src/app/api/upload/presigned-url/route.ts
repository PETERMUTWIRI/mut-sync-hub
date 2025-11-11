// app/api/upload/presigned-url/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { getPresignedUploadUrl } from '@/lib/storage';

export async function POST(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing fileName or fileType' }, 
        { status: 400 }
      );
    }

    const { presignedUrl, publicUrl } = await getPresignedUploadUrl(
      orgId,
      fileName,
      fileType
    );

    return NextResponse.json({ 
      presignedUrl, 
      publicUrl,
      message: 'Upload directly to Storj using PUT method'
    });

  } catch (err) {
    console.error('[presigned-url] error', err);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' }, 
      { status: 500 }
    );
  }
}