// Fills in the Open Graph and Twitter tags a page is missing from its served HTML, deriving
// them from the title, description and canonical the page already carries.
//
// Social scrapers do not run JavaScript. src/lib/seo.ts writes a full og:* and twitter:*
// block on every page, but only after hydration, so what Facebook, LinkedIn and X actually
// fetch is whatever is in the raw response. Auditing that turned up two gaps:
//
//   - 11 indexable pages (/about-us, /careers, /csr, /blog, …) shipped og:url and nothing
//     else. No og:image means the shared card has no picture at all, which is the difference
//     between a link that looks like a product and a link that looks like a mistake.
//   - No page at all shipped twitter:card. X falls back to og:title/description/image, so
//     cards still render, but twitter:card has no Open Graph equivalent and it is the tag
//     that asks for the large-image layout. Without it every link gets the small thumbnail.
//
// Only missing tags are added. The prerender passes already write correct, page-specific
// og:* blocks for the 521 product, condition, category, blog and policy pages, and those are
// left untouched — this fills gaps, it does not have opinions about pages that got it right.
//
// Runs after the prerender passes so it sees their output, and before the postbuild guards.
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
const SKIP_DIRS = new Set(['assets', 'components']);

// These mirror src/lib/seo.ts, which writes the same values at runtime. They must agree, or
// the card a scraper reads differs from the one a person sees after the page loads.
const DOMAIN = 'https://getmeds.ph';
const OG_SITE_NAME = 'Getmeds Philippines';
const DEFAULT_IMAGE = `${DOMAIN}/assets/getmedslogo.png`;
const TWITTER_CARD = 'summary_large_image';

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      walk(path.join(dir, entry.name), acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(path.join(dir, entry.name));
    }
  }
  return acc;
}

// The attribute delimiter is captured and matched back rather than lumped into one character
// class: "Browse Getmeds' full range…" is a double-quoted value containing an apostrophe, and
// a [^"']* class stops dead at that apostrophe.
function attr(html, re) {
  const m = html.match(re);
  return m ? m[m.length - 1].trim() : null;
}

const TITLE_RE = /<title>([\s\S]*?)<\/title>/i;
const DESC_RE = /<meta\s+name=["']description["'][\s\S]*?content=(["'])([\s\S]*?)\1/i;
const CANONICAL_RE = /<link\s+rel=["']canonical["']\s+href=(["'])([\s\S]*?)\1/i;

const has = (html, prop) =>
  new RegExp(`<meta\\s+(?:property|name)=["']${prop.replace(':', '\\:')}["']`, 'i').test(html);

// The title and description are read back out of the page's own head, where they are already
// HTML-escaped, so they are copied across verbatim rather than escaped a second time —
// re-escaping would turn "&amp;" into "&amp;amp;" and print the entity to the reader.
function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('[Social] No dist/ — skipping (did `vite build` run first?).');
    return;
  }

  let filled = 0;
  let twitterOnly = 0;
  let skipped = 0;
  const noTitle = [];
  // A page that hardcodes its own og:title/og:description is not touched here, so nothing
  // keeps those in step with the <title> and description they are supposed to mirror. That
  // is not hypothetical: services.html kept an em-dash og:title after Audit 3 normalised its
  // <title> to a hyphen, and an untrimmed og:description after its description was shortened.
  const mismatched = [];

  walk(DIST_DIR).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const title = attr(html, TITLE_RE);
    if (!title || !/<\/head>/i.test(html)) {
      // A fragment with no head, or a page with no title for the tags to be built from.
      noTitle.push(path.relative(DIST_DIR, file).replace(/\\/g, '/'));
      return;
    }
    const description = attr(html, DESC_RE);
    const canonical = attr(html, CANONICAL_RE);

    const add = [];
    if (!has(html, 'og:title')) add.push(`<meta property="og:title" content="${title}">`);
    if (description && !has(html, 'og:description')) add.push(`<meta property="og:description" content="${description}">`);
    if (!has(html, 'og:image')) add.push(`<meta property="og:image" content="${DEFAULT_IMAGE}">`);
    if (!has(html, 'og:type')) add.push(`<meta property="og:type" content="website">`);
    if (!has(html, 'og:site_name')) add.push(`<meta property="og:site_name" content="${OG_SITE_NAME}">`);
    if (canonical && !has(html, 'og:url')) add.push(`<meta property="og:url" content="${canonical}">`);
    if (!has(html, 'twitter:card')) add.push(`<meta name="twitter:card" content="${TWITTER_CARD}">`);

    const url = '/' + path.relative(DIST_DIR, file).replace(/\\/g, '/').replace(/\.html$/, '');
    const ogTitle = attr(html, /<meta\s+property=["']og:title["']\s+content=(["'])([\s\S]*?)\1/i);
    const ogDesc = attr(html, /<meta\s+property=["']og:description["']\s+content=(["'])([\s\S]*?)\1/i);
    if (ogTitle && ogTitle !== title) mismatched.push([url, 'og:title', title, ogTitle]);
    if (ogDesc && description && ogDesc !== description) mismatched.push([url, 'og:description', description, ogDesc]);

    if (!add.length) {
      skipped++;
      return;
    }
    if (add.length === 1 && add[0].includes('twitter:card')) twitterOnly++;
    else filled++;

    fs.writeFileSync(file, html.replace(/<\/head>/i, `    ${add.join('\n    ')}\n</head>`), 'utf8');
  });

  console.log(`[Social] Completed the card on ${filled} page(s); added only twitter:card to ${twitterOnly} already-tagged page(s); ${skipped} needed nothing.`);
  if (mismatched.length) {
    console.warn(`[Social] ⚠ ${mismatched.length} hand-written tag(s) that no longer match the page's own title/description:`);
    mismatched.slice(0, 8).forEach(([url, tag, expected, actual]) => {
      console.warn(`   ${url} — ${tag}`);
      console.warn(`      page says: ${expected.slice(0, 90)}`);
      console.warn(`      tag says : ${actual.slice(0, 90)}`);
    });
    if (mismatched.length > 8) console.warn(`   …and ${mismatched.length - 8} more`);
    console.warn('   These are written by hand in the source HTML, so this fills no gap — edit them to match.');
  }
  if (noTitle.length) {
    console.log(`[Social] Skipped ${noTitle.length} file(s) with no <head>/<title>: ${noTitle.slice(0, 4).join(', ')}${noTitle.length > 4 ? '…' : ''}`);
  }
}

main();
