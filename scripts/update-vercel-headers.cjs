const fs = require('fs');
const path = require('path');

// Parser helper for .env
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        env[key] = value.trim();
      }
    });
  }
  return env;
}

// Routing is driven entirely by the "Products Range" workbook's own
// "Category Folder" / "Condition Slug (auto)" columns (read from the active
// product doc's json_data) — not by legacy `category` Sanity documents or
// any hardcoded subcategory-name-to-slug table. Kept as a second copy of the
// same fetch used in vite.config.js, since that file is ESM and this one is
// CJS (this script runs standalone via `node`, before Vite loads).
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
      const folderList = Array.from(folders).filter(Boolean);
      const conditionList = Array.from(conditionSlugs).filter(Boolean);
      console.log(`[Sanity Fetch] Loaded ${folderList.length} category folders and ${conditionList.length} condition slugs from the active product sheet.`);
      return { folders: folderList, conditionSlugs: conditionList };
    }
  } catch (error) {
    console.warn('[Sanity Fetch] Warn: Failed to fetch from Sanity, using robust offline fallback. Error:', error.message);
  }

  // Robust offline fallback if Sanity is unreachable or the sheet is empty
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

async function run() {
  const env = loadEnv();
  const deploymentMode = env.DEPLOYMENT || env.VITE_DEPLOYMENT || 'development';
  let corsOrigin = env.VITE_ALLOWED_CORS_ORIGIN || env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN;
  if (!corsOrigin) {
    corsOrigin = deploymentMode === 'production'
      ? env.VITE_CORS_ALLOWED_ORIGIN_PRODUCTION
      : env.VITE_CORS_ALLOWED_ORIGIN_DEVELOPMENT;
  }

  if (!corsOrigin) {
    console.log('[CORS Config] No CORS origin variable found in .env. Skipping headers generation.');
    process.exit(0);
  }

  if (corsOrigin.includes(',')) {
    const origins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);
    console.warn(`[CORS Config] Warning: Multiple origins specified (${corsOrigin}). Static vercel.json configuration only supports a single origin. Choosing the first one: ${origins[0]}`);
    corsOrigin = origins[0];
  }

  if (corsOrigin && corsOrigin !== '*') {
    if (!corsOrigin.startsWith('http://') && !corsOrigin.startsWith('https://')) {
      if (corsOrigin.includes('localhost')) {
        corsOrigin = 'http://' + corsOrigin;
      } else {
        corsOrigin = 'https://' + corsOrigin;
      }
    }
  }

  console.log(`[CORS Config] Configuring CORS allowed origin to: ${corsOrigin}`);

  const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
  if (!fs.existsSync(vercelConfigPath)) {
    console.error('[CORS Config] vercel.json not found!');
    process.exit(1);
  }

  let vercelConfig;
  try {
    vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf8'));
  } catch (err) {
    console.error('[CORS Config] Failed to parse vercel.json:', err);
    process.exit(1);
  }

  // Update CORS origins in headers
  const proxyRewrites = (vercelConfig.rewrites || []).filter(r => {
    return r.destination && (r.destination.startsWith('http://') || r.destination.startsWith('https://'));
  });

  const headers = vercelConfig.headers || [];
  const otherHeaders = headers.filter(h => {
    const isProxySource = proxyRewrites.some(r => r.source === h.source);
    if (!isProxySource) return true;
    const hasCors = h.headers && h.headers.some(header => header.key === 'Access-Control-Allow-Origin');
    return !hasCors;
  });

  const newHeaders = [...otherHeaders];

  proxyRewrites.forEach(r => {
    newHeaders.push({
      source: r.source,
      headers: [
        { key: 'Access-Control-Allow-Origin', value: corsOrigin },
        { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
        { key: 'Access-Control-Allow-Headers', value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' },
        { key: 'Access-Control-Allow-Credentials', value: 'true' }
      ]
    });
  });

  vercelConfig.headers = newHeaders;

  // Rebuild the product-section rewrites from the sheet's own URL columns.
  // Per the sheet: a Category Folder (cancer-medicines, antibiotics, ...) is a
  // top-level section where every path beneath it is a PRODUCT page (matches
  // "Product Page URL (auto)") — condition hubs are NOT nested under it, they
  // live in their own "/conditions/:slug" namespace (matches "Condition Hub
  // URL (auto)"). The legacy "product-range" alias is the one exception still
  // needing the old listing-vs-product guess, since it's a catch-all for
  // pre-rename bookmarked links spanning many folders, not a real folder.
  const routing = await fetchProductRouting(env);
  const allFolders = Array.from(new Set([...routing.folders, 'product-range']));
  const conditionPattern = routing.conditionSlugs.join('|');

  const STATIC_PAGE_NAMES = [
    '404', 'about-us', 'blog', 'blog-detail', 'careers', 'contact-us', 'conditions', 'csr', 'edit-profile',
    'employee-verification', 'global-presence', 'home-preview', 'meditations', 'order-medicines',
    'patient-assistance-program', 'product-detail', 'profile', 'services', 'under-development', 'ungc',
    'cancer-medicine', ...allFolders
  ];
  const STATIC_EXCLUSIONS = `${STATIC_PAGE_NAMES.join('|')}|api/|wp-json/|wp-content/|assets/|public/|components/|data/|src/|dist/|node_modules/|_vercel/|masteradmin|masteradlorock|masteradlorockpd|masteradlorockpdprocess|masteradlogriyon|adminadlorock|[^/]+\\.[^/]+$`;
  const catchAllSource = `/:slug((?!${STATIC_EXCLUSIONS})[^/]+)`;

  const folderRewrites = allFolders.flatMap((folder) => {
    return [
      { source: `/${folder}/:subcategory(${conditionPattern})`, destination: '/cancer-medicines' },
      { source: `/${folder}/:product`, destination: '/product-detail' },
      { source: `/${folder}`, destination: '/cancer-medicines' },
    ];
  });
  const conditionRewrites = [
    { source: `/conditions/:subcategory(${conditionPattern})`, destination: '/cancer-medicines' },
    { source: '/conditions', destination: '/cancer-medicines' },
  ];
  const cancerMedicineSingularRewrites = [
    { source: '/cancer-medicine/:product', destination: '/product-detail' },
    { source: '/cancer-medicine', destination: '/cancer-medicines' },
  ];

  if (vercelConfig.rewrites) {
    // Strip every previously-generated folder-specific rewrite and the old
    // static-list catch-all; everything else (wp-json proxy, blog, etc.) is
    // left exactly as it was. Matched by DESTINATION/fixed-source rather than
    // by hardcoding folder names — `allFolders` is fetched fresh from the
    // sheet on every run, so a folder-name allowlist here would silently stop
    // matching any folder renamed/removed from the sheet, leaving its old
    // rewrites stuck in the file forever and re-appending a fresh full set
    // for every folder on every run (this is what produced ~39x duplicate
    // rewrites per folder before this fix).
    const keep = vercelConfig.rewrites.filter((r) => {
      if (!r.source) return true;
      if (r.destination === '/cancer-medicines' || r.destination === '/product-detail') return false;
      if (r.source === '/cancer-medicine' || r.source.startsWith('/cancer-medicine/')) return false;
      if (r.source.startsWith('/conditions')) return false;
      if (r.destination && r.destination.startsWith('https://getmeds-admin.vercel.app/api/resolve-slug/')) return false;
      if (r.source.startsWith('/:slug(')) return false;
      return true;
    });
    const fallback = keep.filter((r) => r.source === '/:path*');
    const rest = keep.filter((r) => r.source !== '/:path*');

    vercelConfig.rewrites = [
      ...rest,
      ...folderRewrites,
      ...conditionRewrites,
      ...cancerMedicineSingularRewrites,
      { source: catchAllSource, destination: 'https://getmeds-admin.vercel.app/api/resolve-slug/:slug' },
      ...fallback,
    ];
    console.log(`[Sanity Fetch] Rebuilt rewrites for ${allFolders.length} category folder(s) + /conditions namespace (${conditionPattern.split('|').length} condition slugs).`);
  }

  if (Array.isArray(vercelConfig.headers)) {
    vercelConfig.headers = vercelConfig.headers.map((h) => {
      if (h.source && h.source.startsWith('/:slug(')) {
        return { ...h, source: catchAllSource };
      }
      return h;
    });
  }

  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8');
  console.log(`[CORS Config] Successfully updated vercel.json headers for ${proxyRewrites.length} proxy routes.`);
}

run().catch(err => {
  console.error('[CORS Script Error] Failed to run update script:', err);
  process.exit(1);
});
