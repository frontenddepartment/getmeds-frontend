// Run with `npm test` (node --test; Node 22.6+ strips the TypeScript types itself).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signBody, verifySignature } from './signature.ts';

// The reference vector from the Vidrys Developer Setup Guide.
const SECRET = 's3cret';
const BODY = '{"event": "connection.test"}';
const EXPECTED = '5d01877fbb1bec13d69fa53a16a4e50a0ec685c890547444f6c557a9dd139e42';

test('reference body is exactly 28 bytes', () => {
  assert.equal(Buffer.byteLength(BODY), 28);
});

test('signs the reference body to the documented signature', () => {
  assert.equal(signBody(SECRET, new TextEncoder().encode(BODY)), EXPECTED);
});

test('accepts the documented signature, in either letter case', () => {
  const raw = new TextEncoder().encode(BODY);
  assert.equal(verifySignature(SECRET, raw, EXPECTED), true);
  assert.equal(verifySignature(SECRET, raw, EXPECTED.toUpperCase()), true);
});

test('rejects a wrong secret, a changed body, and a missing or malformed header', () => {
  const raw = new TextEncoder().encode(BODY);
  assert.equal(verifySignature('other', raw, EXPECTED), false);
  assert.equal(verifySignature(SECRET, new TextEncoder().encode(BODY + ' '), EXPECTED), false);
  assert.equal(verifySignature(SECRET, raw, null), false);
  assert.equal(verifySignature(SECRET, raw, 'not-hex'), false);
});
