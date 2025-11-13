// @ts-nocheck
// src/app/api/datasources/route.ts

// ✅ CONFIG EXPORTS AT TOP (Next.js 16 requirement)
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 10;

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'); // Clear visual separator
  console.log('[datasources] ➜ CREATE REQUEST RECEIVED');

  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[datasources] Using orgId:', orgId);

    const form = await req.formData();
    const type = form.get('type') as string | null;
    const name = form.get('name') as string | null;
    const provider = form.get('provider') as string | null;
    const configRaw = form.get('config') as string | null;

    console.log('[datasources] Received fields:', { type, name, provider, hasConfig: !!configRaw });

    if (!type || !name || !provider) {
      console.error('[datasources] ❌ Missing required fields');
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let config = {};
    try {
      if (configRaw) {
        config = JSON.parse(configRaw);
        console.log('[datasources] Config parsed successfully:', config);
      }
    } catch (e) {
      console.error('[datasources] ❌ Invalid JSON in config:', e);
      return NextResponse.json({ error: 'Invalid JSON in config field' }, { status: 400 });
    }

    const id = uuid();
    console.log('[datasources] Generated UUID:', id);

    // ✅ CRITICAL: Use getDatasourceKey for consistency
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
    console.log('[datasources] ✓ WRITE TO REDIS SUCCESS');

    // ✅ IMMEDIATE VERIFICATION (Critical for debugging)
    const verifyWrite = await redis.get(datasourceKey);
    if (verifyWrite) {
      console.log('[datasources] ✓ VERIFICATION READ SUCCESS:', verifyWrite.substring(0, 100) + '...');
    } else {
      console.error('[datasources] ❌ VERIFICATION READ FAILED: Key not found');
    }

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
  console.log('[datasources] ➜ GET REQUEST');

  try {
    const profile = await getOrgProfileInternal();
    const orgId = profile.orgId;
    console.log('[datasources] Fetching for orgId:', orgId);

    const pattern = getDatasourceKey(orgId, '*');
    console.log('[datasources] Redis pattern:', pattern);

    const keys = await redis.keys(pattern);
    console.log('[datasources] Found keys:', keys.length);

    if (keys.length === 0) {
      console.log('[datasources] No datasources found');
      return NextResponse.json([]);
    }

    const datasources = await redis.mget(...keys);
    const parsed = datasources
      .filter(ds => typeof ds === 'string')
      .map(ds => JSON.parse(ds));

    console.log('[datasources] ✅ Returning', parsed.length, 'datasources');
    return NextResponse.json(parsed);

  } catch (err) {
    console.error('[datasources] GET ERROR:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}