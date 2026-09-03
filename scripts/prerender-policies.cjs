// Generates one static HTML file per policy slug, so /privacy-policy, /terms-of-service
// and friends each get their own title/description/canonical/OG baked into the raw HTTP
// response. Before this, all of them were rewritten onto the single `policy.html` shell
// in vercel.json and served byte-identical HTML — six URLs that only diverged after the
// React app hydrated and called setPageMeta(). Runs as a `postbuild` step, after
// `vite build` has already produced `dist/`.
//
// Same Sanity fetch/parse and injectHead pattern as scripts/prerender-slugs.cjs and
// scripts/prerender-blog.cjs (duplicated intentionally — these are standalone CJS
// scripts, and folding them into a shared module is out of scope here).
//
// The vercel.json rewrites for these slugs are deliberately left in place: Vercel checks
// the filesystem before applying rewrites, so these generated files win, and the rewrites
// stay behind as a fallback if this step is ever skipped.
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://getmeds.ph';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Mirrors DEFAULT_POLICIES in src/pages/policy.tsx — the same fallback set the page
// itself renders when Sanity is unreachable. Kept in slug order, not title order.
const POLICIES = [
  { slug: 'return-and-refund-policy', title: 'Return & Refund Policy', effectiveDate: 'August 07, 2026' },
  { slug: 'privacy-policy', title: 'Privacy Policy', effectiveDate: 'August 07, 2026' },
  { slug: 'terms-of-service', title: 'Terms of Service', effectiveDate: 'August 07, 2026' },
  { slug: 'medical-disclaimer', title: 'Medical Disclaimer', effectiveDate: 'August 07, 2026' },
  { slug: 'prescription-policy', title: 'Prescription Policy', effectiveDate: 'August 07, 2026' },
  { slug: 'shipping-and-delivery-policy', title: 'Shipping & Delivery Policy', effectiveDate: 'August 07, 2026' },
];

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

// Same GROQ as the "policiesDisclaimers.all" entry in src/lib/sanityProxy.ts.
async function fetchPolicies() {
  const env = loadEnv();
  const isInvalid = (val) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');
  const rawProjectId = env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalid(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalid(rawDataset) ? 'production' : rawDataset;
  const query = '*[_type == "policiesDisclaimers"] | order(title asc)';
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity API returned status ${res.status}`);
  const json = await res.json();
  return Array.isArray(json.result) ? json.result : [];
}

function slugOf(doc) {
  const s = doc && doc.slug;
  if (!s) return '';
  return typeof s === 'object' ? (s.current || '') : String(s);
}

// Matches the excerpt policy.tsx builds client-side, so the prerendered description and
// the hydrated one agree instead of flipping on load.
function excerptFrom(contentHtml) {
  return String(contentHtml || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 155);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectHead(template, { title, description, canonicalPath }) {
  let html = template;
  const fullTitle = `${title} - Getmeds`;
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;

  // policy.html ships its own canonical/og:url so that /policy is self-canonical when
  // this step is skipped. Strip them before appending this slug's own, or the page
  // would carry two conflicting canonicals.
  html = html.replace(/[ \t]*<link\s+rel=["']canonical["'][^>]*>\r?\n?/gi, '');
  html = html.replace(/[ \t]*<meta\s+property=["']og:url["'][^>]*>\r?\n?/gi, '');

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${escapeHtml(description)}">`);

  const extraTags = [
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Getmeds">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${DOMAIN}/assets/getmedslogo.png">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
  ].join('\n    ');

  return html.replace(/<\/head>/i, `    ${extraTags}\n</head>`);
}

async function main() {
  const templatePath = path.join(DIST_DIR, 'policy.html');
  if (!fs.existsSync(templatePath)) {
    console.log('[Prerender Policies] dist/policy.html not found — skipping (did `vite build` run first?).');
    return;
  }
  const template = fs.readFileSync(templatePath, 'utf8');

  let docs = [];
  try {
    docs = await fetchPolicies();
  } catch (err) {
    console.warn('[Prerender Policies] Sanity fetch failed, using static fallbacks:', err.message);
  }

  const bySlug = new Map();
  docs.forEach(d => {
    const s = slugOf(d);
    if (s) bySlug.set(s, d);
  });

  let written = 0;
  POLICIES.forEach(p => {
    const doc = bySlug.get(p.slug);
    const title = (doc && doc.title) || p.title;
    const effectiveDate = (doc && doc.effectiveDate) || p.effectiveDate;
    const description = excerptFrom(doc && doc.contentHtml)
      || `Read Getmeds' ${title} — effective ${effectiveDate}.`;

    const html = injectHead(template, {
      title,
      description,
      canonicalPath: `/${p.slug}`,
    });

    fs.writeFileSync(path.join(DIST_DIR, `${p.slug}.html`), html, 'utf8');
    written++;
  });

  console.log(`[Prerender Policies] Wrote ${written} policy page(s) to dist/.`);
}

main();
