/// <reference lib="webworker" />
/**
 * sw.ts — Getmeds service worker, ported from getmeds_frontend/src/sw.js (Workbox) to Serwist,
 * the Workbox fork Next.js recommends. Built by src/app/serwist/[path]/route.ts and served at
 * /sw.js (see the rewrite in next.config.ts), the URL the old site registered, so an app already
 * installed from the old site picks this worker up as an ordinary update.
 *
 * Scope of the offline experience, deliberately narrow: the product catalogue, the inquiry
 * forms, contact details and the FAQ. The blog and the condition hubs are explicitly NOT
 * cached — see the NetworkOnly route below.
 */
import type { PrecacheEntry, RouteMatchCallbackOptions, SerwistGlobalConfig } from 'serwist';
import { STATIC_CATEGORY_FOLDERS } from '../lib/categoryFolders';
import {
  CacheFirst,
  CacheableResponsePlugin,
  ExpirationPlugin,
  NetworkFirst,
  NetworkOnly,
  Serwist,
  StaleWhileRevalidate,
} from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const OFFLINE_PAGE = '/offline.html';
// The old site's product-detail.html and business-card.html shells. Both pages work out what
// to show from the address bar, so one cached copy serves every product / card URL offline.
const PRODUCT_SHELL = '/product-detail';
const CARD_SHELL = '/business-card';

// The real product category folders (from vercel.json's rewrites). Used to tell a product URL
// apart from a marketing page, since both are two segments.
const PRODUCT_CATEGORIES = [...STATIC_CATEGORY_FOLDERS, 'product-range'];

const isProductUrl = (url: URL) => {
  const seg = url.pathname.split('/').filter(Boolean);
  return seg.length === 2 && PRODUCT_CATEGORIES.includes(seg[0]);
};

const isNavigation = ({ request }: RouteMatchCallbackOptions) => request.mode === 'navigate';

// Caches the old Vite site's worker left behind that this one can't reuse: its precache, and
// its 'pages' cache, whose HTML points at bundles that no longer exist after the move to Next.
// The Sanity, image and CDN caches hold the same URLs as before and are kept.
const LEGACY_CACHES = (name: string) => name === 'pages' || name.startsWith('workbox-precache');

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: { cleanupOutdatedCaches: true },
  // A new worker takes over as soon as it installs, instead of sitting in "waiting". A waiting
  // worker keeps serving the previous precache, so an installed app could go on showing
  // yesterday's pages indefinitely. clientsClaim only changes which worker answers the next
  // request; the page on screen is never force-reloaded.
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    // ── Blog and condition hubs: never cached ───────────────────────────────────────
    // Blog freshness is the whole point of the WordPress "Deploy to getmeds.ph" button. A
    // cached copy served to a returning reader would quietly undo that.
    {
      matcher: ({ request, url }) =>
        request.mode === 'navigate' &&
        (url.pathname === '/blog' || url.pathname.startsWith('/blog/') || url.pathname.startsWith('/conditions/')),
      handler: new NetworkOnly(),
    },

    // ── Everything else navigable: fresh when online, cached copy when not ─────────
    {
      matcher: isNavigation,
      handler: new NetworkFirst({
        cacheName: 'pages-next',
        networkTimeoutSeconds: 4, // a stalled mobile connection should fall back, not hang
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({ maxEntries: 40, maxAgeSeconds: 60 * 60 * 24 * 7 }),
        ],
      }),
    },

    // ── Sanity content: instant from cache, refreshed in the background ────────────
    // This one response carries the whole product catalogue, plus the FAQ and contact
    // documents, so it is what actually makes the catalogue work offline.
    {
      matcher: ({ url }) => url.hostname.endsWith('.apicdn.sanity.io') || url.hostname.endsWith('.api.sanity.io'),
      handler: new StaleWhileRevalidate({
        cacheName: 'sanity-content',
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 7 }),
        ],
      }),
    },

    // ── Product imagery: cached as it is actually viewed, with a ceiling ───────────
    // Capped at 60 so a long browse cannot fill the device; least recently used goes first,
    // and purgeOnQuotaError lets it recover rather than wedge if storage runs out.
    {
      matcher: ({ request, url }) =>
        request.destination === 'image' && (url.hostname === 'cdn.sanity.io' || url.hostname.endsWith('.sanity.io')),
      handler: new CacheFirst({
        cacheName: 'product-images',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true }),
        ],
      }),
    },

    // ── Third-party CDNs the pages cannot render without ───────────────────────────
    // Font Awesome and intl-tel-input. Opaque (status 0) cross-origin responses, which is why
    // CacheableResponsePlugin accepts 0 alongside 200. Cloudflare Turnstile is deliberately
    // absent: a stale challenge script would mint tokens the backend rejects.
    {
      matcher: ({ url }) => url.hostname === 'cdnjs.cloudflare.com' || url.hostname === 'cdn.jsdelivr.net',
      handler: new CacheFirst({
        cacheName: 'cdn-assets',
        plugins: [
          new CacheableResponsePlugin({ statuses: [0, 200] }),
          new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30, purgeOnQuotaError: true }),
        ],
      }),
    },
  ],

  // ── Offline fallbacks (first match wins) ─────────────────────────────────────────
  fallbacks: {
    entries: [
      // Any catalogue URL falls back to the product shell, which renders from the cached
      // Sanity payload, so products never visited before are still readable offline.
      { url: PRODUCT_SHELL, matcher: ({ request }) => request.mode === 'navigate' && isProductUrl(new URL(request.url)) },
      // A scanned business card, looked up once, stays readable where signal is worst; Save to
      // Contacts still works, since building a vCard never touches the network.
      { url: CARD_SHELL, matcher: ({ request }) => request.mode === 'navigate' && new URL(request.url).pathname.startsWith('/card/') },
      { url: OFFLINE_PAGE, matcher: ({ request }) => request.mode === 'navigate' },
      { url: '/fallback.jpg', matcher: ({ request }) => request.destination === 'image' },
    ],
  },
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(names.filter(LEGACY_CACHES).map((name) => caches.delete(name)))),
  );
});

serwist.addEventListeners();
