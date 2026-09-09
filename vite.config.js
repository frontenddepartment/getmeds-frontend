import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { sanityImageSyncPlugin } from './src/plugins/sanityImageSync.js';
import { VitePWA } from 'vite-plugin-pwa';
import { PWA_TABBAR, PWA_TABBAR_CSS } from './src/plugins/pwaTabbar.js';

// Registration is injected rather than imported from the 18 page entries, so a
// new entry cannot silently ship without it. Deliberately plain DOM APIs and no
// workbox-window: this runs before the bundle on every page, and the update
// prompt is the only behaviour it needs.
const SW_REGISTER = `
<script>
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').then(function (reg) {
      // Check for a new worker on every page load. Chrome checks on its own
      // schedule otherwise, which is part of why a deploy could take a long
      // while to reach an installed app.
      if (reg && typeof reg.update === 'function') reg.update().catch(function () {});
    }).catch(function () { /* a failed registration must never break the page */ });
  });
})();
</script>`;

// Flags the installed app on <html> so CSS can branch on it. Injected into
// <head> and kept tiny and synchronous on purpose: it has to run before first
// paint, or the sections meant to be hidden in the app flash on screen and then
// disappear. navigator.standalone is the iOS-only predecessor to display-mode,
// still needed for Safari before 16.4.
const PWA_MODE = `
<script>
(function () {
  try {
    if (!(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true)) return;
    document.documentElement.classList.add('pwa-standalone');

    // getmeds.ph/ is a marketing page — hero carousel, statistics, CSR — which
    // is right for someone arriving from a search result and wrong for someone
    // who installed the app to browse the catalogue. The app has its own home,
    // and this sends the root there before anything paints, so the marketing
    // page never flashes up first. Website visitors are untouched: this only
    // runs in a standalone window.
    var p = location.pathname;
    if (p === '/' || p === '/index.html') {
      location.replace('/app-home' + location.search + location.hash);
    }
  } catch (e) { /* never let a display-mode probe break the page */ }
})();
</script>`;

/**
 * The three pieces that turn an ordinary page into the installed app's shell:
 * the standalone probe (which sets html.pwa-standalone and sends "/" to the
 * app's own home), the app CSS, and the tab bar.
 *
 * Pulled out of the build plugin because the dev server needs it too. The dev
 * middleware below serves most pages by reading the file and calling res.end()
 * directly, which bypasses Vite's transformIndexHtml pipeline entirely — so
 * for a long time NO page in dev got any of this. An app installed from the
 * dev server (the only way to exercise the installed app while working on it)
 * therefore opened the marketing homepage, with the website's top bar and no
 * tab bar, and "/" never redirected to /app-home: the app silently degraded
 * into the website.
 *
 * Service-worker registration is deliberately NOT part of this. That is the
 * piece the original "never in dev" warning was really about — a stale worker
 * holding on to yesterday's modules is a miserable thing to debug — and
 * nothing about the app shell needs it.
 */
const injectAppShell = (html) =>
  html
    .replace('<head>', '<head>' + PWA_MODE)
    .replace('</head>', PWA_TABBAR_CSS + '</head>')
    .replace('</body>', PWA_TABBAR + '\n</body>');

function injectPwaRuntime() {
  return {
    name: 'inject-pwa-runtime',
    apply: 'build', // the SW half of this must never run in dev
    transformIndexHtml(html) {
      return injectAppShell(html).replace('</body>', SW_REGISTER + '\n</body>');
    },
  };
}

/**
 * The dev counterpart, covering the pages the middleware below does NOT
 * special-case — /app-home and /cart among them, which it leaves to Vite's own
 * HTML handling (Vite resolves the extensionless path by appending .html).
 *
 * The two never double up: a page the middleware answers is written straight
 * to the socket and never reaches this hook, and a page that reaches this hook
 * was never touched by the middleware. Shell only, no service worker, for the
 * reason given on injectAppShell.
 */
function injectAppShellDev() {
  return {
    name: 'inject-app-shell-dev',
    apply: 'serve',
    transformIndexHtml(html) {
      return injectAppShell(html);
    },
  };
}

