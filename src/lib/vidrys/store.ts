// Server-only storage for the Vidrys webhook, in Sanity (this site has no SQL database; Sanity
// is its data store). The document types are defined in the Studio, getmeds_database:
// schema/core/vidrysContentDelivery.ts and schema/core/vidrysSeoOverride.ts.
//
// Do not import from a client component: it uses the write token.
import { createHash } from 'node:crypto';
import { createClient, type SanityClient } from '@sanity/client';
import { normalizeSitePath } from './paths';

const sha256 = (text: string) => createHash('sha256').update(text, 'utf8').digest('hex');

let writeClient: SanityClient | null = null;
function sanityWriter(): SanityClient {
  const token = process.env.SANITY_WRITE_TOKEN;
  if (!token) throw new Error('SANITY_WRITE_TOKEN is not set, so Vidrys deliveries cannot be stored.');
  writeClient ??= createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 's7ocz8zp',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: '2024-01-01',
    token,
    useCdn: false,
  });
  return writeClient;
}

// ── content.publish ──────────────────────────────────────────────────────────

export type ContentDeliveryInput = {
  event: string;
  title: string;
  requestedStatus: string | null;
  contentMarkdown: string;
  contentHtml: string | null;
  signatureOk: boolean;
  rawBody: string;
};

/**
 * Stores a delivery as a draft for editors ("editorialStatus: received"); nothing is published.
 * content.publish carries no id, so the document id is derived from (title, sha256 of the
 * markdown): a repeat delivery lands on the same id and the existing row is returned.
 * The "vidrysContentDelivery." prefix keeps these documents out of Sanity's public API.
 */
export async function storeContentDelivery(input: ContentDeliveryInput): Promise<{ id: string; url: string | null; duplicate: boolean }> {
  const client = sanityWriter();
  const contentHash = sha256(input.contentMarkdown);
  const id = `vidrysContentDelivery.${sha256(`${input.title}\u0000${contentHash}`).slice(0, 40)}`;

  const existing = await client.getDocument<{ publicUrl?: string | null }>(id);
  if (existing) return { id, url: existing.publicUrl ?? null, duplicate: true };

  const created = await client.createIfNotExists({
    _id: id,
    _type: 'vidrysContentDelivery',
    receivedAt: new Date().toISOString(),
    event: input.event,
    title: input.title,
    requestedStatus: input.requestedStatus,
    contentMarkdown: input.contentMarkdown,
    contentHtml: input.contentHtml,
    contentHash,
    signatureOk: input.signatureOk,
    editorialStatus: 'received',
    publicUrl: null,
    publishedAt: null,
    rawBody: input.rawBody,
  });
  return { id, url: (created as { publicUrl?: string | null }).publicUrl ?? null, duplicate: false };
}

// ── seo.fix.apply / seo.fix.revert ───────────────────────────────────────────

export type SeoFields = { title?: string; metaDescription?: string; canonical?: string };

/** Public id (no dot) so the site can read overrides without a token. */
export const seoOverrideId = (path: string) => `vidrys-seo-${sha256(normalizeSitePath(path)).slice(0, 32)}`;

/**
 * Writes one Vidrys fix to the page's override: `set` fields take the given value, `unset`
 * fields are removed so the page goes back to its own value from the site code and Sanity.
 * Re-sending the same fix (Vidrys retries reuse the idempotency_key) writes the same values,
 * so it is safe to repeat.
 */
export async function writeSeoOverride(
  path: string,
  set: SeoFields,
  unset: (keyof SeoFields)[],
  details: { event: string; fixId?: string; idempotencyKey?: string },
): Promise<void> {
  const client = sanityWriter();
  const id = seoOverrideId(path);
  const normalized = normalizeSitePath(path);
  await client.createIfNotExists({ _id: id, _type: 'vidrysSeoOverride', path: normalized });
  let patch = client.patch(id).set({
    ...set,
    path: normalized,
    lastEvent: details.event,
    lastFixId: details.fixId ?? null,
    lastIdempotencyKey: details.idempotencyKey ?? null,
    updatedAt: new Date().toISOString(),
  });
  if (unset.length) patch = patch.unset(unset);
  await patch.commit();
}
