'use server';
import { createNotification } from '@/lib/notification';

export async function notifyHighRisk(orgId: string, ip: string, action: string) {
  if (await import('@/lib/throttle').then(m => m.throttleKey(`hr-${ip}`, 60_000))) return;
  await createNotification(orgId, {
    title: 'High-risk event',
    message: `${action} from ${ip}`,
    type: 'ERROR',
    isOrgWide: true,
  });
}
