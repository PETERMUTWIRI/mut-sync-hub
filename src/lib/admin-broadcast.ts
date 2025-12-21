// src/lib/admin-broadcast.ts
import { redis } from '@/lib/redis';
import { qstash } from '@/lib/qstash';

// Helper to validate and stringify data
function prepareBroadcastData(label: string, data: any): string | null {
  // Reject undefined/null data
  if (data === undefined) {
    console.error(`[broadcast:${label}] REJECTED: data is undefined. Call stack:`, new Error().stack);
    return null;
  }
  if (data === null) {
    console.warn(`[broadcast:${label}] WARNING: data is null. Call stack:`, new Error().stack);
    return null;
  }

  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error(`[broadcast:${label}] REJECTED: Failed to stringify data:`, error, data);
    return null;
  }
}

export async function broadcastToOwner(event: string, data: any) {
  try {
    const stringifiedData = prepareBroadcastData('owner', data);
    if (stringifiedData === null) {
      return; // Skip broadcast entirely
    }

    // 1. Store in Redis for history
    await redis.xadd(`stream:admin:owner`, '*', {
      event,
      data: stringifiedData,
      timestamp: Date.now().toString()
    });

    // 2. Trigger QStash to wake up dashboards
    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/notify-owner`,
      body: { event, data },
      retries: 3,
    });
    
    console.log(`[broadcast:owner] Event "${event}" broadcasted successfully`);
  } catch (error) {
    console.error('[broadcast:owner] Failed to broadcast:', error);
  }
}

export async function broadcastToOrg(orgId: string, event: string, data: any) {
  try {
    if (!orgId) {
      console.error('[broadcast:org] REJECTED: orgId is missing');
      return;
    }

    const stringifiedData = prepareBroadcastData(`org:${orgId}`, data);
    if (stringifiedData === null) {
      return; // Skip broadcast entirely
    }

    await redis.xadd(`stream:org:${orgId}`, '*', {
      event,
      data: stringifiedData,
      timestamp: Date.now().toString()
    });

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/notify-org`,
      body: { orgId, event, data },
      retries: 3,
    });
    
    console.log(`[broadcast:org:${orgId}] Event "${event}" broadcasted successfully`);
  } catch (error) {
    console.error(`[broadcast:org:${orgId}] Failed to broadcast:`, error);
  }
}

// Ensure ticket data is complete before broadcasting
export async function broadcastSupportTicket(ticket: any) {
  if (!ticket?.org_id || !ticket?.id) {
    console.error('[broadcast:support-ticket] REJECTED: Invalid ticket object:', ticket);
    return;
  }

  await broadcastToOrg(ticket.org_id, 'support:new', {
    id: ticket.id,
    title: ticket.title || 'Untitled',
    user_email: ticket.user_email || 'unknown@example.com',
    priority: ticket.priority || 'low'
  });
  
  await broadcastToOwner('support:new', {
    id: ticket.id,
    title: ticket.title,
    userEmail: ticket.user_email,
    orgId: ticket.org_id,
    orgName: ticket.organization?.name || 'Unknown Organization',
    unreadCount: 1
  });
}

// Ensure reply data is complete before broadcasting
export async function broadcastSupportReply(reply: any, ticket: any) {
  if (!ticket?.org_id || !ticket?.id || !reply) {
    console.error('[broadcast:support-reply] REJECTED: Invalid parameters:', { reply, ticket });
    return;
  }

  await broadcastToOrg(ticket.org_id, 'support:reply', {
    ticketId: ticket.id,
    replyId: reply.id,
    message: reply.body || '(empty reply)'
  });
  
  await broadcastToOwner('support:reply', {
    ticketId: ticket.id,
    orgId: ticket.org_id,
    orgName: ticket.organization?.name || 'Unknown Organization',
    userEmail: ticket.user_email,
    message: reply.body || '(empty reply)'
  });
}