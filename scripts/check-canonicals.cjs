// Asserts that every indexable page in dist/ carries a correct canonical tag.
//
// Audit 1 found the site serving each page at two live, byte-identical URLs (/about-us and
// /about-us.html) with no canonical anywhere except /services. That was fixed three ways:
// cleanUrls in vercel.json collapses the duplicate at the edge, the prerender passes stamp
// a canonical into every generated page, and pages that should never be indexed are marked
// noindex. Nothing enforced the middle one — a new page added without a canonical would
// have shipped silently, which is how the original finding accumulated across ~120 pages.
// This is that enforcement.
//
// Unlike the other postbuild guards, this one FAILS the build. The condition it reports is
// unambiguous: a page that is served, is indexable, and does not say which URL is
// authoritative. There is no legitimate reason for that, so there is no false-positive
// class to warn about and move past — and a missing canonical caught here costs a rerun,
// while one that ships costs a re-crawl.
const fs = require('fs');
const {
  DIST_DIR,
  DOMAIN,
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
    console.log('[Canonicals] No dist/ — skipping (did `vite build` run first?).');
    return;
  }

  const excluded = excludedUrls();
  if (excluded === null) {
    console.warn('[Canonicals] ⚠ Could not read vercel.json — skipping rather than reporting every header-noindexed URL as missing.');
    return;
  }

  const missing = [];
  const wrongDomain = [];
  const dotHtml = [];
  const pages = new Map(); // normalised url -> { canonical, indexable }
  let noindexed = 0;
  let redirected = 0;

  walk(DIST_DIR).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const url = urlFor(file);
    const canonical = canonicalOf(html);

    if (excluded.has(url)) {
      redirected++;
      return;
    }
    // A page that tells crawlers not to index it cannot compete with anything in search,
    // so it does not need to nominate an authoritative URL.
    if (hasNoindexMeta(html)) {
      noindexed++;
      return;
    }

    pages.set(normalizeUrl(url), { canonical, url });

    if (!canonical) {
      missing.push(url);
      return;
    }
    if (!canonical.startsWith(DOMAIN + '/') && canonical !== DOMAIN + '/') {
      wrongDomain.push([url, canonical]);
    }
    // cleanUrls redirects /x.html to /x, so a canonical pointing at the .html names a URL
    // that answers 308 and never 200 — the exact duplicate this audit item removed.
    if (/\.html(\?|#|$)/i.test(canonical)) {
      dotHtml.push([url, canonical]);
    }
  });

  // A canonical pointing at another page is legitimate (/conditions -> /product-range), but
  // only if that target is itself indexable and self-canonical. A chain (A -> B -> C) or a
  // canonical aimed at a noindexed or non-existent page leaves the source page orphaned.
  const badTarget = [];
  pages.forEach(({ canonical, url }) => {
    if (!canonical) return;
    const target = canonicalPath(canonical);
    if (target === normalizeUrl(url)) return; // self-referencing, the common case
    const targetPage = pages.get(target);
    if (!targetPage) {
      badTarget.push([url, canonical, 'target is not an indexable page in dist/']);
      return;
    }
    if (canonicalPath(targetPage.canonical) !== target) {
      badTarget.push([url, canonical, 'target canonicalises somewhere else (canonical chain)']);
    }
  });

  const checked = pages.size;
  console.log(`[Canonicals] Checked ${checked} indexable page(s). Skipped ${noindexed} noindexed and ${redirected} redirected/header-noindexed page(s).`);

  const problems = missing.length + wrongDomain.length + dotHtml.length + badTarget.length;

  if (missing.length) {
    console.error(`[Canonicals] ✖ ${missing.length} indexable page(s) with no <link rel="canonical">:`);
    missing.forEach((u) => console.error(`   ${u}`));
    console.error('   Fix: give the page a canonical, or mark it <meta name="robots" content="noindex, follow">.');
  }
  if (wrongDomain.length) {
    console.error(`[Canonicals] ✖ ${wrongDomain.length} canonical(s) not an absolute ${DOMAIN} URL:`);
    wrongDomain.forEach(([u, c]) => console.error(`   ${u} — "${c}"`));
  }
  if (dotHtml.length) {
    console.error(`[Canonicals] ✖ ${dotHtml.length} canonical(s) pointing at a .html URL, which cleanUrls redirects away:`);
    dotHtml.forEach(([u, c]) => console.error(`   ${u} — "${c}"`));
  }
  if (badTarget.length) {
    console.error(`[Canonicals] ✖ ${badTarget.length} cross-canonical(s) pointing somewhere unusable:`);
    badTarget.forEach(([u, c, why]) => console.error(`   ${u} — "${c}" (${why})`));
  }

  if (problems) {
    console.error(`[Canonicals] Build failed: ${problems} canonical problem(s). See Audit 1 in AUDIT CHECKLIST/.`);
    process.exitCode = 1;
    return;
  }

  const selfRef = [...pages.values()].filter(
    (p) => p.canonical && canonicalPath(p.canonical) === normalizeUrl(p.url)
  ).length;
  console.log(`[Canonicals] All ${checked} indexable page(s) canonical — ${selfRef} self-referencing, ${checked - selfRef} pointing at another page on purpose.`);
}

main();
