// lib/qstash.ts
import { Client, Receiver } from '@upstash/qstash';

if (!process.env.QSTASH_TOKEN) {
  throw new Error('Missing QSTASH_TOKEN environment variable');
}

// Client for publishing messages
export const qstash = new Client({
  token: process.env.QSTASH_TOKEN,
});

// Receiver for verifying incoming messages (uses signing keys)
export const qstashReceiver = new Receiver({
  currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY!,
  nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY!,
});

// ✅ CORRECT: Verify signature using Receiver, not Client
export const verifyQstashSignature = async (
  signature: string,
  body: string
): Promise<boolean> => {
  if (process.env.NODE_ENV === 'development') return true;

  if (!signature) {
    console.error('[qstash] No signature header');
    return false;
  }

  try {
    // This is the correct verify call
    await qstashReceiver.verify({
      signature,
      body,
    });
    return true;
  } catch (err) {
    console.error('[qstash] Signature verification failed:', err);
    return false;
  }
};