const getHtmlInputs = () => {
  const dir = process.cwd();
  const files = fs.readdirSync(dir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const inputs = {};
  htmlFiles.forEach(file => {
    const name = file.replace(/\.html$/, '');
    inputs[name] = path.resolve(dir, file);
  });
  return inputs;
};

// Routing is driven entirely by the "Products Range" workbook's own URL
// columns (read from the product doc's json_data) — not by legacy `category`
// Sanity documents or any hardcoded subcategory-name-to-slug table. Per the
// sheet's own URL columns:
//   - Category Folder is a top-level section (e.g. /cancer-medicines,
//     /antibiotics) — every path under it is a PRODUCT page, matching
//     "Product Page URL (auto)" (e.g. /cancer-medicines/pacliget-...).
//   - Condition Slug lives in its own separate "/conditions/:slug" namespace,
//     matching "Condition Hub URL (auto)" (e.g. /conditions/breast-cancer) —
//     it is never nested under the Category Folder.
// So there's no more ambiguity to resolve inside a folder path: a folder with
// a second path segment is always a product.
async function fetchProductRouting(env) {
  const isInvalid = (val) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');
  const rawProjectId = env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalid(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalid(rawDataset) ? 'production' : rawDataset;
  // NOTE: deliberately not filtering on defined(json_data) here — GROQ silently
  // fails to match that against this field once it's large (200KB+ of parsed
  // Excel data), even though the field is genuinely present. Presence is
  // checked in JS below instead.
  const query = '*[_type == "product" && (remarks == "present" || remarks == "active")] | order(_updatedAt desc)[0]{ json_data }';
  const url = `https://${projectId}.api.sanity.io/v2023-08-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const jsonData = json.result?.json_data;
    if (!jsonData) throw new Error('No json_data on active product doc');

    const parsed = JSON.parse(jsonData);
    const firstSheet = Object.keys(parsed)[0];
    const rows = firstSheet ? (parsed[firstSheet] || []) : [];

    const folders = new Set();
    const conditionSlugs = new Set();
    rows.forEach((row) => {
      if (row.categoryFolder) folders.add(String(row.categoryFolder).trim())
      if (row.conditionSlug) conditionSlugs.add(String(row.conditionSlug).trim())
    });

    if (folders.size > 0) {
      return { folders: Array.from(folders).filter(Boolean), conditionSlugs: Array.from(conditionSlugs).filter(Boolean) };
    }
  } catch (error) {
    // fallback silently below or log a warning
  }

  // Robust offline fallback if Sanity is unreachable or the sheet is empty
  return getFallbackProductRouting();
}

// Cached with a short TTL so the dev server picks up Sanity/Excel changes
// (new category folders, new conditions) within a minute without needing a
// restart, instead of only ever seeing whatever was true when Vite started.
let _routingCache = null;
const ROUTING_CACHE_TTL_MS = 30_000;
async function getProductRoutingCached(env) {
  const now = Date.now();
  if (_routingCache && now - _routingCache.fetchedAt < ROUTING_CACHE_TTL_MS) {
    return _routingCache.data;
  }
  const data = await fetchProductRouting(env);
  _routingCache = { data, fetchedAt: now };
  return data;
}

function getFallbackProductRouting() {
  return {
    folders: ['cancer-medicines'],
    conditionSlugs: [
      'breast-cancer', 'ovarian-cancer', 'lung-cancer', 'prostate-cancer', 'colorectal-cancer',
      'pancreatic-cancer', 'aml', 'cml', 'lymphoma', 'sickle-cell', 'respiratory', 'uti',
      'skin-infections', 'bone-infections', 'endometriosis', 'fibrocystic', 'multiple-myeloma',
      'osteoporosis', 'arrhythmia', 'hypertension', 'glioblastoma', 'allergic-rhinitis',
      'kidney-disease', 'pain', 'rheumatology', 'chronic-lymphocytic-leukemia',
      'acute-lymphoblastic-leukemia', 'malignant-pleural-mesothelioma', 'head-and-neck-cancer',
      'chronic-myeloid-leukemia', 'sickle-cell-anemia', 'malignant-pleural-effusion',
      'gastrointestinal-stromal-tumors', 'acute-myeloid-leukemia', 'acute-lymphocytic-leukemia',
      'chronic-myelocytic-leukemia', 'meningeal-leukemia', 'acute-promyelocytic-leukemia',
      'mantle-cell-lymphoma', 'neuro-oncology', 'glioblastoma-multiforme', 'obstetrician',
      'folate-deficiency-anemia', 'iron-deficiency-anemia', 'allergy', 'seasonal-allergic-rhinitis',
      'chronic-pain-management', 'inflammatory-rheumatic-disorders', 'endocrinology',
      'fibrocystic-breast-disease', 'benign-prostatic-hyperplasia', 'cardiology', 'arrhythmia-management',
      'hypertension-angina', 'renal', 'radiology', 'radiologic-imaging-enhancement-ct-scans-angiography-urography',
      'hematology', 'orthopedic', 'glucocorticoid-induced-osteoporosis', 'gynecology', 'anti-infectives',
      'respiratory-infections', 'urinary-tract-infections', 'gynecological-infections', 'intra-abdominal-infections',
      'skin-and-soft-tissue-infections', 'bone-and-joint-infections', 'bloodstream-infections', 'ocular-or-topical-infections',
      'nephrology'
    ]
  };
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  // Update vercel.json headers & subcategories dynamically at start
  try {
    execSync('node scripts/update-vercel-headers.cjs', { stdio: 'inherit' });
  } catch (err) {
    console.error('[CORS Script] Warning: Failed to run update-vercel-headers.cjs:', err.message);
  }

  // Product routing (category folders / condition slugs) is fetched fresh per
  // request inside the dev middleware below (getProductRoutingCached), not once
  // here — so it doesn't go stale until the server is restarted.

  // Expose Sanity env vars to Node plugin context (plugins run before Vite sets process.env)
  const isInvalid = (val) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');

  const sanityProjectId = isInvalid(env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID) ? 's7ocz8zp' : (env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID);
  const sanityDataset = isInvalid(env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET) ? 'production' : (env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET);
  const sanityApiVersion = isInvalid(env.VITE_SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION) ? '2024-01-01' : (env.VITE_SANITY_API_VERSION || process.env.VITE_SANITY_API_VERSION);

  process.env.VITE_SANITY_PROJECT_ID  = sanityProjectId;
  process.env.VITE_SANITY_DATASET     = sanityDataset;
  process.env.VITE_SANITY_API_VERSION = sanityApiVersion;
  process.env.SANITY_WRITE_TOKEN      = isInvalid(env.SANITY_WRITE_TOKEN) ? '' : env.SANITY_WRITE_TOKEN;

  const deploymentMode = env.VITE_DEPLOYMENT || env.DEPLOYMENT || 'development';
  const isProduction = deploymentMode === 'production';

  const chatbotUrl = isProduction
    ? (env.VITE_CHATBOT_API_URL && !env.VITE_CHATBOT_API_URL.includes('localhost') && !isInvalid(env.VITE_CHATBOT_API_URL) ? env.VITE_CHATBOT_API_URL : '/api/chatbot/ask')
    : (env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot/ask');

  const spreadsheetUrl = isProduction
    ? (env.VITE_SPREADSHEET_API_URL && !env.VITE_SPREADSHEET_API_URL.includes('localhost') && !isInvalid(env.VITE_SPREADSHEET_API_URL) ? env.VITE_SPREADSHEET_API_URL : '/api/append-to-spreadsheet')
    : (env.VITE_SPREADSHEET_API_URL || 'http://localhost:3333/api/append-to-spreadsheet');

  const wordpressApiBase = isInvalid(env.VITE_WORDPRESS_API_BASE) ? '/wp-json/wp/v2' : env.VITE_WORDPRESS_API_BASE;
  const wordpressApiRoot = isInvalid(env.VITE_WORDPRESS_API_ROOT) ? 'https://cms.getmeds.ph' : env.VITE_WORDPRESS_API_ROOT;

  const backendApiUrl = isProduction
    ? (env.VITE_BACKEND_API_URL || 'https://getmeds-admin.vercel.app')
    : (env.VITE_BACKEND_API_URL || 'http://localhost:8000');

  return {
    define: {
      'import.meta.env.VITE_DEPLOYMENT': JSON.stringify(deploymentMode),
      'import.meta.env.VITE_SPREADSHEET_API_URL': JSON.stringify(spreadsheetUrl),
      'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify(sanityProjectId),
      'import.meta.env.VITE_SANITY_DATASET': JSON.stringify(sanityDataset),
      'import.meta.env.VITE_SANITY_API_VERSION': JSON.stringify(sanityApiVersion),
      'import.meta.env.VITE_WORDPRESS_API_BASE': JSON.stringify(wordpressApiBase),
      'import.meta.env.VITE_WORDPRESS_API_ROOT': JSON.stringify(wordpressApiRoot)
    },
    server: {
      cors: {
        origin: (origin, callback) => {
          const allowedString = env.VITE_ALLOWED_CORS_ORIGIN || env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN || '*';
          const allowedOrigins = allowedString.split(',').map(o => o.trim()).filter(Boolean);
          
          if (!origin || allowedOrigins.includes('*')) {
            callback(null, true);
            return;
          }
          
          const isAllowed = allowedOrigins.some(allowed => {
            if (origin === allowed) return true;
            try {
              const allowedUrl = allowed.startsWith('http') ? new URL(allowed) : null;
              const allowedHost = allowedUrl ? allowedUrl.hostname : allowed;
              const originUrl = new URL(origin);
              if (originUrl.hostname === allowedHost) return true;
            } catch (e) {
              // ignore
            }
            return false;
          });

          if (isAllowed) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
      },
      proxy: {
        '/wp-json': {
          target: wordpressApiRoot,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('Origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('Referer');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('x-forwarded-for');
              proxyReq.removeHeader('X-Forwarded-For');
              proxyReq.removeHeader('x-forwarded-host');
              proxyReq.removeHeader('X-Forwarded-Host');
              proxyReq.removeHeader('x-forwarded-proto');
              proxyReq.removeHeader('X-Forwarded-Proto');
              proxyReq.removeHeader('x-forwarded-port');
              proxyReq.removeHeader('X-Forwarded-Port');
              const targetUrl = new URL(wordpressApiRoot);
              proxyReq.setHeader('Host', targetUrl.host);
              proxyReq.setHeader('host', targetUrl.host);
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
            });
          }
        },
        '/wp-content': {
          target: wordpressApiRoot,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('Origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('Referer');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('x-forwarded-for');
              proxyReq.removeHeader('X-Forwarded-For');
              proxyReq.removeHeader('x-forwarded-host');
              proxyReq.removeHeader('X-Forwarded-Host');
              proxyReq.removeHeader('x-forwarded-proto');
              proxyReq.removeHeader('X-Forwarded-Proto');
              proxyReq.removeHeader('x-forwarded-port');
              proxyReq.removeHeader('X-Forwarded-Port');
              const targetUrl = new URL(wordpressApiRoot);
              proxyReq.setHeader('Host', targetUrl.host);
              proxyReq.setHeader('host', targetUrl.host);
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
            });
          }
        },
        '/api/careers': {
          target: 'https://getmeds-test-creation.vercel.app',
          changeOrigin: true,
          secure: false,
        },
        '/api': {
          target: backendApiUrl,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    esbuild: {
      drop: isProduction ? ['console', 'debugger'] : []
    },
    build: {
      rollupOptions: {
        input: getHtmlInputs()
      }
    },
    plugins: [
      sanityImageSyncPlugin(),
      injectPwaRuntime(),
      injectAppShellDev(),
      VitePWA({
        // injectManifest, not generateSW: the routing rules in src/sw.js —
        // blog excluded, product URLs falling back to a shared shell — are not
        // expressible through generateSW's options.
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        registerType: 'prompt',
        injectRegister: false, // injectPwaRuntime() above handles this
        manifest: false,       // hand-written at public/manifest.webmanifest
        injectManifest: {
          // Images are excluded wholesale. public/assets is ~550 MB and lands in
          // dist/assets alongside the hashed bundles, so a naive image glob would
          // try to precache the entire media library onto every visitor's phone.
          // Product imagery is cached at runtime instead (see sw.js), and the two
          // images that must exist offline are listed explicitly.
          globPatterns: ['**/*.{js,css,html}', 'manifest.webmanifest', 'icons/*.png', 'fallback.jpg'],
          globIgnores: [
            // The blog is deliberately never cached — see sw.js. Its page
            // bundles go too, so the precache matches that scope exactly
            // rather than shipping ~60 KB of blog JS to people who never
            // open it.
            'blog.html',
            'blog-detail.html',
            'assets/blog-*.js',
            'assets/blog-detail-*.js',
            // Preview routes are noindex staff tools; no reason to ship them offline.
            '**/*-preview.html',
            '**/*sitemap*',
          ],
          maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        },
        devOptions: { enabled: false },
      }),
      {

        name: 'inject-chatbot-meta',
        transformIndexHtml(html) {
          const suppressor = `\n  <script>
    (function() {
      var w = console.warn;
      console.warn = function() {
        if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('cdn.tailwindcss.com') !== -1) return;
        w.apply(console, arguments);
      };
    })();
  </script>`;
          return html
            .replace('<head>', '<head>' + suppressor)
            .replace(
              '</head>',
              `  <meta name="getmeds-sanity-project-id" content="${sanityProjectId}" />
  <meta name="getmeds-sanity-dataset" content="${sanityDataset}" />
  <meta name="getmeds-sanity-api-version" content="${sanityApiVersion}" />\n</head>`
            );
        }
      },
    {
      name: 'pap-tsx-rewrite',
      configureServer(server) {
        if (process.env.NODE_ENV !== 'production') {
          server.middlewares.use(async (req, res, next) => {
            // Re-fetched (with a short cache) on every request instead of once at
            // server startup, so new/changed categories, conditions, or products in
            // Sanity show up without needing to restart the dev server.
            const { folders: categoryFolders, conditionSlugs } = await getProductRoutingCached(env);
            const urlPath = (req.url || '').split('?')[0];
            const cleanPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
            const qs = (req.url || '').includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
            
            if (cleanPath === '/index.html') {
              const htmlPath = path.join(process.cwd(), 'home-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/pap.html' || cleanPath === '/pap' || cleanPath === '/pap/') {
              res.statusCode = 301;
              res.setHeader('Location', '/patient-assistance-program' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/patient-assistance-program.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/patient-assistance-program' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/patient-assistance-program' || cleanPath === '/patient-assistance-program/') {
              const htmlPath = path.join(process.cwd(), 'patient-assistance-program-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/ungc.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/ungc' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/ungc' || cleanPath === '/ungc/') {
              const htmlPath = path.join(process.cwd(), 'ungc.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/careers.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/careers' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/careers' || cleanPath === '/careers/') {
              const htmlPath = path.join(process.cwd(), 'careers.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/csr.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/csr' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/csr' || cleanPath === '/csr/') {
              const htmlPath = path.join(process.cwd(), 'csr.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/global-presence.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/global-presence' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/global-presence' || cleanPath === '/global-presence/') {
              const htmlPath = path.join(process.cwd(), 'global-presence.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/services.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/services' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/services' || cleanPath === '/services/') {
              const htmlPath = path.join(process.cwd(), 'services.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/contact-us.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/contact-us' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/contact-us' || cleanPath === '/contact-us/') {
              const htmlPath = path.join(process.cwd(), 'contact-us.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/about-us.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/about-us' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/about-us' || cleanPath === '/about-us/') {
              const htmlPath = path.join(process.cwd(), 'about-us.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/meditations.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/meditations' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/meditations' || cleanPath === '/meditations/') {
              const htmlPath = path.join(process.cwd(), 'meditations.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/employee-verification.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/employee-verification' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/employee-verification' || cleanPath === '/employee-verification/') {
              const htmlPath = path.join(process.cwd(), 'employee-verification.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            const policyRoutes = [
              'policy',
              'policies',
              'return-and-refund-policy',
              'privacy-policy',
              'terms-of-service',
              'medical-disclaimer',
              'prescription-policy',
              'shipping-and-delivery-policy',
            ];

            for (const route of policyRoutes) {
              if (cleanPath === `/${route}.html`) {
                res.statusCode = 302;
                res.setHeader('Location', `/${route}` + qs);
                res.end();
                return;
              }
              if (cleanPath === `/${route}` || cleanPath === `/${route}/`) {
                const htmlPath = path.join(process.cwd(), 'policy.html');
                if (fs.existsSync(htmlPath)) {
                  const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                  res.setHeader('Content-Type', 'text/html');
                  res.end(htmlContent);
                  return;
                }
              }
            }
            // /cancer-medicine/* (singular) — legacy oncology product-detail alias,
            // always a product slug, never a condition hub.
            if (cleanPath === '/cancer-medicine.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/cancer-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/cancer-medicine' || cleanPath === '/cancer-medicine/' || (cleanPath.startsWith('/cancer-medicine/') && !cleanPath.startsWith('/cancer-medicines'))) {
              const segments = cleanPath.split('/').filter(Boolean);
              if (segments[0] === 'cancer-medicine' && segments.length === 2) {
                const htmlPath = path.join(process.cwd(), 'product-detail.html');
                if (fs.existsSync(htmlPath)) {
                  res.setHeader('Content-Type', 'text/html');
                  res.end(injectAppShell(fs.readFileSync(htmlPath, 'utf-8')));
                  return;
                }
              } else {
                res.statusCode = 302;
                res.setHeader('Location', '/cancer-medicines' + qs);
                res.end();
                return;
              }
            }

            // "/conditions/:slug" — the sheet's own Condition Hub URL (auto) namespace.
            // This exists so a crawler following sitemap.xml lands on real content
            // instead of a 404; the app itself never actively resolves or filters by
            // this URL (see cancer-medicines.tsx) — all in-app links use the category
            // folder from Product Page URL (auto) instead.
            if (cleanPath === '/conditions.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/cancer-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath.startsWith('/conditions/') || cleanPath === '/conditions') {
              const htmlPath = path.join(process.cwd(), 'cancer-medicines.html');
              if (fs.existsSync(htmlPath)) {
                res.setHeader('Content-Type', 'text/html');
                res.end(injectAppShell(fs.readFileSync(htmlPath, 'utf-8')));
                return;
              }
            }

            // Every real Category Folder from the sheet (cancer-medicines,
            // antibiotics, heart-medicines, ...): a bare folder is the listing
            // page (cancer-medicines.html); anything else under it is always a
            // product page (product-detail.html) — matching "Product Page URL
            // (auto)" exactly, since condition hubs live under /conditions/ now,
            // never nested here. The legacy "product-range" alias is the one
            // exception still needing the old listing-vs-product guess, since
            // it's a catch-all for pre-rename bookmarked links, not a real folder.
            const routableFolders = [...categoryFolders, 'product-range'];
            const folderSegments = cleanPath.split('/').filter(Boolean);
            const requestedFolder = folderSegments[0];
            if (requestedFolder && routableFolders.includes(requestedFolder)) {
              if (cleanPath === `/${requestedFolder}.html`) {
                res.statusCode = 302;
                res.setHeader('Location', `/${requestedFolder}` + qs);
                res.end();
                return;
              }
              const isListing = folderSegments.length === 1
                || conditionSlugs.includes(folderSegments[1]);
              const htmlPath = path.join(process.cwd(), isListing ? 'cancer-medicines.html' : 'product-detail.html');
              if (fs.existsSync(htmlPath)) {
                res.setHeader('Content-Type', 'text/html');
                res.end(injectAppShell(fs.readFileSync(htmlPath, 'utf-8')));
                return;
              }
            }
            if (cleanPath === '/product-detail.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/product-detail' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/product-detail' || cleanPath === '/product-detail/') {
              const htmlPath = path.join(process.cwd(), 'product-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/order-medicines.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/order-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/order-medicines' || cleanPath === '/order-medicines/') {
              const htmlPath = path.join(process.cwd(), 'order-medicines.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/articles.html' || cleanPath === '/articles' || cleanPath === '/articles/') {
              res.statusCode = 301;
              res.setHeader('Location', '/blog' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/article-detail.html' || cleanPath === '/article-detail' || cleanPath === '/article-detail/') {
              const htmlPath = path.join(process.cwd(), 'blog-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/blog.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/blog' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/blog' || cleanPath === '/blog/') {
              const htmlPath = path.join(process.cwd(), 'blog.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath.startsWith('/blog/') && cleanPath.split('/').filter(Boolean).length >= 2) {
              const htmlPath = path.join(process.cwd(), 'blog-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/home/') {
              const htmlPath = path.join(process.cwd(), 'home-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = injectAppShell(fs.readFileSync(htmlPath, 'utf-8'));
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            next();
          });
        }
      }
    }
  ]
};
});
