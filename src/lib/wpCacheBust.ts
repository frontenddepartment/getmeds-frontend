/*
 * Requests to the WordPress REST API on cms.getmeds.ph, past its proxy cache and its rate limit.
 *
 * Proxy cache. The host caches REST responses (header X-Proxy-Cache: HIT/MISS), so a build could
 * be handed a post list saved before an editor's change, and /blog shipped the old title even
 * though "Deploy to getmeds.ph" ran after the edit (2026-11-12, the DSWD guide). wpFresh() adds a
 * query parameter the proxy hasn't seen, which forces a fresh answer.
 *
 * WP_FRESH_KEY is set once in next.config.ts when the build starts and inlined into the server
 * code, so it is the same in every process of one build (repeat requests hit Next's fetch cache)
 * and fixed at runtime; the hour bucket refreshes the parameter once per revalidate window.
 *
 * Rate limit. The host answers 429 (Too Many Requests) to quick bursts: ~40 requests fired four
 * at a time made the build's post list fail and /blog shipped empty (2026-11-12, reverted in
 * 15f8296). wpFetch() waits and retries on 429/503 (honouring Retry-After), and callers that
 * fan out (per-category lists, media batches) send one request at a time.
 */
const BUILD_KEY = process.env.WP_FRESH_KEY || 'dev';

export function wpFresh(url: string, windowSeconds = 3600): string {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000)).toString(36);
  return `${url}${url.includes('?') ? '&' : '?'}_gm=${BUILD_KEY}-${bucket}`;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** fetch() for the WordPress API: retries 429 and 503 up to three times, backing off 2s, 4s, 8s. */
export async function wpFetch(url: string, init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }): Promise<Response> {
  let res = await fetch(url, init);
  for (let attempt = 0; attempt < 3 && (res.status === 429 || res.status === 503); attempt++) {
    const retryAfter = Number(res.headers.get('retry-after'));
    await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? Math.min(retryAfter, 30) * 1000 : 2000 * 2 ** attempt);
    res = await fetch(url, init);
  }
  return res;
}
