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
      user_email: user_email,
      status: 'OPEN',
    },
  });

  // AI triage (fire & forget)
  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/ai/triage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ticket_id: ticket.id, title, description }),
  });

  revalidatePath('/support');
  return ticket;
}

export async function addAdminReply({
  ticket_id,
  body,
  author_email,
}: {
  ticket_id: string;
  body: string;
  author_email: string;
}) {
  await prisma.supportReply.create({
    data: { ticket_id, body, author_email: author_email },
  });
  await prisma.supportTicket.update({
    where: { id: ticket_id },
    data: { updated_at: new Date() },
  });
  revalidatePath('/support');
}

export async function agentChat(message: string, user_email?: string) {
  // TODO: Implement actual AI agent chat
  return { content: 'This is a placeholder response from the AI agent.' };
}
