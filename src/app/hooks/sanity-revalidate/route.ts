// Called by a Sanity webhook when the homepage hero changes, so the new slides show within
// seconds instead of after the homepage's 5-minute refresh (page.tsx `revalidate`).
//
// Not under /api: next.config.ts forwards every /api/* request to the backend.
//
// Setup (once): set SANITY_REVALIDATE_SECRET in Vercel, and in Sanity add a webhook that POSTs
// to https://getmeds.ph/hooks/sanity-revalidate with the header `x-revalidate-secret: <same
// value>`, filtered to `_type == "pageAsset"`.
import { revalidatePath } from 'next/cache';
import { timingSafeEqual } from 'node:crypto';

function secretMatches(given: string, expected: string): boolean {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const expected = process.env.SANITY_REVALIDATE_SECRET;
  if (!expected) {
    return Response.json({ ok: false, error: 'SANITY_REVALIDATE_SECRET is not set on this deployment.' }, { status: 500 });
  }
  const given = request.headers.get('x-revalidate-secret') ?? '';
  if (!secretMatches(given, expected)) {
    return Response.json({ ok: false, error: 'Wrong or missing x-revalidate-secret header.' }, { status: 401 });
  }

  revalidatePath('/');
  return Response.json({ ok: true, revalidated: ['/'], at: new Date().toISOString() });
}
