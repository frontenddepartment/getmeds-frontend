// Writes the site-wide Organization JSON-LD into every static HTML shell in the repo root.
//
// The same Organization block has to appear on every page, because Blocks that reference it
// by "@id" (the Drug block on product pages, the MedicalWebPage block on condition pages)
// only resolve if the node they point at is present in the *same* document. Keeping 24
// hand-maintained copies in sync is how the old 7-line version drifted, so the object below
// is the single source of truth and this script stamps it everywhere at prebuild time.
//
// Runs as part of `prebuild`, alongside update-vercel-headers.cjs, which likewise rewrites
// a tracked file in place. Idempotent: re-running produces no diff.
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DOMAIN = 'https://getmeds.ph';

// Matches the id used nowhere in src/lib/seo.ts, so nothing overwrites this block when the
// page hydrates, and prerender-slugs.cjs (which only strips blocks carrying its own ids)
// leaves it intact on the prerendered pages.
const BLOCK_ID = 'jsonld-organization';

const ORGANIZATION = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${DOMAIN}/#organization`,
  name: 'Getmeds',
  legalName: 'Getmeds Philippines Inc.',
  alternateName: 'Getmeds Philippines',
  url: DOMAIN,
  // Still the wide 7122x4000 master, deliberately, so nothing breaks today. Once a square
  // 600x600 export exists this becomes an ImageObject with explicit width/height.
  logo: `${DOMAIN}/assets/getmedslogo.png`,
  description: 'Global pharmaceutical company in the Philippines: FDA-licensed wholesaler, importer, distributor and retail pharmacy.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Unit 305, 17 Vatican Bldg., Vatican Drive, BF Resort Village',
    addressLocality: 'Las Piñas City',
    addressRegion: 'Metro Manila',
    postalCode: '1747',
    addressCountry: 'PH',
  },
  telephone: '+63 919 076 9105',
  email: 'info@getmeds.ph',
  areaServed: {
    '@type': 'Country',
    name: 'Philippines',
  },
  // Mirrors the three contact groups in src/pages/contact-us.tsx. Those are overridable from
  // Sanity (settings.contactGroups); if they are ever overridden there, update these too.
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+63 919 076 9105',
      email: 'info@getmeds.ph',
      areaServed: 'PH',
      availableLanguage: ['en', 'fil'],
    },
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      telephone: '+63 919 076 9103',
      email: 'care@getmeds.ph',
      areaServed: 'PH',
    },
    {
      '@type': 'ContactPoint',
      contactType: 'human resources',
      telephone: '+63 917 154 5029',
      email: 'hr@getmeds.ph',
      areaServed: 'PH',
    },
  ],
  // Clean canonical profile URLs only — the footer's TikTok link used to carry tracking
  // params, which can stop Google matching the account. Kept in step with the links in
  // public/components/footer.html and src/pages/contact-us.tsx.
  sameAs: [
    'https://www.facebook.com/getmedsphilippines/',
    'https://www.linkedin.com/company/getmeds',
    'https://www.instagram.com/getmeds_ph/',
    'https://twitter.com/getmeds_ph',
    'https://www.youtube.com/@getmedsph',
    'https://www.tiktok.com/@getmedsph',
  ],
};

const BLOCK = `    <script type="application/ld+json" id="${BLOCK_ID}">\n${JSON.stringify(ORGANIZATION, null, 2)}\n    </script>`;

// Any existing ld+json block whose body declares an Organization — with or without the id,
// so the pre-existing un-id'd blocks are replaced rather than duplicated.
const LD_BLOCK = /[ \t]*<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

function apply(html) {
  let replaced = false;
  let out = html.replace(LD_BLOCK, (match, body) => {
    if (!/"@type"\s*:\s*"Organization"/.test(body)) return match;
    if (replaced) return ''; // collapse any accidental duplicates
    replaced = true;
    return BLOCK;
  });
  if (!replaced) {
    // New shell with no Organization block yet — add one just before </head>.
    out = out.replace(/([ \t]*)<\/head>/i, `${BLOCK}\n$1</head>`);
    replaced = /<\/head>/i.test(html);
  }
  return { html: out, replaced };
}

function main() {
  const files = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html'));
  let changed = 0;
  let skipped = [];

  files.forEach((file) => {
    const full = path.join(ROOT, file);
    const html = fs.readFileSync(full, 'utf8');
    const { html: next, replaced } = apply(html);
    if (!replaced) {
      skipped.push(file);
      return;
    }
    if (next !== html) {
      fs.writeFileSync(full, next, 'utf8');
      changed++;
    }
  });

  console.log(`[Organization] Checked ${files.length} shell(s), updated ${changed}.`);
  if (skipped.length) {
    console.log(`[Organization] Skipped ${skipped.length} file(s) with no <head>: ${skipped.join(', ')}`);
  }
}

main();
