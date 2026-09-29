import { createSerwistRoute } from '@serwist/turbopack';

// Builds src/app/sw.ts with the precache manifest injected, and serves it (plus any chunk it
// splits into) from /serwist/<file>. next.config.ts rewrites /sw.js here, the URL the old site
// registered its worker at.

// The two shell pages change with every build and have no file to hash, so they are revisioned
// per build. This route is force-static, so the value is fixed when the build runs.
const BUILD_REVISION = process.env.VERCEL_GIT_COMMIT_SHA || String(Date.now());

export const { dynamic, dynamicParams, revalidate, generateStaticParams, GET } = createSerwistRoute({
  swSrc: 'src/app/sw.ts',
  useNativeEsbuild: true,
  // Precache the app's own bundles and the few files that must exist offline, as the old
  // vite-plugin-pwa config did. Never public/**: public/assets is ~550 MB of media, which would
  // otherwise be downloaded onto every visitor's phone. Product imagery is cached at runtime.
  globPatterns: [
    '.next/static/**/*.{js,css}',
    'public/manifest.webmanifest',
    'public/icons/*.png',
    'public/fallback.jpg',
    'public/offline.html',
  ],
  maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
  additionalPrecacheEntries: [
    { url: '/product-detail', revision: BUILD_REVISION },
    { url: '/business-card', revision: BUILD_REVISION },
  ],
});
