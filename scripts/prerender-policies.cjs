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
const { withSiteName, excerptFromHtml } = require('./lib/site-title.cjs');
const { DEFAULT_OG_IMAGE, ogImageTags } = require('./lib/og-images.cjs');
const body = require('./lib/prerender-body.cjs');

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
// the hydrated one agree instead of flipping on load. Both now call the shared helper: the
// hand-rolled slice(0, 155) this replaced cut mid-thought ("…committed to protecting the")
// and left stored entities to be escaped a second time into "&amp;mdash;".
function excerptFrom(contentHtml) {
  return excerptFromHtml(contentHtml, 155);
}

// The policy itself inside #root, with policy.tsx's own classes, readable without
// JavaScript and on screen until the live page takes over (src/lib/handoff.ts).
function policyMarkup({ title, effectiveDate, lastUpdated, contentHtml }) {
  const e = body.escapeHtml;
  return [
    '<div class="max-w-6xl mx-auto px-4 pt-24 pb-2 relative z-10"><a href="/" class="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors font-medium">Back to Home</a></div>',
    '<div class="max-w-6xl mx-auto px-4 text-center py-6 relative z-10">',
    '<span class="inline-block text-xs font-semibold px-3 py-1 rounded-md mb-3 text-white uppercase tracking-wider shadow-xs" style="background: linear-gradient(135deg, #61A644, #1D9FDA)">Policies &amp; Disclaimers</span>',
    `<h1 class="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-2">${e(title)}</h1>`,
    `<p class="text-xs text-gray-500">Effective Date: ${e(effectiveDate)}${lastUpdated ? ` &bull; Last Updated: ${e(lastUpdated)}` : ''}</p>`,
    '</div>',
    '<div class="max-w-4xl mx-auto px-4 pb-20 mt-4 relative z-10"><main class="min-w-0"><article class="min-w-0">',
    contentHtml
      ? `<div class="policy-html-content bg-white p-6 md:p-10 rounded-lg border border-gray-200 shadow-xs">${body.sanitizeCmsHtml(contentHtml)}</div>`
      : '',
    '</article></main></div>',
  ].join(String.fromCharCode(10));
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectHead(template, { title, description, canonicalPath }) {
  let html = template;
  const fullTitle = withSiteName(title);
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;

  // policy.html ships its own canonical/og:url so that /policy is self-canonical when
  // this step is skipped. Strip them before appending this slug's own, or the page
  // would carry two conflicting canonicals.
  html = html.replace(/[ \t]*<link\s+rel=["']canonical["'][^>]*>\r?\n?/gi, '');
  html = html.replace(/[ \t]*<meta\s+property=["']og:url["'][^>]*>\r?\n?/gi, '');
  // A shell that ships its own share image (order-medicines.html does) would otherwise end
  // up with two og:image blocks once this page's own is appended.
  html = html.replace(/[ \t]*<meta\s+property=["']og:image(?::[a-z]+)?["'][^>]*>\r?\n?/gi, '');

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${escapeHtml(description)}">`);

  const extraTags = [
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Getmeds Philippines">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    ...ogImageTags(DEFAULT_OG_IMAGE),
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

    const withContent = body.fillRoot(html, policyMarkup({
      title,
      effectiveDate,
      lastUpdated: (doc && doc.lastUpdated) || p.effectiveDate,
      contentHtml: doc && doc.contentHtml,
    }));
    fs.writeFileSync(path.join(DIST_DIR, `${p.slug}.html`), withContent, 'utf8');
    written++;
  });

  console.log(`[Prerender Policies] Wrote ${written} policy page(s) to dist/.`);
}

main();
