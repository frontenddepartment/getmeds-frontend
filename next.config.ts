import type { NextConfig } from 'next';
import { withSerwist } from '@serwist/turbopack';

// Routing carried over from getmeds_frontend/vercel.json. Page rewrites that only existed
// because the old site was a set of static HTML files (e.g. /antibiotics -> /cancer-medicines)
// are handled by App Router routes instead; what's left here is the proxying and redirects.

const backendUrl = (
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.VITE_BACKEND_API_URL ||
  'https://getmeds-admin.vercel.app'
).replace(/\/$/, '');

// Careers listings are served by a different deployment than the rest of the API.
const careersApiUrl = (process.env.CAREERS_API_URL || 'https://getmeds-test-creation.vercel.app').replace(/\/$/, '');

const WORDPRESS_URL = 'https://cms.getmeds.ph';
const ADMIN_URL = 'https://admin.getmeds.ph';

const ADMIN_PANELS = [
  'masteradmin',
  'masteradlorock',
  'masteradlorockpd',
  'masteradlorockpdprocess',
  'masteradlogriyon',
  'adminadlorock',
];

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    workerThreads: false,
  },
  async headers() {
    const noindex = (value: string) => [{ key: 'X-Robots-Tag', value }];
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      { source: '/blog-detail', headers: noindex('noindex') },
      { source: '/product-detail', headers: noindex('noindex') },
      { source: '/card/:slug*', headers: noindex('noindex, nofollow') },
      // The browser must always re-check the service worker, or a deploy can take a long
      // while to reach an installed app.
      {
        source: '/sw.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
          { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: '/sitemap.html', destination: '/sitemap', permanent: true },

      // Renamed blog posts
      { source: '/blog/how-to-get-medical-assistance-from-dswd', destination: '/blog/how-to-get-medical-assistance-from-dswd-your-2025-ultimate-guide', permanent: true },
      { source: '/blog/14-essential-cancer-screening-tests-for-women-early-detection-in-the-philippines', destination: '/blog/14-essential-cancer-screening-tests-for-women-early-cancer-detection-in-the-philippines', permanent: true },
      { source: '/blog/nutrition-tips-for-a-healthy-immune-system', destination: '/blog/nutrition-tips-to-boost-your-immune-system', permanent: true },
      { source: '/blog/cough-and-cold-medicines', destination: '/blog/best-cough-and-cold-otc-medicines', permanent: true },
      { source: '/blog/how-to-cure-cough-and-cold', destination: '/blog/best-cough-and-cold-otc-medicines', permanent: true },
      { source: '/blog/maintain-a-healthy-weight', destination: '/blog/ways-to-maintain-healthy-weight', permanent: true },
      { source: '/blog/best-supplements-and-vitamins-for-kids', destination: '/blog/best-vitamin-supplements-for-kids', permanent: true },

      // Old WordPress article URLs
      { source: '/articles', destination: '/blog', permanent: true },
      { source: '/articles.html', destination: '/blog', permanent: true },
      { source: '/articles/:slug*', destination: '/blog/:slug*', permanent: true },
      { source: '/article-detail', destination: '/blog-detail', permanent: true },
      { source: '/article-detail.html', destination: '/blog-detail', permanent: true },
      { source: '/blog-detail.html', destination: '/blog-detail', permanent: true },
      // Dated WordPress permalinks (/2024/05/slug) now live under /blog
      { source: '/:year(\\d{4})/:path+', destination: '/blog/:year/:path+', permanent: true },

      { source: '/product-range.html', destination: '/product-range', permanent: true },
      { source: '/cancer-medicines/amloget%2010-amlodipine-10-mg-tablet', destination: '/cancer-medicines/amloget-10-amlodipine-10-mg-tablet', permanent: true },
      { source: '/cancer-medicines/amloget%205-amlodipine-5-mg-tablet', destination: '/cancer-medicines/amloget-5-amlodipine-5-mg-tablet', permanent: true },
      { source: '/cancer-medicines/vancoget%20500-vancomycin-500-mg-powder-for-injection-i-v', destination: '/cancer-medicines/vancoget-500-vancomycin-500-mg-powder-for-injection-i-v', permanent: true },
      { source: '/cancer-medicines/vancoget%201000-vancomycin-1-g-powder-for-injection-i-v', destination: '/cancer-medicines/vancoget-1000-vancomycin-1-g-powder-for-injection-i-v', permanent: true },
      { source: '/cancer-medicines/gemget%20200-gemcitabine-200-mg-lyophilized-powder-for-injection-iv', destination: '/cancer-medicines/gemget-200-gemcitabine-200-mg-lyophilized-powder-for-injection-iv', permanent: true },
      { source: '/cancer-medicine', destination: '/cancer-medicines', permanent: true },
      { source: '/cancer-medicine/:product', destination: '/cancer-medicines/:product', permanent: true },

      { source: '/pap', destination: '/patient-assistance-program', permanent: true },
      { source: '/pap.html', destination: '/patient-assistance-program', permanent: true },

      { source: '/policy', destination: '/return-and-refund-policy', permanent: true },
      { source: '/policies', destination: '/return-and-refund-policy', permanent: true },
      { source: '/return-and-refund-policy.html', destination: '/return-and-refund-policy', permanent: true },
      { source: '/privacy-policy.html', destination: '/privacy-policy', permanent: true },
      { source: '/terms-of-service.html', destination: '/terms-of-service', permanent: true },
      { source: '/medical-disclaimer.html', destination: '/medical-disclaimer', permanent: true },
      { source: '/prescription-policy.html', destination: '/prescription-policy', permanent: true },
      { source: '/shipping-and-delivery-policy.html', destination: '/shipping-and-delivery-policy', permanent: true },

      // The old site served every page as <name>.html with cleanUrls on
      // (public/offline.html is a real file, served as-is for the service worker)
      { source: '/:page((?!offline\\.)[a-z0-9-]+)\\.html', destination: '/:page', permanent: true },
      { source: '/index', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/wp-json/:path*', destination: `${WORDPRESS_URL}/wp-json/:path*` },
        { source: '/wp-content/:path*', destination: `${WORDPRESS_URL}/wp-content/:path*` },
        { source: '/api/careers', destination: `${careersApiUrl}/api/careers` },
        { source: '/api/:path*', destination: `${backendUrl}/api/:path*` },
        { source: '/public/:path*', destination: `${ADMIN_URL}/public/:path*` },
        ...ADMIN_PANELS.flatMap((panel) => [
          { source: `/${panel}`, destination: `${ADMIN_URL}/${panel}` },
          { source: `/${panel}/:path*`, destination: `${ADMIN_URL}/${panel}/:path*` },
        ]),
        { source: '/card', destination: '/business-card' },
        // The service worker is built by src/app/serwist/[path]/route.ts; it stays at /sw.js,
        // where the old site registered it, so installed apps update in place.
        { source: '/sw.js', destination: '/serwist/sw.js' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

// withSerwist keeps esbuild (which builds the service worker) out of the server bundle.
export default withSerwist(nextConfig);
