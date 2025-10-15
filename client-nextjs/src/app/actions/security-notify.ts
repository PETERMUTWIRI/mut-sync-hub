'use server';
import { createNotification } from '@/lib/notification';
import { throttleKey } from '@/lib/throttle';
import { safeBrowserNotify } from '@/lib/browser-notify';

const THROTTLE_MS = 60_000; // 1 min per IP
// src/app/actions/security-notify.ts
export async function notifyHighRisk(orgId: string, ip: string, action: string) {
  if (await throttleKey(`hr-${ip}`, 60_000)) return; // 1 min throttle

  await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}/api/notifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orgId,
      title: 'High-risk event',
      message: `${action} from ${ip}`,
      type: 'ERROR',
      isOrgWide: true,
    }),
  });
}