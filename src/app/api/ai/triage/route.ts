export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { NextRequest, NextResponse } from 'next/server';
import { InferenceClient } from '@huggingface/inference';
import { prisma } from '@/lib/prisma';

const hf = new InferenceClient(process.env.HF_TOKEN!);

export async function POST(req: NextRequest) {
  const { ticket_id, title, description } = await req.json();

  const prompt = `You are a support triage assistant.
Given the ticket below, return **only** valid JSON with keys:
priority: "critical"|"high"|"medium"|"low"
assignee: string (first name only, or "Unassigned")
reply: string (a short, polite, helpful first reply to the user)

Ticket title: ${title}
Ticket body: ${description}`;

  const out = await hf.textGeneration({
    model: 'google/flan-t5-large',
    inputs: prompt,
    parameters: { max_new_tokens: 120, temperature: 0.1, return_full_text: false },
  });

  let parsed: any = {};
  try { parsed = JSON.parse(out.generated_text.trim()); } catch {
    parsed = { priority: 'medium', assignee: 'Unassigned', reply: 'Thanks for reaching out – we’ll get back to you shortly!' };
  }

  await prisma.supportTicket.update({
    where: { id: ticket_id },
    data: { priority: parsed.priority, assignee: parsed.assignee },
  });

  await prisma.supportReply.create({
    data: {
      ticket_id,
      author_email: 'ai-triage@mutsynhub.com',
      body: parsed.reply,
    },
  });

  return NextResponse.json({ ok: true });
}
