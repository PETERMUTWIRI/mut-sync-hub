// @ts-nocheck
// src/app/api/datasources/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('[datasources] ➜ CREATE REQUEST');

  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[datasources] Using orgId:', orgId);

    const form = await req.formData();
    const type = form.get('type') as string | null;
    const name = form.get('name') as string | null;
    const provider = form.get('provider') as string | null;
    const configRaw = form.get('config') as string | null;

    if (!type || !name || !provider) {
      console.error('[datasources] ❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let config = {};
    try {
      if (configRaw) {
        config = JSON.parse(configRaw);
        console.log('[datasources] Config parsed:', config);
      }
    } catch (e) {
      console.error('[datasources] ❌ Invalid config JSON:', e);
      return NextResponse.json({ error: 'Invalid JSON in config field' }, { status: 400 });
    }

    const id = uuid();
    console.log('[datasources] Generated UUID:', id);

    const datasourceKey = getDatasourceKey(orgId, id);
    console.log('[datasources] Redis key:', datasourceKey);

    const datasource = {
      id,
      orgId,
      name,
      type,
      provider,
      config,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };

    // ✅ Write to Redis
    await redis.set(datasourceKey, JSON.stringify(datasource));
    console.log('[datasources] ✓ WRITE SUCCESS');

    // ✅ VERIFICATION (Fixed: Check type before using string methods)
    const verifyWrite = await redis.get(datasourceKey);
    
    if (!verifyWrite) {
      console.error('[datasources] ❌ VERIFICATION FAILED: Key not found in Redis');
      return NextResponse.json({ error: 'Redis write verification failed' }, { status: 500 });
    }

    // ✅ SAFE: Handle both string and parsed object
    const verifyStr = typeof verifyWrite === 'string' 
      ? verifyWrite.substring(0, 100) + '...' 
      : JSON.stringify(verifyWrite).substring(0, 100) + '...';
    
    console.log('[datasources] ✓ Verification read:', verifyStr);

    console.log('[datasources] ✅ COMPLETED:', id);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json({
      id,
      orgId,
      createdAt: datasource.createdAt,
    });

  } catch (err) {
    console.error('[datasources] ❌ CRASH:', err);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;

    const pattern = getDatasourceKey(orgId, '*');
    const keys = await redis.keys(pattern);
    
    if (keys.length === 0) return NextResponse.json([]);

    const datasources = await redis.mget(...keys);
    return NextResponse.json(
      datasources
        .filter(ds => typeof ds === 'string')
        .map(ds => JSON.parse(ds))
    );
  } catch (err) {
    console.error('[datasources] GET ERROR:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}