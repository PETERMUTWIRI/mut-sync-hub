// app/api/datasources/route.ts
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getOrgProfileInternal } from '@/lib/org-profile';
import { redis, getDatasourceKey } from '@/lib/redis';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    console.log('[datasources] ➜ create request');

    const { orgId } = await getOrgProfileInternal();
    const form = await req.formData();
    
    const type = form.get('type') as string | null;
    const name = form.get('name') as string | null;
    const provider = form.get('provider') as string | null;
    const configRaw = form.get('config') as string | null;

    if (!type || !name || !provider) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      );
    }

    let config: any = {};
    try {
      if (configRaw) config = JSON.parse(configRaw);
    } catch (e) {
      console.error('[datasources] invalid config JSON', e);
      return NextResponse.json(
        { error: 'Invalid JSON in config field' }, 
        { status: 400 }
      );
    }

    // Generate datasource ID
    const id = uuid();

    // Store in Redis (metadata only, tiny)
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

    await redis.set(getDatasourceKey(orgId, id), JSON.stringify(datasource));

    console.log('[datasources] ✅ created', id);

    return NextResponse.json({
      id,
      orgId,
      createdAt: datasource.createdAt,
    });

  } catch (err: any) {
    console.error('[datasources] ➜ crash', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create datasource' }, 
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { orgId } = await getOrgProfileInternal();
    
    // Get all datasource keys for this org
    const keys = await redis.keys(getDatasourceKey(orgId, '*'));
    
    if (keys.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch all datasources
    const datasources = await redis.mget(...keys);
    
    return NextResponse.json(
      datasources
        .filter((ds): ds is string => typeof ds === 'string')
        .map(ds => JSON.parse(ds))
    );

  } catch (err: any) {
    console.error('[datasources] GET error', err);
    return NextResponse.json(
      { error: 'Failed to fetch datasources' }, 
      { status: 500 }
    );
  }
}