/**
 * sw.js — Getmeds service worker (vite-plugin-pwa, injectManifest mode)
 * ─────────────────────────────────────────────
 * Scope of the offline experience, deliberately narrow: the product catalogue,
 * the inquiry forms, contact details and the FAQ. The blog (379 posts) and the
 * condition hubs are explicitly NOT cached — see the NetworkOnly route below.
 *
 * The catalogue works offline without precaching 66 product pages. Those pages
 * are 7 KB shells that hydrate from a single ~230 KB GROQ response, and Vercel
 * already rewrites /product-range/:product to /product-detail. So caching one
 * shell plus one JSON payload makes every product reachable offline — and it
 * has to work this way regardless, because the prerendered per-product files
 * are written by `postbuild`, after Vite has generated this precache manifest.
 */
import { precacheAndRoute, matchPrecache, cleanupOutdatedCaches } from 'workbox-precaching'
import { registerRoute, setCatchHandler } from 'workbox-routing'
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { ExpirationPlugin } from 'workbox-expiration'
import { CacheableResponsePlugin } from 'workbox-cacheable-response'
import { clientsClaim } from 'workbox-core'

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

const OFFLINE_PAGE = '/offline.html'
const PRODUCT_SHELL = '/product-detail.html'

// The 14 real product category folders (from vercel.json's rewrites). Used to
// tell a product URL apart from a marketing page, since both are two segments.
const PRODUCT_CATEGORIES = [
  'cancer-medicines', 'blood-disorder-medicines', 'antibiotics', 'heart-medicines',
  'anemia-medicines', 'hormonal-therapy', 'diabetes-medicines', 'bone-health-medicines',
  'allergy-medicines', 'contrast-media', 'anti-inflammatory-medicines', 'pain-management',
  'kidney-medicines', 'brain-cancer-medicines', 'product-range',
]

const isProductUrl = (url) => {
  const seg = url.pathname.split('/').filter(Boolean)
  return seg.length === 2 && PRODUCT_CATEGORIES.includes(seg[0])
}

// ── Blog and condition hubs: never cached ────────────────────────────────────
// Blog freshness is the whole point of the WordPress "Deploy to getmeds.ph"
// button and the prerender step behind it. A cached copy served to a returning
// reader would quietly undo that, so these bypass the cache entirely.
registerRoute(
  ({ request, url }) =>
    request.mode === 'navigate' &&
    (url.pathname === '/blog' || url.pathname.startsWith('/blog/') || url.pathname.startsWith('/conditions/')),
  new NetworkOnly()
)

// ── Everything else navigable: fresh when online, cached copy when not ───────
registerRoute(
  ({ request }) => request.mode === 'navigate',
  new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 4, // a stalled mobile connection should fall back, not hang
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
)

// ── Sanity content: instant from cache, refreshed in the background ──────────
// This one response carries the whole product catalogue, plus the FAQ and
// contact documents, so it is what actually makes the catalogue work offline.
registerRoute(
  ({ url }) => url.hostname.endsWith('.apicdn.sanity.io') || url.hostname.endsWith('.api.sanity.io'),
  new StaleWhileRevalidate({
    cacheName: 'sanity-content',
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
)

// ── Product imagery: cached as it is actually viewed, with a ceiling ─────────
// Capped at 60 so a long browse cannot fill the device; Workbox evicts the
// least recently used first, and purgeOnQuotaError lets it recover rather than
// wedge if the origin's storage quota is hit.
registerRoute(
  ({ request, url }) =>
    request.destination === 'image' &&
    (url.hostname === 'cdn.sanity.io' || url.hostname.endsWith('.sanity.io')),
  new CacheFirst({
    cacheName: 'product-images',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true }),
    ],
  })
)

// ── Third-party CDNs the pages cannot render without ─────────────────────────
// Styling comes from the Tailwind Play CDN, icons from Font Awesome and the
// phone field from intl-tel-input — all cross-origin. Without this a cached
// page opens offline completely unstyled, which is arguably worse than an
// honest offline notice. These are opaque (status 0) cross-origin responses,
// which is why CacheableResponsePlugin has to accept 0 alongside 200.
//
// Cloudflare Turnstile is deliberately absent: a challenge script only has
// meaning against a live server, and a stale copy would mint tokens the
// backend rejects.
registerRoute(
  ({ url }) =>
    url.hostname === 'cdn.tailwindcss.com' ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'cdn.jsdelivr.net',
  new CacheFirst({
    cacheName: 'cdn-assets',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true }),
    ],
  })
)

// ── Offline fallbacks ────────────────────────────────────────────────────────
setCatchHandler(async ({ request, url }) => {
  if (request.mode === 'navigate') {
    // Any catalogue URL falls back to the product shell, which then renders
    // from the cached Sanity payload — so products never visited before are
    // still readable offline.
    if (isProductUrl(url)) {
      const shell = await matchPrecache(PRODUCT_SHELL)
      if (shell) return shell
    }
    const offline = await matchPrecache(OFFLINE_PAGE)
    if (offline) return offline
  }
  if (request.destination === 'image') {
    const fallback = await matchPrecache('/fallback.jpg')
    if (fallback) return fallback
  }
  return Response.error()
})

// ── Update handling ──────────────────────────────────────────────────────────
// A new worker takes over as soon as it installs, instead of sitting in
// "waiting" until someone accepts a prompt.
//
// The prompt was the wrong trade here. A waiting worker keeps serving the
// PREVIOUS precache, so an installed app can go on showing yesterday's pages
// indefinitely — which is exactly why fixes appeared not to take effect, and
// why the tab bar was missing on pages the app had already cached.
//
// The usual objection to skipWaiting is swapping the app out mid-task. That is
// avoided by NOT force-reloading the open page: clientsClaim only changes which
// worker answers the next request, so whatever is on screen keeps its already
// loaded HTML and scripts. This is a multi-page app, so the next tap is a full
// navigation and picks up the new build a moment later.
self.skipWaiting()
clientsClaim()
