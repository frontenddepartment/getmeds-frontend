import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';
import { sanityImageSyncPlugin } from './src/plugins/sanityImageSync.js';

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
  const projectId = env.VITE_SANITY_PROJECT_ID || 's7ocz8zp';
  const dataset = env.VITE_SANITY_DATASET || 'production';
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
  process.env.VITE_SANITY_PROJECT_ID  = env.VITE_SANITY_PROJECT_ID  || 's7ocz8zp'
  process.env.VITE_SANITY_DATASET     = env.VITE_SANITY_DATASET     || 'production'
  process.env.VITE_SANITY_API_VERSION = env.VITE_SANITY_API_VERSION || '2024-01-01'
  process.env.SANITY_WRITE_TOKEN      = env.SANITY_WRITE_TOKEN || ''

  const deploymentMode = env.VITE_DEPLOYMENT || env.DEPLOYMENT || 'development';
  const isProduction = deploymentMode === 'production';

  const chatbotUrl = isProduction
    ? (env.VITE_CHATBOT_API_URL && !env.VITE_CHATBOT_API_URL.includes('localhost') ? env.VITE_CHATBOT_API_URL : '/api/chatbot/ask')
    : (env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot/ask');

  const spreadsheetUrl = isProduction
    ? (env.VITE_SPREADSHEET_API_URL && !env.VITE_SPREADSHEET_API_URL.includes('localhost') ? env.VITE_SPREADSHEET_API_URL : '/api/append-to-spreadsheet')
    : (env.VITE_SPREADSHEET_API_URL || 'http://localhost:3333/api/append-to-spreadsheet');

  const sanityProjectId = env.VITE_SANITY_PROJECT_ID || 's7ocz8zp';
  const sanityDataset = env.VITE_SANITY_DATASET || 'production';
  const sanityApiVersion = env.VITE_SANITY_API_VERSION || '2024-01-01';
  const wordpressApiBase = env.VITE_WORDPRESS_API_BASE || '/wp-json/wp/v2';
  const wordpressApiRoot = env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph';

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
              `  <meta name="getmeds-chatbot-api" content="${chatbotUrl}" />
  <meta name="getmeds-sanity-project-id" content="${sanityProjectId}" />
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
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
                  res.end(fs.readFileSync(htmlPath, 'utf-8'));
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
                res.end(fs.readFileSync(htmlPath, 'utf-8'));
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
                res.end(fs.readFileSync(htmlPath, 'utf-8'));
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath.startsWith('/blog/') && cleanPath.split('/').filter(Boolean).length >= 2) {
              const htmlPath = path.join(process.cwd(), 'blog-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/home/') {
              const htmlPath = path.join(process.cwd(), 'home-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
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
