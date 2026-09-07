// Reports meta descriptions that end somewhere a reader cannot stop, and pages that have no
// description at all.
//
// The description is the grey line Google prints under the page's link, and it is generated
// by cutting longer copy down to 160 characters. That cut has been wrong twice: first
// mid-word ("...and pharm"), then on a word boundary that still landed on "and", "the" or
// "for" — 145 pages trailing off mid-thought. Neither was noticed from the build, because a
// truncated description does not break anything; it just reads badly to whoever is deciding
// whether to click.
//
// Warns, never fails, matching check-duplicate-titles.cjs: this is copy quality, not a
// broken deploy, and the pages still work.
const fs = require('fs');
const {
  DIST_DIR,
  walk,
  urlFor,
  excludedUrls,
  hasNoindexMeta,
} = require('./lib/dist-pages.cjs');
const { DANGLING_WORDS } = require('./lib/site-title.cjs');

// Anything the sentence could legitimately end on. A description that stops here reads as
// finished, or as deliberately continuing.
const CLEAN_ENDING = /[.!?…)"'”’]$/;

function main() {
  if (!fs.existsSync(DIST_DIR)) {
    console.log('[Descriptions] No dist/ — skipping (did `vite build` run first?).');
    return;
  }

  const excluded = excludedUrls() || new Set();
  const dangling = [];
  const abrupt = [];
  const missing = [];
  let checked = 0;
  let skipped = 0;

  walk(DIST_DIR).forEach((file) => {
    const html = fs.readFileSync(file, 'utf8');
    const url = urlFor(file);
    // A page kept out of the index has no search snippet to get wrong.
    if (excluded.has(url) || hasNoindexMeta(html)) {
      skipped++;
      return;
    }

    // The delimiter is captured and matched back, not lumped into one character class:
    // "Browse Getmeds' full range…" is a double-quoted attribute containing an apostrophe,
    // and a [^"']* class stops dead at that apostrophe. That read 281 healthy descriptions
    // as truncated on the first run of this check.
    const match = html.match(/<meta\s+name=["']description["']\s+content=(["'])([\s\S]*?)\1/i);
    if (!match) {
      missing.push(url);
      return;
    }
    const text = match[2].replace(/&amp;/g, '&').trim();
    if (!text) {
      missing.push(url);
      return;
    }
    checked++;

    if (CLEAN_ENDING.test(text)) return;

    const lastWord = (text.match(/([A-Za-z][A-Za-z']*)$/) || [])[1];
    if (lastWord && DANGLING_WORDS.has(lastWord.toLowerCase())) {
      dangling.push([url, text, lastWord]);
    } else {
      // Not a function word, but still no ellipsis and no punctuation — the sentence simply
      // stops. Lower severity than a dangling "and", so it is counted rather than listed.
      abrupt.push([url, text]);
    }
  });

  console.log(`[Descriptions] Checked ${checked} indexable page(s). Skipped ${skipped} noindexed/redirected page(s).`);

  if (dangling.length) {
    console.warn(`[Descriptions] ⚠ ${dangling.length} description(s) ending on a word that leaves the sentence hanging:`);
    dangling.slice(0, 10).forEach(([url, text, word]) =>
      console.warn(`   ${url} — "…${text.slice(-60)}" (ends on "${word}")`)
    );
    if (dangling.length > 10) console.warn(`   …and ${dangling.length - 10} more`);
    console.warn('   Fix: truncateAtWord in scripts/lib/site-title.cjs and src/lib/seo.ts — they must agree.');
  }
  if (abrupt.length) {
    console.warn(`[Descriptions] ⚠ ${abrupt.length} description(s) ending with no punctuation and no ellipsis:`);
    abrupt.slice(0, 5).forEach(([url, text]) => console.warn(`   ${url} — "…${text.slice(-60)}"`));
    if (abrupt.length > 5) console.warn(`   …and ${abrupt.length - 5} more`);
  }
  if (missing.length) {
    console.warn(`[Descriptions] ⚠ ${missing.length} indexable page(s) with no description: ${missing.slice(0, 5).join(', ')}${missing.length > 5 ? '…' : ''}`);
  }
  if (!dangling.length && !abrupt.length && !missing.length) {
    console.log('[Descriptions] Every description ends cleanly.');
  }
}

main();
