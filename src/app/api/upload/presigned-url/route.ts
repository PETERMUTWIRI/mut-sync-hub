// src/app/api/upload/presigned-url/route.ts
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

    const { uploadUrl, downloadUrl, key } = await getPresignedUploadUrl(
      orgId,
      fileName,
      fileType
    );

    return NextResponse.json({ 
      uploadUrl,      // ✅ PUT the file here
      downloadUrl,    // ✅ SAVE THIS in your datasource config
      key,
      message: 'Upload to PUT URL, save downloadUrl for async processing'
    });

  } catch (err) {
    console.error('[presigned-url] error', err);
    return NextResponse.json(
      { error: 'Failed to generate URLs' }, 
      { status: 500 }
    );
  }
}