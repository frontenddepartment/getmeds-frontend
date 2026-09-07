// Reports pages that ship the same <title> as another page, titles that lost their brand
// suffix or doubled it, and titles that end in the brand behind the wrong separator.
//
// Two title bugs have shipped before: every product page inheriting the generic shell's
// title, and "… | Getmeds Philippines - Getmeds" from appending the site name to a title
// that already carried it. Both were only caught by reading pages by hand. This runs over
// the built output, after the prerender passes, so a repeat shows up in the build log.
//
// Warns, never fails: a duplicate title is a real SEO problem but not a broken deploy, and
// the prerender scripts already take the same line (see their exitCode = 0 handlers).
//
// Four classes of page share a title on purpose and would otherwise drown the real
// findings: a URL that canonicalises somewhere else (/conditions -> /product-range), a URL
// vercel.json permanently redirects away (a superseded blog slug whose file still sits in
// dist), a URL served with a noindex header (/product-detail, the generic shell), and a
// page carrying its own noindex robots meta (the *-preview shells, which are deliberate
// copies of the real page). The first two live in scripts/lib/dist-pages.cjs, shared with
// check-canonicals.cjs so the two guards can't disagree about what is meant to be indexed.
const fs = require('fs');
const { SEPARATOR, SITE_NAME } = require('./lib/site-title.cjs');
const {
  DIST_DIR,
  walk,
  urlFor,
  excludedUrls,
  hasNoindexMeta,
  canonicalOf,
  canonicalPath,
  normalizeUrl,
} = require('./lib/dist-pages.cjs');

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('[Titles] No dist/ — skipping (did `vite build` run first?).');
    return;
  }

  const byTitle = new Map();
  const missing = [];
  const doubled = [];
  const wrongSeparator = [];
  // null means vercel.json was unreadable; report everything rather than silently skipping.
  const excluded = excludedUrls() || new Set();
  let skipped = 0;

  walk(DIST_DIR).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const match = html.match(/<title>([\s\S]*?)<\/title>/i);
    const url = urlFor(file);
    if (excluded.has(url)) {
      skipped++;
      return;
    }
    // A page that tells crawlers not to index it cannot duplicate anything in search.
    if (hasNoindexMeta(html)) {
      skipped++;
      return;
    }
    // A page pointing its canonical at a different URL is declaring itself the copy, so a
    // shared title there is the intended outcome, not a finding.
    const canonical = canonicalOf(html);
    if (canonical && canonicalPath(canonical) !== normalizeUrl(url)) {
      skipped++;
      return;
    }
    if (!match) {
      missing.push(url);
      return;
    }
    const title = match[1].replace(/&amp;/g, '&').trim();
    // "… | Getmeds Philippines - Getmeds": withSiteName() appending the brand to a title
    // that already ends with it. The guard in withSiteName covers this, so a hit here means
    // the guard was bypassed or a title arrived with the suffix already doubled.
    if (/getmeds[^|]*\|[^|]*getmeds.*- Getmeds$/i.test(title) || / - Getmeds - Getmeds$/i.test(title)) {
      doubled.push([url, title]);
    }
    // Audit 3's second half: the brand appeared once everywhere, but behind three different
    // separators, because withSiteName() existed as five copies and two had drifted to an em
    // dash. Only an appended suffix is judged here, and the test for "appended" is the
    // casing: every copy of withSiteName writes SITE_NAME exactly, so a title ending in
    // "GetMEDS" or "GetMeds" came from the source and no code path could have produced it.
    // That, plus requiring the brand at the very end, leaves the authored titles alone —
    // "… | Getmeds Philippines" (the sheet's own SEO titles, which end in "Philippines")
    // and "GetMEDS Announces …" (WordPress copy). Deliberately case-sensitive.
    const suffix = title.match(new RegExp(`(.)\\s*${SITE_NAME}\\s*$`));
    if (suffix && suffix[1] !== SEPARATOR.trim()) {
      wrongSeparator.push([url, title, suffix[1]]);
    }
    if (!byTitle.has(title)) byTitle.set(title, []);
    byTitle.get(title).push(url);
  });

  const groups = [...byTitle.entries()].filter(([, urls]) => urls.length > 1);
  const total = [...byTitle.values()].reduce((n, urls) => n + urls.length, 0);

  console.log(`[Titles] Checked ${total} page(s): ${byTitle.size} distinct title(s). Skipped ${skipped} redirected/noindexed/non-canonical page(s).`);

  if (groups.length) {
    const affected = groups.reduce((n, [, urls]) => n + urls.length, 0);
    console.warn(`[Titles] ⚠ ${groups.length} duplicate title(s) across ${affected} pages:`);
    groups
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([title, urls]) => {
        console.warn(`   "${title}"`);
        urls.forEach((u) => console.warn(`      ${u}`));
      });
  }
  if (doubled.length) {
    console.warn(`[Titles] ⚠ ${doubled.length} page(s) with a doubled brand suffix:`);
    doubled.forEach(([url, title]) => console.warn(`   ${url} — "${title}"`));
  }
  if (wrongSeparator.length) {
    console.warn(`[Titles] ⚠ ${wrongSeparator.length} page(s) ending in the brand behind a separator other than "${SEPARATOR.trim()}":`);
    wrongSeparator.slice(0, 10).forEach(([url, title, sep]) => console.warn(`   ${url} — "${title}" (uses "${sep}")`));
    if (wrongSeparator.length > 10) console.warn(`   …and ${wrongSeparator.length - 10} more`);
    console.warn('   Fix: the separator lives in scripts/lib/site-title.cjs and src/lib/seo.ts — they must agree.');
  }
  if (missing.length) {
    console.warn(`[Titles] ⚠ ${missing.length} page(s) with no <title>: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
  }
  if (!groups.length && !doubled.length && !missing.length && !wrongSeparator.length) {
    console.log(`[Titles] No duplicate, doubled or missing titles, and every brand suffix uses "${SEPARATOR.trim()}".`);
  }
}

main();
