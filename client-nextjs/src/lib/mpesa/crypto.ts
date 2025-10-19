import crypto from 'crypto';

const ALG = 'aes-256-cbc';
const KEY = crypto.scryptSync(process.env.MPESA_ENCRYPTION_KEY!, 'salt', 32);
const IV  = Buffer.alloc(16, 0); // static IV ok for at-rest; rotate per field in prod

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(ALG, KEY, IV);
  let enc = cipher.update(text, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

export function decrypt(enc: string): string {
  const decipher = crypto.createDecipheriv(ALG, KEY, IV);
  let dec = decipher.update(enc, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}
