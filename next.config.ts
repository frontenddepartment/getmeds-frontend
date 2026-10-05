import type { NextConfig } from 'next';

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

const BLOG_RELATIVE_PAGES = [
  'services', 'about-us', 'careers', 'product-range', 'contact-us', 'meditations', 'csr',
  'global-presence', 'ungc', 'order-medicines', 'patient-assistance-program',
].join('|');

/**
 * Old-catalogue product slugs (under /cancer-medicines/) and the current page for the same
 * product. Google still has these from the old site; without a redirect they are 404s.
 * Pacliget 260 mg has no current equivalent, so it stays a 404.
 */
const OLD_PRODUCT_ADDRESSES: Record<string, string> = {
  'methoget-500-methotrexate-100mg-ml-n-n-500mg-5ml-solution-for-injection-n-n-im-iv-intra-arterial-intrathecal': '/cancer-medicines/methoget-500-methotrexate-500mg-5ml-injection',
  'bendaget-bendamustine-100-mg-lyophilized-powder-for-concentrate-solution-for-iv-infusion': '/blood-disorder-medicines/bendaget-bendamustine-100mg-infusion',
  'idaget-5-idarubicin-hydrochloride-5-mg-lyophilized-powder-for-injection-iv': '/blood-disorder-medicines/idaget-5-idarubicin-hydrochloride-5mg-injection',
  'doseget-80-docetaxel-40-mg-ml-n-80-mg-2-ml-concentrate-solution-for-iv-infusion': '/cancer-medicines/doseget-80-docetaxel-80mg-2ml-infusion',
  'doseget-20-docetaxel-rtu-20-mg-0-5-ml-concentrate-solution-for-iv-infusion': '/cancer-medicines/doseget-docetaxel-rtu-20mg-injection',
  'vancoget-500-vancomycin-500-mg-powder-for-injection-i-v': '/antibiotics/vancoget-500-vancomycin-hydrochloride-500mg-injection',
  'vancoget-1000-vancomycin-1-g-powder-for-injection-i-v': '/antibiotics/vancoget-1000-vancomycin-hydrochloride-1g-injection',
  'capeget-capecitabine-500-mg-film-coated-tablet': '/cancer-medicines/capeget-capecitabine-500mg-tablet',
  'oxaliget-oxaliplatin-2mg-ml-100mg-50ml-solution-for-iv-infusion': '/cancer-medicines/oxaliget-oxaliplatin-100mg-50ml-infusion',
  'hydroxyget-hydroxyurea-500-mg-capsule': '/cancer-medicines/hydroxyget-hydroxyurea-500mg-capsule',
  'amloget-10-amlodipine-10-mg-tablet': '/heart-medicines/amloget-10-amlodipine-besilate-10mg-tablet',
  'amloget-5-amlodipine-5-mg-tablet': '/heart-medicines/amloget-5-amlodipine-besilate-5mg-tablet',
  'gemget-200-gemcitabine-200-mg-lyophilized-powder-for-injection-iv': '/cancer-medicines/gemget-200-gemcitabine-200mg-injection',
};

/** Old-catalogue condition/category pages and today's condition (or category) page. */
const OLD_CONDITION_ADDRESSES: Record<string, string> = {
  '/product-range/osteoporosis': '/conditions/glucocorticoid-induced-osteoporosis',
  '/cancer-medicines/osteoporosis': '/conditions/glucocorticoid-induced-osteoporosis',
  '/product-range/fibrocystic': '/conditions/fibrocystic-breast-disease',
  '/cancer-medicines/sickle-cell': '/conditions/sickle-cell-anemia',
  '/product-range/respiratory': '/conditions/respiratory-infections',
  '/product-range/uti': '/conditions/urinary-tract-infections',
  '/cancer-medicines/aml': '/conditions/acute-myeloid-leukemia',
  '/cancer-medicines/cml': '/conditions/chronic-myeloid-leukemia',
  '/product-range/pain': '/conditions/chronic-pain-management',
  '/product-range/cardiology': '/heart-medicines',
};

// Browser code only receives NEXT_PUBLIC_* variables; a VITE_* name (what the old Vite site,
// and so its Vercel project, used) is never inlined, and reading it in the browser gives
// undefined. Accept either name here so a build with only the VITE_* variables set still
// ships the values. Without this the Turnstile site key came out empty, no verification
// widget rendered, and the backend rejected every form with "complete the verification check".
const PUBLIC_ENV_NAMES = [
  'BACKEND_API_URL',
  'SANITY_PROJECT_ID',
  'SANITY_DATASET',
  'SANITY_API_VERSION',
  'WORDPRESS_API_ROOT',
  'TURNSTILE_SITE_KEY',
];
const publicEnv = Object.fromEntries(
  PUBLIC_ENV_NAMES.flatMap((name) => {
    const value = process.env[`NEXT_PUBLIC_${name}`] || process.env[`VITE_${name}`];
    return value ? [[`NEXT_PUBLIC_${name}`, value]] : [];
  }),
);

