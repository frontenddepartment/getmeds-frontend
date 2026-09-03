// Generates one static HTML file per real product/condition slug, so each gets its own
// title/description/canonical/OG/JSON-LD baked into the raw HTTP response instead of all
// of them sharing the generic `product-detail.html`/`cancer-medicines.html` shell. Runs as
// a `postbuild` step, after `vite build` has already produced `dist/`.
//
// Same Sanity fetch/parse pattern as scripts/generate-sitemap.cjs and
// scripts/update-vercel-headers.cjs (duplicated intentionally — this is a standalone CJS
// script like those two, and refactoring them into a shared module is out of scope here).
const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://getmeds.ph';
const DIST_DIR = path.join(__dirname, '..', 'dist');

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

function stripDomain(url) {
  if (!url) return '';
  return '/' + String(url).replace(/^https?:\/\//, '').replace(/^[^/]+\/?/, '');
}

async function fetchProductRows() {
  const env = loadEnv();
  const isInvalid = (val) => !val || val.includes('[SENSITIVE]') || val.includes('[') || val.includes(']');
  const rawProjectId = env.VITE_SANITY_PROJECT_ID || process.env.VITE_SANITY_PROJECT_ID;
  const projectId = isInvalid(rawProjectId) ? 's7ocz8zp' : rawProjectId;
  const rawDataset = env.VITE_SANITY_DATASET || process.env.VITE_SANITY_DATASET;
  const dataset = isInvalid(rawDataset) ? 'production' : rawDataset;
  const query = '*[_type == "product" && (remarks == "present" || remarks == "active") && defined(title)] | order(_updatedAt desc)[0] { json_data }';
  const url = `https://${projectId}.api.sanity.io/v2024-01-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Sanity API returned status ${res.status}`);
  const json = await res.json();
  const jsonData = json.result?.json_data;
  if (!jsonData) throw new Error('No json_data on active product doc');

  const parsed = JSON.parse(jsonData);
  const firstSheet = Object.keys(parsed)[0];
  const rows = firstSheet ? (parsed[firstSheet] || []) : [];
  return rows.filter(r => r && (r.brandName || r.genericName || r.name || r.slug));
}

