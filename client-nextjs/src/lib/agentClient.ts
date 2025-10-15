'use client';

type AgentReply = { role: 'assistant'; content: string; requiresContact?: boolean };

export async function agentRequest(action: string, payload: Record<string, any>): Promise<AgentReply> {
  const res = await fetch('/api/agent', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ action, payload }),
  });

  if (!res.ok) throw new Error(await res.text());

  const text = await res.text(); // ← read once
  if (!text) throw new Error('Empty response from /api/agent');

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON from /api/agent: ' + text);
  }
}