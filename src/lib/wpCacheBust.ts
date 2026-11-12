/*
 * cms.getmeds.ph sits behind a proxy cache (response header X-Proxy-Cache: HIT/MISS) that also
 * caches the WordPress REST API. A build that asked for the post list could get a copy saved
 * before an editor's change, so /blog shipped the old title even though "Deploy to getmeds.ph"
 * ran after the edit (2026-11-12: the DSWD guide still read "2025" in the list and search).
 *
 * wpFresh() adds a query parameter the proxy has not seen before, which forces a MISS:
 *   - BOOT changes with every build and every server start, so each deploy reads WordPress fresh;
 *   - the hour bucket changes once per REVALIDATE window, so hourly page refreshes do too.
 * Within one hour of one process the URL stays the same, so Next's own data cache keeps working.
 */
const BOOT = Date.now().toString(36);

export function wpFresh(url: string, windowSeconds = 3600): string {
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000)).toString(36);
  return `${url}${url.includes('?') ? '&' : '?'}_gm=${BOOT}-${bucket}`;
}
