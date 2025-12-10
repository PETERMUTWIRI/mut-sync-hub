// src/lib/admin-broadcast.ts
import { redis } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

/**
 * Single command to store + queue notification
 * Costs: 1 Redis command + 1 QStash call (only when event happens)
 */
export async function broadcastToOwner(event: string, data: any) {
  try {
    // 1. Store in Redis for history (1 command vs 43,200 polls)
    await redis.xadd(`stream:admin:owner`, '*', {
      event,
      data: JSON.stringify(data),
      timestamp: Date.now().toString()
    });

    // 2. Trigger QStash to wake up dashboards (only when needed)
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/notify-owner`,
      body: { event, data },
      retries: 3,
    });
  } catch (error) {
    console.error('[broadcast:owner]', error);
  }
}

export async function broadcastToOrg(orgId: string, event: string, data: any) {
  try {
    await redis.xadd(`stream:org:${orgId}`, '*', {
      event,
      data: JSON.stringify(data),
      timestamp: Date.now().toString()
    });

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/notify-org`,
      body: { orgId, event, data },
      retries: 3,
    });
  } catch (error) {
    console.error(`[broadcast:org:${orgId}]`, error);
  }
}

export async function broadcastSupportTicket(ticket: any) {
  await broadcastToOrg(ticket.org_id, 'support:new', {
    id: ticket.id,
    title: ticket.title,
    user_email: ticket.user_email,
    priority: ticket.priority
  });
  
  await broadcastToOwner('support:new', {
    ...ticket,
    orgName: ticket.organization.name,
    userEmail: ticket.user_email,
    unreadCount: 1
  });
}

export async function broadcastSupportReply(reply: any, ticket: any) {
  await broadcastToOrg(ticket.org_id, 'support:reply', {
    ticketId: ticket.id,
    reply
  });
  
  await broadcastToOwner('support:reply', {
    ticketId: ticket.id,
    orgId: ticket.org_id,
    orgName: ticket.organization.name,
    userEmail: ticket.user_email,
    message: reply.body
  });
}