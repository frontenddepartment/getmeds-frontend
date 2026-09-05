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
// Matches the @id in scripts/inject-organization-jsonld.cjs — the node these blocks point at.
const ORGANIZATION_ID = `${DOMAIN}/#organization`;

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

// ---- Condition metadata -----------------------------------------------------------
// schema.org's MedicalSpecialty is a closed enumeration, so the sheet's free-text
// specialty is mapped onto a real enum URL. Anything unrecognised yields nothing and the
// property is left off that page — a wrong enum value is worse than a missing one.
const MEDICAL_SPECIALTIES = {
  oncology: 'Oncologic',
  oncologic: 'Oncologic',
  hematology: 'Hematologic',
  haematology: 'Hematologic',
  hematologic: 'Hematologic',
  cardiology: 'Cardiovascular',
  cardiovascular: 'Cardiovascular',
  endocrinology: 'Endocrine',
  endocrine: 'Endocrine',
  nephrology: 'Renal',
  renal: 'Renal',
  neurology: 'Neurologic',
  neurologic: 'Neurologic',
  rheumatology: 'Rheumatologic',
  rheumatologic: 'Rheumatologic',
  'infectious disease': 'Infectious',
  'infectious diseases': 'Infectious',
  infectious: 'Infectious',
  musculoskeletal: 'Musculoskeletal',
  gastroenterology: 'Gastroenterologic',
  gastroenterologic: 'Gastroenterologic',
  pulmonology: 'Pulmonary',
  pulmonary: 'Pulmonary',
  respiratory: 'Pulmonary',
  urology: 'Urologic',
  urologic: 'Urologic',
  gynecology: 'Gynecologic',
  gynecologic: 'Gynecologic',
  dermatology: 'Dermatologic',
  dermatologic: 'Dermatologic',
  radiology: 'Radiography',
  radiography: 'Radiography',
  anesthesia: 'Anesthesia',
  anaesthesia: 'Anesthesia',
  pathology: 'Pathology',
  pediatrics: 'Pediatric',
  pediatric: 'Pediatric',
  psychiatry: 'Psychiatric',
  psychiatric: 'Psychiatric',
  surgery: 'Surgical',
  surgical: 'Surgical',
  toxicology: 'Toxicologic',
  genetics: 'Genetic',
  genetic: 'Genetic',
};

function specialtyUrl(value) {
  const key = String(value || '').trim().toLowerCase();
  const enumValue = MEDICAL_SPECIALTIES[key];
  return enumValue ? `https://schema.org/${enumValue}` : null;
}

// "lastReviewed" is a public claim that a named pharmacist read the page on that date, so
// only a real, well-formed calendar date counts. Excel dates arrive as full ISO strings
// once the workbook has been through JSON, hence the leading-date match.
function reviewDate(value) {
  const match = String(value || '').trim().match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : null;
}

// Used only when a condition has a review date but no explicit reviewer in its own column.
const DEFAULT_REVIEWER = 'Ivy Marcel F. Varias, RPh';

// The review pair is all-or-nothing: without a date there is no claim to make, so both
// properties are dropped and the rest of the MedicalWebPage block still stands on its own.
function reviewFields(group) {
  const date = reviewDate(group.lastReviewed);
  if (!date) return {};
  return {
    lastReviewed: date,
    reviewedBy: {
      '@type': 'Person',
      name: String(group.reviewedBy || '').trim() || DEFAULT_REVIEWER,
      jobTitle: 'Registered Pharmacist',
      affiliation: { '@id': ORGANIZATION_ID },
    },
  };
}

// Conditions are a grouping derived from product rows, not their own documents, so each
// condition's metadata is repeated on every row filed under it. First non-empty value wins.
function mergeConditionMeta(group, row) {
  if (!group.filipinoName && row.conditionFilipinoName) group.filipinoName = String(row.conditionFilipinoName).trim();
  if (!group.specialty && row.conditionSpecialty) group.specialty = String(row.conditionSpecialty).trim();
  if (!group.lastReviewed && row.conditionLastReviewed) group.lastReviewed = String(row.conditionLastReviewed).trim();
  if (!group.reviewedBy && row.conditionReviewedBy) group.reviewedBy = String(row.conditionReviewedBy).trim();
  if (!group.category && row.category) group.category = String(row.category).trim();
  if (!group.folder && row.categoryFolder) group.folder = String(row.categoryFolder).trim();
}

