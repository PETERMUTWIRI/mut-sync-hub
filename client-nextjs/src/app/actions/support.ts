'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createSupportTicket({
  title,
  description,
  priority,
  user_email,
}: {
  title: string;
  description: string;
  priority: string;
  user_email: string;
}) {
  const ticket = await prisma.supportTicket.create({
    data: {
      title,
      description,
      priority: priority.toUpperCase() as any,
      userEmail: user_email,
      status: 'OPEN',
    },
  });

  // AI triage (fire & forget)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticketId: ticket.id, title, description }),
  });

  revalidatePath('/support');
  return ticket;
}

export async function addAdminReply({
  ticketId,
  body,
  author_email,
}: {
  ticketId: string;
  body: string;
  author_email: string;
}) {
  await prisma.supportReply.create({
    data: { ticketId, body, authorEmail: author_email },
  });
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() },
  });
  revalidatePath('/support');
}

export async function agentChat(message: string, user_email?: string) {
  // TODO: Implement actual AI agent chat
  return { content: 'This is a placeholder response from the AI agent.' };
}
