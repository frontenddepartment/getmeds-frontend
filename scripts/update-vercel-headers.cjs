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

const getSubcategorySlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-');
};

async function fetchSanitySubcategories(env) {
  const projectId = env.VITE_SANITY_PROJECT_ID || 'q9y7lsh1';
  const dataset = env.VITE_SANITY_DATASET || 'production';
  const query = '*[_type == "category"] { category, subcategory }';
  const url = `https://${projectId}.api.sanity.io/v2023-08-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const subcats = new Set();

    if (json.result) {
      json.result.forEach(cat => {
        if (cat.category) {
          subcats.add(getSubcategorySlug(cat.category));
        }
        if (Array.isArray(cat.subcategory)) {
          cat.subcategory.forEach(sub => {
            if (sub) {
              subcats.add(getSubcategorySlug(sub));
            }
          });
        }
      });
    }

    const list = Array.from(subcats).filter(Boolean);
    if (list.length > 0) {
      console.log(`[Sanity Fetch] Loaded ${list.length} dynamic categories/subcategories from Sanity.`);
      return list;
    }
  } catch (error) {
    console.warn('[Sanity Fetch] Warn: Failed to fetch from Sanity, using robust offline fallback. Error:', error.message);
  }

  // Robust fallback subcategories
  return [
    'breast-cancer', 'ovarian-cancer', 'lung-cancer', 'prostate-cancer', 'colorectal-cancer',
    'pancreatic-cancer', 'aml', 'cml', 'lymphoma', 'sickle-cell', 'respiratory', 'uti',
    'skin-infections', 'bone-infections', 'endometriosis', 'fibrocystic', 'multiple-myeloma',
    'osteoporosis', 'arrhythmia', 'hypertension', 'glioblastoma', 'allergic-rhinitis',
    'kidney-disease', 'pain', 'rheumatology', 'chronic-lymphocytic-leukemia'
  ];
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

  // Fetch and update Sanity subcategories in rewrites
  const subcategories = await fetchSanitySubcategories(env);
  if (vercelConfig.rewrites) {
    let updatedRewritesCount = 0;
    const subcatPattern = subcategories.join('|');
    vercelConfig.rewrites = vercelConfig.rewrites.map(rewrite => {
      if (rewrite.source && (
        rewrite.source.startsWith('/cancer-medicines/:subcategory(') ||
        rewrite.source.startsWith('/cancer-medicine/:subcategory(') ||
        rewrite.source.startsWith('/product-range/:subcategory(')
      )) {
        let prefix;
        if (rewrite.source.startsWith('/cancer-medicines/')) prefix = 'cancer-medicines';
        else if (rewrite.source.startsWith('/cancer-medicine/')) prefix = 'cancer-medicine';
        else prefix = 'product-range';
        rewrite.source = `/${prefix}/:subcategory(${subcatPattern})`;
        updatedRewritesCount++;
      }
      return rewrite;
    });
    console.log(`[Sanity Fetch] Successfully updated ${updatedRewritesCount} rewrite routes in vercel.json.`);
  }

  fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8');
  console.log(`[CORS Config] Successfully updated vercel.json headers for ${proxyRewrites.length} proxy routes.`);
}

run().catch(err => {
  console.error('[CORS Script Error] Failed to run update script:', err);
  process.exit(1);
});