// ---- BreadcrumbList helpers -------------------------------------------------------
// Google requires the marked-up trail to match the one the visitor can see, so each
// builder below mirrors a specific piece of UI:
//   products            -> src/pages/product-detail.tsx  ("Home > Category > Condition > Product")
//   conditions/category -> src/pages/cancer-medicines.tsx ("All Products > Category > Condition")
// The final crumb deliberately carries no "item" URL — it is the page already being viewed.
function breadcrumbList(trail) {
  const crumbs = (trail || []).filter((c) => c && c.name);
  if (crumbs.length < 2) return null; // a one-item trail tells a crawler nothing
  return {
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      ...(crumb.url && i < crumbs.length - 1 ? { item: `${DOMAIN}${crumb.url}` } : {}),
    })),
  };
}

function slugifyCrumb(value) {
  return String(value || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// The "Breadcrumb (auto)" sheet column is the source of truth here, same as the visible
// trail. Falls back to condition + product name when a row has no breadcrumb, which is what
// product-detail.tsx renders in that case too.
function productBreadcrumbTrail(row, displayName, folder) {
  const parts = String(row.breadcrumb || '')
    .split('>')
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part.toLowerCase() !== 'home');
  const rest = parts.length ? parts : [row.subCategory || row.category, displayName].filter(Boolean);
  if (!rest.length) return null;

  return [
    { name: 'Home', url: '/' },
    ...rest.map((name, idx) => {
      const isLast = idx === rest.length - 1;
      if (isLast || !folder) return { name };
      if (idx === 0) return { name, url: `/${folder}` };
      if (idx === rest.length - 2) {
        return { name, url: `/${folder}/${row.conditionSlug ? String(row.conditionSlug).trim() : slugifyCrumb(name)}` };
      }
      return { name };
    }),
  ];
}

function getDisplayName(row) {
  if (row.brandName && row.genericName && row.brandName !== row.genericName) {
    return `${row.brandName} (${row.genericName})`;
  }
  return row.name || row.brandName || row.genericName || 'Product';
}

// Swaps <title>/description meta for a fresh value and appends canonical + OG + JSON-LD
// right before </head>. Existing Organization JSON-LD in the template is left untouched.
// `jsonLdBlocks` is a list of { id, data } — a page carries several (its own Drug or
// MedicalWebPage block plus a BreadcrumbList), and each id has to match the id used by
// src/lib/seo.ts at runtime so hydration updates the block in place.
function injectHead(template, { title, description, canonicalPath, ogType, jsonLdBlocks = [] }) {
  let html = template;
  const fullTitle = withSiteName(title);
  const canonicalUrl = `${DOMAIN}${canonicalPath}`;
  // The static shells now ship their own canonical/og:url so that un-prerendered URLs
  // are self-canonical. Strip those before appending this page's own, otherwise the
  // prerendered page would carry two conflicting canonicals.
  html = html.replace(/[ \t]*<link\s+rel=["']canonical["'][^>]*>\r?\n?/gi, '');
  html = html.replace(/[ \t]*<meta\s+property=["']og:url["'][^>]*>\r?\n?/gi, '');
  // Drop blocks this script injected on an earlier run before adding the new ones. Only
  // ever matches by our own ids, so the shell's Organization JSON-LD (a different id,
  // written by scripts/inject-organization-jsonld.cjs) survives.
  // Matters because the category pass below writes over cancer-medicines.html, which is
  // itself a template here — without this, re-running without a rebuild stacks blocks.
  jsonLdBlocks.forEach(({ id }) => {
    if (!id) return;
    html = html.replace(
      new RegExp('[ \\t]*<script type="application/ld\\+json" id="' + id + '">[\\s\\S]*?<\\/script>\\r?\\n?', 'gi'),
      ''
    );
  });

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);
  html = html.replace(/<meta\s+name=["']description["'][\s\S]*?>/i, `<meta name="description" content="${escapeHtml(description)}">`);

  const extraTags = [
    `<link rel="canonical" href="${canonicalUrl}">`,
    `<meta property="og:type" content="${ogType}">`,
    `<meta property="og:site_name" content="Getmeds Philippines">`,
    `<meta property="og:title" content="${escapeHtml(fullTitle)}">`,
    `<meta property="og:description" content="${escapeHtml(description)}">`,
    `<meta property="og:image" content="${DOMAIN}/assets/getmedslogo.png">`,
    `<meta property="og:url" content="${canonicalUrl}">`,
    // Each carries the same id the page uses at runtime (src/lib/seo.ts injectJsonLd), so
    // hydration updates the block in place instead of appending a rival second one.
    ...jsonLdBlocks
      .filter((block) => block && block.data)
      .map(({ id, data }) => `<script type="application/ld+json"${id ? ` id="${id}"` : ''}>${JSON.stringify({ '@context': 'https://schema.org', ...data })}</script>`),
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
    const isBranded = Boolean(row.brandName && row.genericName && row.brandName !== row.genericName);
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
      jsonLdBlocks: [
        {
          id: 'jsonld-drug',
          data: {
            '@type': 'Drug',
            name: displayName,
            ...(isBranded ? { alternateName: String(row.brandName).trim() } : {}),
            ...(row.genericName ? { nonProprietaryName: row.genericName, activeIngredient: row.genericName } : {}),
            // Only true for a row that actually carries a brand distinct from its generic
            // name — getDisplayName() falls back to the generic name, so a blanket `true`
            // would claim a proprietary name for plain generics that have none.
            isProprietary: isBranded,
            ...(row.strength || row.form ? { dosageForm: [row.form, row.strength].filter(Boolean).join(', ') } : {}),
            description,
            url: `${DOMAIN}${canonicalPath}`,
            legalStatus: 'Prescription only medicine (Rx), Philippines',
            prescriptionStatus: 'PrescriptionOnly',
            // Getmeds is the importer and distributor, never assumed to be the maker: the
            // property is omitted unless the sheet's Manufacturer column is filled in.
            ...(row.manufacturer ? { manufacturer: { '@type': 'Organization', name: String(row.manufacturer).trim() } } : {}),
            // mainEntityOfPage is the page this drug is the main entity OF, so it points at
            // the URL — the link to the company is carried by that page's publisher.
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${DOMAIN}${canonicalPath}`,
              publisher: { '@id': ORGANIZATION_ID },
            },
          },
        },
        { id: 'jsonld-breadcrumb', data: breadcrumbList(productBreadcrumbTrail(row, displayName, folder)) },
      ],
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
        // category/categoryFolder are carried so the condition page's BreadcrumbList can
        // name and link its parent category, matching the visible trail.
        conditionGroups.set(slug, {
          name: row.subCategory,
          hubUrl: row.conditionHubUrl,
          category: String(row.category || '').trim(),
          folder: row.categoryFolder ? String(row.categoryFolder).trim() : '',
          products: new Set(),
        });
      }
      conditionGroups.get(slug).products.add(displayName);
      mergeConditionMeta(conditionGroups.get(slug), row);
    }
    Object.entries(row.conditionSlugsByName || {}).forEach(([name, info]) => {
      if (!info?.conditionSlug) return;
      const slug = String(info.conditionSlug).trim();
      if (!conditionGroups.has(slug)) {
        conditionGroups.set(slug, {
          name,
          hubUrl: info.conditionHubUrl,
          category: String(row.category || '').trim(),
          folder: row.categoryFolder ? String(row.categoryFolder).trim() : '',
          products: new Set(),
        });
      }
      conditionGroups.get(slug).products.add(displayName);
      // Only the category/folder are inherited from an "also linked from" row — the
      // Filipino name, specialty and review date belong to the condition's own rows.
      const group = conditionGroups.get(slug);
      if (!group.category && row.category) group.category = String(row.category).trim();
      if (!group.folder && row.categoryFolder) group.folder = String(row.categoryFolder).trim();
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
      jsonLdBlocks: [
        {
          id: 'jsonld-medical-webpage',
          data: {
            '@type': 'MedicalWebPage',
            name: `${group.name} Medicines in the Philippines`,
            description,
            inLanguage: 'en-PH',
            about: {
              '@type': 'MedicalCondition',
              name: group.name,
              // The Filipino term for the condition, when the sheet carries one.
              ...(group.filipinoName ? { alternateName: group.filipinoName } : {}),
            },
            ...(specialtyUrl(group.specialty) ? { specialty: specialtyUrl(group.specialty) } : {}),
            url: `${DOMAIN}${canonicalPath}`,
            ...reviewFields(group),
            publisher: { '@id': ORGANIZATION_ID },
          },
        },
        {
          id: 'jsonld-breadcrumb',
          data: breadcrumbList([
            { name: 'All Products', url: '/product-range' },
            ...(group.category && group.folder ? [{ name: group.category, url: `/${group.folder}` }] : []),
            { name: group.name },
          ]),
        },
      ],
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
      jsonLdBlocks: [
        {
          id: 'jsonld-medical-webpage',
          data: {
            '@type': 'CollectionPage',
            name: `${group.name}${qualifier} Medicines in the Philippines`,
            url: `${DOMAIN}${canonicalPath}`,
          },
        },
        {
          id: 'jsonld-breadcrumb',
          data: breadcrumbList([
            { name: 'All Products', url: '/product-range' },
            { name: `${group.name}${qualifier}` },
          ]),
        },
      ],
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
      // No BreadcrumbList here: "All Products" is the only crumb these two pages show.
      jsonLdBlocks: [
        {
          id: 'jsonld-medical-webpage',
          data: {
            '@type': 'CollectionPage',
            name: 'Product Range — Getmeds Philippines',
            url: `${DOMAIN}${canonicalPath}`,
          },
        },
      ],
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
