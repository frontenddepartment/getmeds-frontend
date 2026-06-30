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

const env = loadEnv();
const deploymentMode = env.DEPLOYMENT || env.VITE_DEPLOYMENT || 'development';
let corsOrigin = deploymentMode === 'production'
  ? (env.VITE_CORS_ALLOWED_ORIGIN_PRODUCTION || env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN)
  : (env.VITE_CORS_ALLOWED_ORIGIN_DEVELOPMENT || env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN);

if (!corsOrigin) {
  console.log('[CORS Config] No CORS origin variable found in .env. Skipping headers generation.');
  process.exit(0);
}

if (corsOrigin.includes(',')) {
  const origins = corsOrigin.split(',').map(o => o.trim()).filter(Boolean);
  console.warn(`[CORS Config] Warning: Multiple origins specified (${corsOrigin}). Static vercel.json configuration only supports a single origin. Choosing the first one: ${origins[0]}`);
  corsOrigin = origins[0];
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

// Filter rewrites that are proxies to external domains
const proxyRewrites = (vercelConfig.rewrites || []).filter(r => {
  return r.destination && (r.destination.startsWith('http://') || r.destination.startsWith('https://'));
});

// We want to add/overwrite headers for these sources
const headers = vercelConfig.headers || [];

// Remove any existing CORS header configurations we previously generated/controlled for proxy routes
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

fs.writeFileSync(vercelConfigPath, JSON.stringify(vercelConfig, null, 2) + '\n', 'utf8');
console.log(`[CORS Config] Successfully updated vercel.json headers for ${proxyRewrites.length} proxy routes.`);
