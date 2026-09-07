// How a page title and meta description are shaped, for the build-time prerender passes.
//
// Audit 3 asked for the brand to appear once in every title "and be formatted consistently".
// The first half was fixed; the second half failed because this logic existed as five
// separate copies — three prerender scripts, src/lib/seo.ts, and src/pages/blog-detail.tsx —
// and they drifted. Three appended " - Getmeds", two appended " — Getmeds", so the site
// shipped 371 pages with an em dash and 94 with a hyphen and nothing to notice it.
//
// The three build-time copies now live here. The two runtime copies use the exported
// withSiteName in src/lib/seo.ts, which this deliberately matches character for character.
// Those cannot be one module — this is CommonJS run by node during the build, that is
// TypeScript bundled into the browser — so if the separator ever changes it must change in
// both. The postbuild guard in check-duplicate-titles.cjs is what catches a divergence.

// The standard separator is a hyphen, chosen over the em dash because it was already what
// src/lib/seo.ts and most of the build wrote, so standardising on it changed the fewest
// published titles.
const SITE_NAME = 'Getmeds';
const SEPARATOR = ' - ';

// Appends the site name only when the title doesn't already contain it. Product titles come
// from the sheet's Meta Title column and already end "| Getmeds Philippines", and several
// blog posts open with the brand, so appending unconditionally printed it twice
// ("... | Getmeds Philippines - Getmeds") — the Audit 3 finding.
//
// Titles that carry the brand themselves are left exactly as written: those are authored
// strings, and rewriting them here would mean this function deciding how the SEO team and
// the newsroom spell their own brand.
function withSiteName(title) {
  const t = String(title || '').trim();
  if (!t) return SITE_NAME;
  return new RegExp(SITE_NAME, 'i').test(t) ? t : t + SEPARATOR + SITE_NAME;
}

// Words that leave the reader mid-thought if they are the last thing on the line. Ending a
// description on any of these reads as a page that broke rather than a sentence that ran on.
const DANGLING_WORDS = new Set([
  'a', 'an', 'the',
  'and', 'or', 'but', 'nor', 'so', 'yet', 'plus',
  'of', 'in', 'to', 'from', 'by', 'on', 'at', 'as', 'for', 'with', 'without',
  'into', 'onto', 'over', 'under', 'per', 'via', 'about', 'after', 'before',
  'between', 'during', 'through', 'within', 'across', 'against', 'among',
  'around', 'beyond', 'near', 'since', 'until', 'upon',
  'that', 'which', 'who', 'whom', 'whose', 'this', 'these', 'those',
  'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'has', 'have', 'had', 'will', 'would', 'can', 'could', 'may', 'might',
  'shall', 'should', 'must', 'do', 'does', 'did',
  'its', 'their', 'our', 'your', 'his', 'her', 'my',
  'if', 'when', 'while', 'than', 'then', 'because', 'although', 'though',
  'unless', 'whether', 'both', 'either', 'neither', 'not', 'no',
]);

// Cuts a meta description to `max` characters without ending it somewhere that reads as
// broken.
//
// This has been wrong twice. The original hard slice(0, 160) cut mid-word and left 28 of 61
// product descriptions ending like "...and pharm" — visible in the Audit 3 screenshot, one
// line under the doubled title it was actually about. Cutting on a word boundary fixed that
// but not the real problem: a word boundary is a legal place to stop and "and" is a terrible
// place to end, so 145 descriptions still trailed off on "and", "the", "for", "to".
//
// So the boundary is not enough on its own — the last word has to be one a reader can stop
// on. Trailing function words are dropped (repeatedly: "hospitals, clinics, and" loses "and"
// and then the comma), and an ellipsis marks the cut so the text reads as continuing rather
// than as having failed. Text that already ends on sentence punctuation keeps it and gets no
// ellipsis, because nothing was left hanging.
//
// The minimum-length guard stops a description made mostly of short function words from
// being stripped down to nothing; below that floor a slightly awkward ending beats an empty
// description.
function truncateAtWord(text, max) {
  const t = String(text || '').replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;

  // One character is held back so the ellipsis fits inside `max`.
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  let out = lastSpace > 0 ? cut.slice(0, lastSpace) : cut;

  const floor = Math.floor(max * 0.4);
  for (;;) {
    // Sentence punctuation is deliberately not stripped here — it is the one ending that
    // needs no repair, and the check below returns on it.
    const trimmed = out.replace(/[\s,;:\-–—]+$/, '');
    const lastWord = trimmed.match(/\s([A-Za-z][A-Za-z']*)$/);
    if (lastWord && trimmed.length > floor && DANGLING_WORDS.has(lastWord[1].toLowerCase())) {
      out = trimmed.slice(0, trimmed.length - lastWord[0].length);
      continue;
    }
    out = trimmed;
    break;
  }

  if (!out) return '';
  return /[.!?]$/.test(out) ? out : out + '…';
}

// Turns a block of stored HTML into plain text fit for a meta description.
//
// Decoding matters as much as stripping. The policy pages' stored content carries entities
// ("&mdash;", "&quot;"), and tag-stripping alone left those intact — then the writer escaped
// the whole string again, turning "&mdash;" into "&amp;mdash;", which a search result
// renders as the literal characters "&mdash;". Decoding first means the re-escape produces
// the character the reader should see.
function excerptFromHtml(html, max) {
  const text = decodeEntities(String(html || '').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
  return truncateAtWord(text, max);
}

// The named entities that actually occur in this content, plus numeric forms. Ordering is
// deliberate: &amp; is decoded last so "&amp;lt;" ends up as "&lt;" rather than "<".
function decodeEntities(str) {
  return String(str || '')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&rdquo;/g, '”')
    .replace(/&ldquo;/g, '“')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

module.exports = {
  SITE_NAME,
  SEPARATOR,
  DANGLING_WORDS,
  withSiteName,
  truncateAtWord,
  decodeEntities,
  excerptFromHtml,
};
