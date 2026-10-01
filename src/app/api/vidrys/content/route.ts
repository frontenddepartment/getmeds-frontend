// Vidrys webhook receiver (Vidrys Developer Setup Guide).
//
// Every request is signed: X-GEO-Signature = hex HMAC-SHA256 of the raw body with
// VIDRYS_SIGNING_SECRET. Events:
//   connection.test                -> { ok: true }
//   content.publish                -> stored in Sanity as a draft for editors, never published;
//                                     returns { id, url } (the live page once published, else the Studio draft)
//   seo.fix.apply / seo.fix.revert -> title / meta description / canonical override for the page
//                                     at `url`, then that page is refreshed; returns { applied }
//
// next.config.ts forwards /api/* to the backend, except /api/vidrys/* which stays here
// (see the rewrite there). src/proxy.ts only adds CORS headers on /api/* and never blocks.
import { revalidatePath, revalidateTag } from 'next/cache';
import { verifySignature } from '@/lib/vidrys/signature';
import { storeContentDelivery, writeSeoOverride, type SeoFields } from '@/lib/vidrys/store';
import { normalizeSitePath, pageTakesSeoOverrides, SITE_HOSTS } from '@/lib/vidrys/paths';
import { VIDRYS_SEO_TAG } from '@/lib/vidrys/seoOverrides';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Vidrys needs a 2xx within 30 seconds.
export const maxDuration = 30;

// Plain JSON, never cached; identity encoding so the edge doesn't compress the reply.
function reply(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Content-Encoding': 'identity' },
  });
}

const str = (value: unknown): string | undefined => (typeof value === 'string' && value.trim() ? value : undefined);

// seo.fix.* bodies carry `changes`: a list of { field, value, previous_value }, where field is
// meta_description, title or canonical (Vidrys Developer Setup Guide, "What Vidrys sends").
const FIELD_KEYS: Record<string, keyof SeoFields> = { meta_description: 'metaDescription', title: 'title', canonical: 'canonical' };

// Apply sets each field to `value`; revert sets it back to `previous_value`. An empty value
// clears the override for that field, so the page shows its own value again.
function planFix(event: string, body: Record<string, unknown>): { set: SeoFields; unset: (keyof SeoFields)[] } | null {
  const changes = Array.isArray(body.changes) ? (body.changes as Record<string, unknown>[]) : [];
  const set: SeoFields = {};
  const unset: (keyof SeoFields)[] = [];
  for (const change of changes) {
    const key = FIELD_KEYS[String(change?.field ?? '')];
    if (!key) continue;
    const next = str(event === 'seo.fix.apply' ? change.value : change.previous_value);
    if (next) set[key] = next;
    else unset.push(key);
  }
  return Object.keys(set).length || unset.length ? { set, unset } : null;
}

// Where an editor can open the draft: the Sanity Studio edit screen for the delivery.
function draftLink(id: string): string | null {
  const studio = process.env.SANITY_STUDIO_URL?.replace(/\/+$/, '');
  return studio ? `${studio}/intent/edit/id=${encodeURIComponent(id)};type=vidrysContentDelivery` : null;
}

export async function POST(request: Request): Promise<Response> {
  const secret = process.env.VIDRYS_SIGNING_SECRET;
  if (!secret) return reply({ error: 'VIDRYS_SIGNING_SECRET is not set on this deployment.' }, 500);

  // Verify against the exact bytes received, before any parsing.
  const raw = new Uint8Array(await request.arrayBuffer());
  if (!verifySignature(secret, raw, request.headers.get('x-geo-signature'))) {
    return reply({ error: 'Invalid X-GEO-Signature.' }, 401);
  }

  const rawText = new TextDecoder().decode(raw);
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawText);
  } catch {
    return reply({ error: 'Body is not JSON.' }, 400);
  }
  const event = str(body.event) ?? '';

  try {
    switch (event) {
      case 'connection.test':
        return reply({ ok: true });

      case 'content.publish': {
        const title = str(body.title);
        const contentMarkdown = str(body.content_markdown);
        if (!title || !contentMarkdown) return reply({ error: 'content.publish needs title and content_markdown.' }, 400);
        const stored = await storeContentDelivery({
          event,
          title,
          requestedStatus: str(body.status) ?? null,
          contentMarkdown,
          contentHtml: str(body.content_html) ?? null,
          signatureOk: true,
          rawBody: rawText,
        });
        // The live page once an editor has published it, otherwise the draft in the Studio.
        return reply({ id: stored.id, url: stored.url ?? draftLink(stored.id) });
      }

      case 'seo.fix.apply':
      case 'seo.fix.revert': {
        const target = str(body.url);
        if (!target) return reply({ error: `${event} needs url.` }, 400);
        let host = '';
        try {
          host = new URL(target, 'https://getmeds.ph').host.toLowerCase();
        } catch {
          return reply({ error: 'url is not a valid URL.' }, 400);
        }
        if (!SITE_HOSTS.includes(host)) return reply({ applied: false, reason: `${host} is not served by this site.` });
        const path = normalizeSitePath(target);
        if (!pageTakesSeoOverrides(path)) return reply({ applied: false, reason: `${path} does not take SEO overrides (noindex or utility page).` });

        const plan = planFix(event, body);
        if (!plan) return reply({ error: `${event} needs changes with field meta_description, title or canonical.` }, 400);
        await writeSeoOverride(path, plan.set, plan.unset, {
          event,
          fixId: str(body.fix_id),
          idempotencyKey: str(body.idempotency_key),
        });
        // Drop the cached overrides and rebuild the page, so the change is live on the next visit.
        revalidateTag(VIDRYS_SEO_TAG, { expire: 0 });
        revalidatePath(path);
        return reply({ applied: true });
      }

      default:
        // Acknowledge rather than fail, so Vidrys doesn't keep retrying an event this site doesn't use.
        return reply({ ok: true, ignored: event || '(no event)' });
    }
  } catch (err) {
    // Storage failed (Sanity down, token missing): a 5xx lets Vidrys retry the delivery.
    console.error(`[vidrys] ${event} failed:`, err);
    return reply({ error: 'Could not process the event. It can be retried.' }, 500);
  }
}
