// Vidrys webhook signatures: the X-GEO-Signature header is the hex HMAC-SHA256 of the raw
// request body, keyed with VIDRYS_SIGNING_SECRET. Kept free of Next/path-alias imports so
// `node --test` can load it directly (see signature.test.ts).
import { createHmac, timingSafeEqual } from 'node:crypto';

/** Hex HMAC-SHA256 of the exact bytes received. */
export function signBody(secret: string, rawBody: Uint8Array | string): string {
  return createHmac('sha256', secret).update(rawBody).digest('hex');
}

/** Constant-time check of a received X-GEO-Signature header against the raw body. */
export function verifySignature(secret: string, rawBody: Uint8Array, header: string | null): boolean {
  if (!secret || !header) return false;
  const received = header.trim().toLowerCase();
  if (!/^[0-9a-f]{64}$/.test(received)) return false;
  const expected = Buffer.from(signBody(secret, rawBody), 'hex');
  return timingSafeEqual(expected, Buffer.from(received, 'hex'));
}
