// Reports pages that ship one title or description in their HTML and replace it with
// different words once React mounts.
//
// This is a multi-page app with no client-side router: each page is its own HTML file with
// its own entry, and the URL does not change while a page is open. So for a static page the
// served <head> is already final, and a setPageMeta() call on mount has nothing to do except
// create a second copy of the same strings. Nine pages had drifted that way — /csr served
// the title "CSR - Getmeds" and hydrated into "Corporate Social Responsibility - Getmeds",
// and /order-medicines replaced a real description with "A simple 3-step process designed
// for your convenience", a heading lifted from the page body.
//
// A crawler that does not run JavaScript indexes the served copy; a person, and Google's
// rendering pass, sees the hydrated one. Nothing errors, which is why it went unnoticed.
//
// Only literal strings are compared. A page that builds its meta from fetched data —
// policy.tsx from the policy body, product-detail.tsx from the sheet row — has no literal to
// read, so it falls out of scope on its own. That is deliberate rather than a keyword list of
// "dynamic-looking" pages: the rule is simply that this can compare what it can see.
//
// Warns, never fails, matching the other head-metadata guards.
const fs = require('fs');
const path = require('path');
const { withSiteName } = require('./lib/site-title.cjs');

const ROOT = path.join(__dirname, '..');
const PAGES_DIR = path.join(ROOT, 'src', 'pages');

// A quoted JS string that tolerates escaped quotes of its own kind — "We don't" is a single
// -quoted value containing an apostrophe, and a lazy [^']* stops dead on it.
const QUOTED = String.raw`(['"\x60])((?:\\.|(?!\1)[\s\S])*?)\1`;

function unescapeJs(s) {
  return s.replace(/\\(['"`])/g, '$1').replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
}

function unescapeHtml(s) {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function servedMeta(htmlFile) {
  if (!fs.existsSync(htmlFile)) return null;
  const h = fs.readFileSync(htmlFile, 'utf8');
  const title = h.match(/<title>([\s\S]*?)<\/title>/i);
  const desc = h.match(/<meta\s+name=["']description["'][\s\S]*?content=(["'])([\s\S]*?)\1/i);
  return {
    title: title ? unescapeHtml(title[1]) : null,
    description: desc ? unescapeHtml(desc[2]) : null,
  };
}

// Every title/description a page can set at runtime. A page with one setPageMeta call yields
// one of each; policy.tsx yields one per policy slug.
function runtimeMeta(tsxFile) {
  const s = fs.readFileSync(tsxFile, 'utf8');
  const titles = [];
  const descriptions = [];
  let hasExpression = false;

  // A value is comparable only if it is a plain quoted string. Anything else — a ternary, a
  // template literal, an identifier — is computed from data this cannot see, and one such
  // value puts the whole page out of scope. cancer-medicines.tsx is the case that forced
  // this: it has a literal 'Products' for the all-products view AND a per-category ternary,
  // and reading only the literal made a data-driven page look like it had drifted.
  const isLiteral = (call, field) => new RegExp(`${field}:\\s*['"\`]`).test(call);

  const calls = s.match(/setPageMeta\(\{[\s\S]*?\n\s*\}\)/g) || [];
  calls.forEach((call) => {
    ['title', 'description'].forEach((field) => {
      if (!new RegExp(`${field}:`).test(call)) return;
      if (!isLiteral(call, field)) {
        hasExpression = true;
        return;
      }
      const m = call.match(new RegExp(field + ':\\s*' + QUOTED));
      if (!m) return;
      (field === 'title' ? titles : descriptions).push(
        field === 'title' ? withSiteName(unescapeJs(m[2])) : unescapeJs(m[2])
      );
    });
  });

  // Pages that assign document.title directly rather than going through setPageMeta.
  (s.match(/document\.title\s*=\s*[^;]+;/g) || []).forEach((line) => {
    const value = line.replace(/^[\s\S]*?=\s*/, '').replace(/;$/, '').trim();
    if (!/^['"`]/.test(value)) {
      hasExpression = true;
      return;
    }
    const lit = value.match(new RegExp('^' + QUOTED));
    if (lit && lit[2].trim()) titles.push(withSiteName(unescapeJs(lit[2])));
  });

  return { titles, descriptions, hasExpression };
}

// src/pages/<name>.tsx is served by <name>.html, except the homepage, which lives in
// index.html. Missing that alias left the one page Audit 4 is actually about uncovered.
const SHELL_FOR = { home: 'index' };

function main() {
  if (!fs.existsSync(PAGES_DIR)) {
    console.log('[Meta] No src/pages — skipping.');
    return;
  }

  const findings = [];
  const compared = [];
  let noLiteral = 0;

  fs.readdirSync(PAGES_DIR)
    .filter((f) => f.endsWith('.tsx'))
    .forEach((f) => {
      const name = f.replace(/\.tsx$/, '');
      const tsx = path.join(PAGES_DIR, f);
      const shell = SHELL_FOR[name] || name;
      const served = servedMeta(path.join(ROOT, `${shell}.html`));
      // No matching static shell means the page is prerendered per-slug (products, blog
      // posts, policies) and its runtime values come from fetched data — nothing to compare.
      if (!served) return;

      const runtime = runtimeMeta(tsx);
      // One computed value takes the page out of scope: its served shell is a fallback for
      // whatever the data produces, not a claim this comparison can check.
      if (runtime.hasExpression) {
        noLiteral++;
        return;
      }
      // No values at all is the intended state for a static page — the served HTML is the
      // only copy, which is the whole point.
      if (!runtime.titles.length && !runtime.descriptions.length) return;
      compared.push(`/${name === 'home' ? '' : name}`);

      const url = name === 'home' ? '/' : `/${name}`;
      if (served.title && runtime.titles.length && !runtime.titles.includes(served.title)) {
        findings.push([url, 'title', served.title, runtime.titles[0]]);
      }
      if (served.description && runtime.descriptions.length && !runtime.descriptions.includes(served.description)) {
        findings.push([url, 'description', served.description, runtime.descriptions[0]]);
      }
    });

  console.log(`[Meta] Compared served vs runtime metadata on ${compared.length} page(s)${compared.length ? ` (${compared.join(', ')})` : ''}. ${noLiteral} page(s) set meta from fetched data, so there is no literal to compare.`);

  if (!findings.length) {
    console.log('[Meta] No page changes its title or description on hydration.');
    return;
  }

  console.warn(`[Meta] ⚠ ${findings.length} value(s) differ between the served HTML and the hydrated page:`);
  findings.forEach(([url, field, served, runtime]) => {
    console.warn(`   ${url} — ${field}`);
    console.warn(`      served : ${served.slice(0, 100)}`);
    console.warn(`      runtime: ${runtime.slice(0, 100)}`);
  });
  console.warn('   A crawler indexes the served copy; a person sees the hydrated one. On a page whose');
  console.warn('   URL never changes client-side, the runtime call is redundant — delete it and let the');
  console.warn('   served HTML be the only copy.');
}

main();
