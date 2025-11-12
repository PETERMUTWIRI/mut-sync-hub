// src/lib/qstash.ts
// @ts-nocheck
import { Client, Receiver } from '@upstash/qstash';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('Missing QSTASH_TOKEN environment variable');
}

// ✅ CORRECT: Initialize with baseUrl (NOT pipeline URL)
export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
  baseUrl: 'https://qstash.upstash.io', // ✅ This is crucial
});

export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

export const verifyQstashSignature = async (signature: string, body: string): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development') return true;
  if (!signature) return false;

  try {
    await qstashReceiver.verify({ signature, body });
    return true;
  } catch {
    return false;
  }
};