// Mirrors folderDisplayName() in src/lib/queries.ts — "diabetes-medicines" -> "Diabetes
// Medicines". Duplicated rather than imported because this is a standalone CJS build script.
function folderDisplayName(folder) {
  return String(folder)
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getDisplayName(row) {
  if (row.brandName && row.genericName && row.brandName !== row.genericName) {
    return `${row.brandName} (${row.genericName})`;
  }
  return row.name || row.brandName || row.genericName || 'Product';
}

// Swaps <title>/description meta for a fresh value and appends canonical + OG + JSON-LD
// right before </head>. Existing Organization JSON-LD in the template is left untouched.
function injectHead(template, { title, description, canonicalPath, ogType, jsonLd, jsonLdId }) {
  let html = template;
  const fullTitle = withSiteName(title);
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;
  // The static shells now ship their own canonical/og:url so that un-prerendered URLs
  // are self-canonical. Strip those before appending this page's own, otherwise the
  // prerendered page would carry two conflicting canonicals.
  html = html.replace(/[ \t]*<link\s+rel=["']canonical["'][^>]*>\r?\n?/gi, '');
  html = html.replace(/[ \t]*<meta\s+property=["']og:url["'][^>]*>\r?\n?/gi, '');
  // Drop a block this script injected on an earlier run before adding the new one. Only
  // ever matches by our own id, so the template's un-id'd Organization JSON-LD survives.
  // Matters because the category pass below writes over cancer-medicines.html, which is
  // itself a template here — without this, re-running without a rebuild stacks blocks.
  if (jsonLdId) {
    html = html.replace(
      new RegExp('[ \\t]*<script type="application/ld\\+json" id="' + jsonLdId + '">[\\s\\S]*?<\\/script>\\r?\\n?', 'gi'),
      ''
    );
  }

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${escapeHtml(description)}">`);

  const extraTags = [
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="Getmeds">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${DOMAIN}/assets/getmedslogo.png">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    // Carries the same id the page uses at runtime (src/lib/seo.ts injectJsonLd), so
    // hydration updates this block in place instead of appending a rival second one.
    `<script type="application/ld+json"${jsonLdId ? ` id="${jsonLdId}"` : ''}>${JSON.stringify({ '@context': 'https://schema.org', ...jsonLd })}</script>`,
  ].join('\n    ');

  html = html.replace(/<\/head>/i, `    ${extraTags}\n</head>`);
  return html;
}

// Appends the site name only when the title doesn't already contain it. Product
// titles come from the sheet's Meta Title column and already end
// "| Getmeds Philippines", and several blog posts open with the brand, so appending
// unconditionally printed it twice ("... | Getmeds Philippines - Getmeds").
function withSiteName(title) {
  const t = String(title || '').trim();
  if (!t) return 'Getmeds';
  return /getmeds/i.test(t) ? t : t + ' - Getmeds';
}

// Cuts to `max` characters on a word boundary. The previous hard slice(0, 160) left
// 28 of 61 product descriptions ending mid-word (e.g. "...and pharm").
function truncateAtWord(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[,;:\-–—]+$/, '').trim();
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function writeFile(destPath, html) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, html, 'utf8');
}

async function main() {
  const productTemplatePath = path.join(DIST_DIR, 'product-detail.html');
  const conditionTemplatePath = path.join(DIST_DIR, 'cancer-medicines.html');

  if (!fs.existsSync(productTemplatePath) || !fs.existsSync(conditionTemplatePath)) {
    console.log('[Prerender] dist/product-detail.html or dist/cancer-medicines.html not found — skipping (did `vite build` run first?).');
    return;
  }

  const productTemplate = fs.readFileSync(productTemplatePath, 'utf8');
  const conditionTemplate = fs.readFileSync(conditionTemplatePath, 'utf8');

  let rows;
  try {
    rows = await fetchProductRows();
  } catch (err) {
    console.warn('[Prerender] Failed to fetch product data from Sanity, skipping prerender:', err.message);
    return;
  }

  // ---- Products ----
  const seenProductSlugs = new Set();
  let productCount = 0;
  const skippedProducts = [];

  rows.forEach((row) => {
    const folder = row.categoryFolder ? String(row.categoryFolder).trim() : '';
    const slug = row.slug ? String(row.slug).trim() : '';
    if (!folder || !slug) {
      skippedProducts.push(getDisplayName(row));
      return;
    }
    const key = `${folder}/${slug}`;
    if (seenProductSlugs.has(key)) return;
    seenProductSlugs.add(key);

    const displayName = getDisplayName(row);
    const description = truncateAtWord(
      row.metaDescription || `${displayName} — available through Getmeds Philippines. Quality pharmaceutical product for healthcare needs.`,
      160
    );
    const canonicalPath = row.productPageUrl ? stripDomain(row.productPageUrl) : `/${folder}/${slug}`;

    const html = injectHead(productTemplate, {
      title: row.metaTitle || displayName,
      description,
      canonicalPath,
      ogType: 'product',
      jsonLdId: 'jsonld-drug',
      jsonLd: {
        '@type': 'Drug',
        name: displayName,
        ...(row.genericName ? { nonProprietaryName: row.genericName } : {}),
        ...(row.strength || row.form ? { dosageForm: [row.form, row.strength].filter(Boolean).join(', ') } : {}),
        description,
        url: `${DOMAIN}${canonicalPath}`,
        prescriptionStatus: 'PrescriptionOnly',
      },
    });

    writeFile(path.join(DIST_DIR, folder, `${slug}.html`), html);
    productCount++;
  });

  // ---- Conditions (grouped by conditionSlug across product rows — conditions aren't a
  // separate Sanity document type, they only exist as this derived grouping) ----
  const conditionGroups = new Map(); // conditionSlug -> { name, hubUrl, products: Set<string> }
  rows.forEach((row) => {
    const displayName = getDisplayName(row);
    if (row.conditionSlug && row.subCategory) {
      const slug = String(row.conditionSlug).trim();
      if (!conditionGroups.has(slug)) {
        conditionGroups.set(slug, { name: row.subCategory, hubUrl: row.conditionHubUrl, products: new Set() });
      }
      conditionGroups.get(slug).products.add(displayName);
    }
    Object.entries(row.conditionSlugsByName || {}).forEach(([name, info]) => {
      if (!info?.conditionSlug) return;
      const slug = String(info.conditionSlug).trim();
      if (!conditionGroups.has(slug)) {
        conditionGroups.set(slug, { name, hubUrl: info.conditionHubUrl, products: new Set() });
      }
      conditionGroups.get(slug).products.add(displayName);
    });
  });

  let conditionCount = 0;
  const skippedConditions = [];

  conditionGroups.forEach((group, slug) => {
    const canonicalPath = group.hubUrl ? stripDomain(group.hubUrl) : `/conditions/${slug}`;
    if (!canonicalPath) {
      skippedConditions.push(group.name);
      return;
    }
    const sampleNames = Array.from(group.products).slice(0, 3);
    const description = sampleNames.length
      ? `Browse Getmeds' ${group.name} medicines available in the Philippines, including ${sampleNames.join(', ')}. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`
      : `Browse Getmeds' ${group.name} medicines available in the Philippines. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`;

    const html = injectHead(conditionTemplate, {
      title: group.name,
      description,
      canonicalPath,
      ogType: 'website',
      jsonLdId: 'jsonld-medical-webpage',
      jsonLd: {
        '@type': 'MedicalWebPage',
        name: `${group.name} Medicines in the Philippines`,
        about: { '@type': 'MedicalCondition', name: group.name },
        url: `${DOMAIN}${canonicalPath}`,
      },
    });

    writeFile(path.join(DIST_DIR, 'conditions', `${slug}.html`), html);
    conditionCount++;
  });

  // ---- Category folders (the listing pages) ----
  // Every Category Folder in the sheet is its own URL, but they were all rewritten onto the
  // single cancer-medicines.html shell in vercel.json, so all 14 sent Google a byte-identical
  // file whose title said "Cancer Medicines" no matter which category was requested. Same
  // treatment as the condition hubs above. Runs last because it writes over
  // cancer-medicines.html, which is the template the condition pass reads (already in memory
  // by now, so the pages produced above are unaffected).
  const categoryGroups = new Map(); // folder -> { name, products: Set<string> }
  rows.forEach((row) => {
    const folder = row.categoryFolder ? String(row.categoryFolder).trim() : '';
    if (!folder) return;
    if (!categoryGroups.has(folder)) {
      categoryGroups.set(folder, { name: String(row.category || '').trim() || folder, products: new Set() });
    }
    categoryGroups.get(folder).products.add(getDisplayName(row));
  });

  // How many folders each category name is filed under. A category spanning more than one
  // (Endocrinology, under hormonal-therapy and diabetes-medicines) needs its folder in the
  // title, or its two URLs — genuinely different product lists — ship an identical title.
  const foldersPerCategory = new Map();
  categoryGroups.forEach((group, folder) => {
    if (!foldersPerCategory.has(group.name)) foldersPerCategory.set(group.name, []);
    foldersPerCategory.get(group.name).push(folder);
  });

  let categoryCount = 0;
  categoryGroups.forEach((group, folder) => {
    const canonicalPath = `/${folder}`;
    // Kept identical to the runtime title in src/pages/cancer-medicines.tsx so the tag
    // doesn't change when the page hydrates.
    const qualifier = (foldersPerCategory.get(group.name) || []).length > 1
      ? ` — ${folderDisplayName(folder)}`
      : '';
    const sampleNames = Array.from(group.products).slice(0, 3);
    const description = sampleNames.length
      ? `Browse Getmeds' ${group.name} medicines available in the Philippines, including ${sampleNames.join(', ')}. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`
      : `Browse Getmeds' ${group.name} medicines available in the Philippines. FDA Philippines-licensed distributor, prescription-based ordering, nationwide delivery.`;

    const html = injectHead(conditionTemplate, {
      title: `${group.name}${qualifier}`,
      description,
      canonicalPath,
      ogType: 'website',
      jsonLdId: 'jsonld-medical-webpage',
      jsonLd: {
        '@type': 'CollectionPage',
        name: `${group.name}${qualifier} Medicines in the Philippines`,
        url: `${DOMAIN}${canonicalPath}`,
      },
    });

    writeFile(path.join(DIST_DIR, `${folder}.html`), html);
    categoryCount++;
  });

  // The two generic listing routes, which are also rewritten onto the same shell.
  // /product-range is the real "all products" page — title and description match what
  // src/pages/cancer-medicines.tsx sets at runtime so the tag doesn't change on hydration.
  // /conditions renders that same all-products view, so it canonicalises to /product-range
  // rather than to itself.
  const allProductsDescription = "Browse Getmeds' full range of specialty pharmaceutical products across oncology, hematology, cardiology, and other therapeutic areas in the Philippines.";
  [
    { file: 'product-range', canonicalPath: '/product-range' },
    { file: 'conditions', canonicalPath: '/product-range' },
  ].forEach(({ file, canonicalPath }) => {
    const html = injectHead(conditionTemplate, {
      title: 'Products',
      description: allProductsDescription,
      canonicalPath,
      ogType: 'website',
      jsonLdId: 'jsonld-medical-webpage',
      jsonLd: {
        '@type': 'CollectionPage',
        name: 'Product Range — Getmeds Philippines',
        url: `${DOMAIN}${canonicalPath}`,
      },
    });
    writeFile(path.join(DIST_DIR, `${file}.html`), html);
    categoryCount++;
  });

  console.log(`[Prerender] Wrote ${productCount} product page(s), ${conditionCount} condition page(s) and ${categoryCount} category/listing page(s) into dist/.`);
  if (skippedProducts.length) {
    console.log(`[Prerender] Skipped ${skippedProducts.length} product row(s) with no folder/slug: ${skippedProducts.slice(0, 5).join(', ')}${skippedProducts.length > 5 ? '…' : ''}`);
  }
  if (skippedConditions.length) {
    console.log(`[Prerender] Skipped ${skippedConditions.length} condition(s) with no resolvable hub URL: ${skippedConditions.slice(0, 5).join(', ')}${skippedConditions.length > 5 ? '…' : ''}`);
  }
}

main().catch((err) => {
  console.error('[Prerender] Unexpected failure:', err);
  process.exitCode = 0; // Never fail the build over prerendering — the site still works via the client-rendered shells.
});
