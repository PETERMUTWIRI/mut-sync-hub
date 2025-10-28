export const dynamic = 'force-dynamic';
// src/app/api/security/events/route.ts
import { NextRequest, NextResponse } from 'next/server';

// ---------- ultra-defensive imports ----------
let prisma: any;
try {
  prisma = (await import('@/lib/prisma')).prisma;
} catch (e) {
  console.warn('⚠️  Could not import @/lib/prisma – using empty stub');
  prisma = null;
}

let geoip: any;
try {
  geoip = (await import('geoip-lite')).default;
} catch (e) {
  console.warn('⚠️  Could not import geoip-lite – using stub');
  geoip = { lookup: () => null };
}

// ---------- GET ----------
export async function GET(req: NextRequest) {
  console.log('🔍 /api/security/events hit – query:', req.nextUrl.searchParams.toString());

  /* –––– 1.  if prisma failed at import-time, bail out early –––– */
  if (!prisma) {
    console.error('💥 Prisma client unavailable');
    return NextResponse.json({ error: 'Service not configured' }, { status: 500 });
  }

  try {
    const lastId   = req.nextUrl.searchParams.get('lastId');
    const format   = req.nextUrl.searchParams.get('format');
    const userEmail= req.nextUrl.searchParams.get('userEmail') || 'system';

    const where: any = { useremail: userEmail };
    if (lastId && lastId !== 'undefined') where.id = { gt: lastId };

    let logs = await prisma.securityEvent.findMany({
      where,
      orderBy: { createdat: 'desc' },
      take: 50,
    });

    /* –––– 2.  back-fill geo data (best-effort) –––– */
    const toUpdate: any[] = [];
    for (const row of logs) {
      if (row.lat === null || row.lng === null) {
        const geo = geoip.lookup(row.ip ?? '');
        if (geo?.ll) {
          toUpdate.push({
            id: row.id,
            lat: geo.ll[0],
            lng: geo.ll[1],
            city: geo.city,
            country: geo.country,
          });
        }
      }
    }
    if (toUpdate.length) {
      await Promise.all(
        toUpdate.map((u) =>
          prisma.securityEvent.update({
            where: { id: u.id },
            data: { lat: u.lat, lng: u.lng, city: u.city, country: u.country },
          })
        )
      );
      logs = await prisma.securityEvent.findMany({ where, orderBy: { createdat: 'desc' }, take: 50 });
    }

    /* –––– 3.  optional CSV export –––– */
    if (format === 'csv') {
      const csv =
        'id,action,ip,createdat,risk,lat,lng,city,country\n' +
        logs
          .map((l: any) =>
            [l.id, l.action, l.ip, l.createdat, l.risk, l.lat, l.lng, l.city, l.country]
              .map((v) => (v === null ? '' : String(v).replace(/"/g, '""')))
              .join(',')
          )
          .join('\n');
      return new NextResponse(csv, { status: 200, headers: { 'Content-Type': 'text/csv' } });
    }

    /* –––– 4.  default JSON –––– */
    return NextResponse.json(logs, { status: 200 });
  } catch (err: any) {
    console.error('💥 CRASH in events API:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}