const nextConfig: NextConfig = {
  // Self-hosted on the InMotion VPS: the build emits .next/standalone (server.js plus only the
  // node_modules it needs), which the GitHub deploy workflow uploads and PM2 runs.
  output: 'standalone',
  env: publicEnv,
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
      // public/sw.js retires the service worker the installed app (PWA) used to register. The
      // browser must always re-check it, or phones would keep running the old one.
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

      // Website pages the old blog templates linked without a leading "/" (so /blog/services,
      // /blog/product-range?category=...). Google still crawls them; the query string carries over.
      // No WordPress post uses these slugs.
      { source: `/blog/:page(${BLOG_RELATIVE_PAGES})`, destination: '/:page', permanent: true },
      { source: `/blog/:page(${BLOG_RELATIVE_PAGES})\\.html`, destination: '/:page', permanent: true },

      // WordPress archive pages (category, tag, author, page/N). The blog has no such pages, so
      // without these they'd be 404s now that unknown blog addresses are; /blog lists every post.
      { source: '/blog/:archive(category|tag|author|page)/:path*', destination: '/blog', permanent: true },

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
      // Product and condition addresses from the old catalogue, straight to today's page (no
      // second hop). Before the generic /cancer-medicine/:product rule so the singular forms
      // land here too.
      ...Object.entries(OLD_PRODUCT_ADDRESSES).flatMap(([slug, destination]) => [
        { source: `/cancer-medicines/${slug}`, destination, permanent: true },
        { source: `/cancer-medicine/${slug}`, destination, permanent: true },
      ]),
      ...Object.entries(OLD_CONDITION_ADDRESSES).map(([source, destination]) => ({ source, destination, permanent: true })),
      { source: '/cancer-medicines/amloget%2010-amlodipine-10-mg-tablet', destination: OLD_PRODUCT_ADDRESSES['amloget-10-amlodipine-10-mg-tablet'], permanent: true },
      { source: '/cancer-medicines/amloget%205-amlodipine-5-mg-tablet', destination: OLD_PRODUCT_ADDRESSES['amloget-5-amlodipine-5-mg-tablet'], permanent: true },
      { source: '/cancer-medicines/vancoget%20500-vancomycin-500-mg-powder-for-injection-i-v', destination: OLD_PRODUCT_ADDRESSES['vancoget-500-vancomycin-500-mg-powder-for-injection-i-v'], permanent: true },
      { source: '/cancer-medicines/vancoget%201000-vancomycin-1-g-powder-for-injection-i-v', destination: OLD_PRODUCT_ADDRESSES['vancoget-1000-vancomycin-1-g-powder-for-injection-i-v'], permanent: true },
      { source: '/cancer-medicines/gemget%20200-gemcitabine-200-mg-lyophilized-powder-for-injection-iv', destination: OLD_PRODUCT_ADDRESSES['gemget-200-gemcitabine-200-mg-lyophilized-powder-for-injection-iv'], permanent: true },
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
      { source: '/:page([a-z0-9-]+)\\.html', destination: '/:page', permanent: true },
      { source: '/index', destination: '/', permanent: true },

      // Screens that belonged to the installed app (PWA). They live in the Getmeds mobile app
      // now (getmeds_mobile_app), so the website has one address per page and no app-only
      // pages; old links and home-screen shortcuts land on the nearest website page.
      { source: '/app-home', destination: '/', permanent: true },
      { source: '/search', has: [{ type: 'query', key: 'q', value: '(?<q>.+)' }], destination: '/product-range?search=:q', permanent: true },
      { source: '/search', destination: '/product-range', permanent: true },
      { source: '/cart', destination: '/order-medicines', permanent: true },
      { source: '/chat', destination: '/contact-us', permanent: true },
      { source: '/profile', destination: '/', permanent: true },
      { source: '/account', destination: '/', permanent: true },
      { source: '/edit-profile', destination: '/', permanent: true },
      { source: '/offline', destination: '/', permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [
        { source: '/wp-json/:path*', destination: `${WORDPRESS_URL}/wp-json/:path*` },
        { source: '/wp-content/:path*', destination: `${WORDPRESS_URL}/wp-content/:path*` },
        { source: '/api/careers', destination: `${careersApiUrl}/api/careers` },
        { source: '/api/:path((?!vidrys(?:/|$)).*)', destination: `${backendUrl}/api/:path` },
        { source: '/public/:path*', destination: `${ADMIN_URL}/public/:path*` },
        ...ADMIN_PANELS.flatMap((panel) => [
          { source: `/${panel}`, destination: `${ADMIN_URL}/${panel}` },
          { source: `/${panel}/:path*`, destination: `${ADMIN_URL}/${panel}/:path*` },
        ]),
        { source: '/card', destination: '/business-card' },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

export default nextConfig;
