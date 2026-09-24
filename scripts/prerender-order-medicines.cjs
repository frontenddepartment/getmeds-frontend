// Generates one static HTML file per Order Medicines audience, so /order-medicines/patients
// and its three siblings each get their own title/description/canonical/OG baked into the raw
// HTTP response.
//
// Before the split, all four audiences shared the single /order-medicines URL and were chosen
// from localStorage after the React app hydrated — four genuinely different pages (a patient
// prescription upload, a doctor inquiry, a distributor application, a hospital quotation)
// behind one title, one description and one canonical. Nothing a crawler saw distinguished
// them, because there was nothing to distinguish.
//
// Same injectHead pattern as scripts/prerender-policies.cjs, which does this for the policy
// slugs; deliberately duplicated rather than shared, as those are standalone CJS scripts.
// Runs as a `postbuild` step, after `vite build` has produced `dist/`.
//
// The vercel.json rewrites for these paths are deliberately left in place: Vercel checks the
// filesystem before applying rewrites, so these generated files win, and the rewrites stay
// behind as a fallback if this step is ever skipped.
const fs = require('fs');
const path = require('path');
const { withSiteName } = require('./lib/site-title.cjs');
const { ORDER_OG_IMAGE, ogImageTags } = require('./lib/og-images.cjs');

const DOMAIN = 'https://getmeds.ph';
const DIST_DIR = path.join(__dirname, '..', 'dist');

// Mirrors ORDER_AUDIENCES in src/lib/orderAudiences.ts, which is what the page itself reads
// to decide which audience a path addresses. This is CommonJS run by node during the build
// and that is TypeScript bundled for the browser, so they cannot be one module — the slugs
// and the `meta` strings must be changed in both. A slug that exists here but not there
// prerenders a page that then renders the hub; the reverse ships an audience page with the
// hub's metadata.
const AUDIENCES = [
  {
    slug: 'patients',
    title: 'Order Prescription Medicine Online for Patients',
    description:
      'Upload your prescription and have your medicines delivered nationwide in the Philippines. Senior and PWD discounts honoured.',
  },
  {
    slug: 'doctors',
    title: 'Medicine Orders for Doctors and Healthcare Professionals',
    description:
      'Product orders, pricing, documentation and Compassionate Special Permit coordination for doctors across the Philippines.',
  },
  {
    slug: 'distributors',
    title: 'Pharmaceutical Distributor and Wholesale Pharmacy Supply',
    description:
      'Wholesale supply, credit terms and a distributor account for pharmacies and drugstores across the Philippines.',
  },
  {
    slug: 'hospitals',
    title: 'Hospital Medicine Procurement and Quotations',
    description:
      'Quotations, emergency purchases and institutional supply for hospitals and healthcare institutions in the Philippines.',
  },
];

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function injectHead(template, { title, description, canonicalPath }) {
  let html = template;
  const fullTitle = withSiteName(title);
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;

  // order-medicines.html ships the hub's own canonical/og:url so that /order-medicines is
  // self-canonical when this step is skipped. Strip them before appending this audience's
  // own, or every audience page would canonicalise to the hub and drop out of the index.
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
    ...ogImageTags(ORDER_OG_IMAGE),
    `<meta property="og:url" content="${canonicalUrl}">`,
  ].join('\n    ');

  return html.replace(/<\/head>/i, `    ${extraTags}\n</head>`);
}

function main() {
  const templatePath = path.join(DIST_DIR, 'order-medicines.html');
  if (!fs.existsSync(templatePath)) {
    console.log('[Prerender Order Medicines] dist/order-medicines.html not found — skipping (did `vite build` run first?).');
    return;
  }
  const template = fs.readFileSync(templatePath, 'utf8');

  // dist/order-medicines.html (the hub) and dist/order-medicines/ (its audiences) coexist:
  // with cleanUrls, /order-medicines serves the file and /order-medicines/patients serves
  // patients.html from inside the directory.
  const outDir = path.join(DIST_DIR, 'order-medicines');
  fs.mkdirSync(outDir, { recursive: true });

  AUDIENCES.forEach((audience) => {
    const html = injectHead(template, {
      title: audience.title,
      description: audience.description,
      canonicalPath: `/order-medicines/${audience.slug}`,
    });
    fs.writeFileSync(path.join(outDir, `${audience.slug}.html`), html, 'utf8');
  });

  console.log(`[Prerender Order Medicines] Wrote ${AUDIENCES.length} audience page(s) to dist/order-medicines/.`);
}

main();
