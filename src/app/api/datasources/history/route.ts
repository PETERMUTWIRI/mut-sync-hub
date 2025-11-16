// src/app/api/datasources/history/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis } from '@/lib/redis';

interface DatasourceRecord {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  createdAt?: string;
  transmittedRows?: number;
}

export async function GET(req: NextRequest) {
  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    
    const pattern = `datasource:${orgId}:*`;
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) {
      return NextResponse.json([]);
    }

    const datasources = await redis.mget(...keys);
    
    const history = datasources
      .filter((ds): ds is NonNullable<typeof ds> => ds != null)
      .map(ds => {
        // ✅ Cast to our interface (Redis already parsed the JSON)
        const parsed = ds as DatasourceRecord;
        
        return {
          id: parsed.id,
          sourceId: parsed.id,
          name: parsed.name || 'Unnamed Datasource',
          type: parsed.type || 'unknown',
          status: parsed.status || 'unknown',
          createdAt: parsed.createdAt || new Date().toISOString(),
          rowsProcessed: parsed.transmittedRows || 0,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    return NextResponse.json(history);
  } catch (err: any) {
    console.error('[history] ❌ ERROR:', err.message);
    return NextResponse.json([]);
  }
}