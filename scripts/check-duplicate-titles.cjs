// Reports pages that ship the same <title> as another page, and titles that lost their
// brand suffix or doubled it.
//
// Two title bugs have shipped before: every product page inheriting the generic shell's
// title, and "… | Getmeds Philippines - Getmeds" from appending the site name to a title
// that already carried it. Both were only caught by reading pages by hand. This runs over
// the built output, after the prerender passes, so a repeat shows up in the build log.
//
// Warns, never fails: a duplicate title is a real SEO problem but not a broken deploy, and
// the prerender scripts already take the same line (see their exitCode = 0 handlers).
const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'dist');
// Partials injected into pages at runtime, not pages themselves — they have no <head>.
const SKIP_DIRS = new Set(['assets', 'components']);

// Four classes of page share a title on purpose and would otherwise drown the real
// findings: a URL that canonicalises somewhere else (/conditions -> /product-range), a URL
// vercel.json permanently redirects away (a superseded blog slug whose file still sits in
// dist), a URL served with a noindex header (/product-detail, the generic shell), and a
// page carrying its own noindex robots meta (the *-preview shells, which are deliberate
// copies of the real page).
function excludedUrls() {
  const excluded = new Set();
  let config;
  try {
    config = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'vercel.json'), 'utf8'));
  } catch {
    return excluded; // no config to read — report everything rather than silently skipping
  }
  const literal = (source) => (source && !source.includes(':') && !source.includes('*') ? source : null);
  (config.redirects || []).forEach((r) => {
    const s = literal(r.source);
    if (s) excluded.add(s.replace(/\.html$/, ''));
  });
  (config.headers || []).forEach((h) => {
    if (!JSON.stringify(h.headers || []).toLowerCase().includes('noindex')) return;
    const s = literal(h.source);
    if (s) excluded.add(s);
  });
  return excluded;
}

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

// The URL a file is served at, which is what a report needs to be actionable.
function urlFor(file) {
  return '/' + path.relative(DIST_DIR, file).replace(/\\/g, '/').replace(/\.html$/, '');
}

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('[Titles] No dist/ — skipping (did `vite build` run first?).');
    return;
  }

  const byTitle = new Map();
  const missing = [];
  const doubled = [];
  const excluded = excludedUrls();
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
    if (/<meta[^>]+name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
      skipped++;
      return;
    }
    // A page pointing its canonical at a different URL is declaring itself the copy, so a
    // shared title there is the intended outcome, not a finding.
    const canonical = (html.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1];
    if (canonical && canonical.replace(/^https?:\/\/[^/]+/, '').replace(/\/$/, '') !== url.replace(/\/index$/, '')) {
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
  if (missing.length) {
    console.warn(`[Titles] ⚠ ${missing.length} page(s) with no <title>: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
  }
  if (!groups.length && !doubled.length && !missing.length) {
    console.log('[Titles] No duplicate, doubled or missing titles.');
  }
}

main();
