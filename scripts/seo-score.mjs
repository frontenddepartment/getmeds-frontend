#!/usr/bin/env node
/*
 * Rank Math-style SEO score for one page of this site.
 *
 *   npm run seo:score -- <url-or-path> --keyword "docetaxel" [--json]
 *   npm run seo:score -- /cancer-medicines/doseget-20-docetaxel-20mg-0.5ml-infusion -k docetaxel
 *
 * Reads the page's server HTML (what Google receives, before any client JavaScript runs), runs the
 * checks in docs/seo/RANK_MATH_CHECKLIST.md and prints the report in the format that document
 * describes. A bare path is fetched from http://localhost:3000 (run `npm run dev` first), or from
 * SEO_BASE_URL if set.
 *
 * The score is an approximation of Rank Math's 100-point checklist. Rank Math itself is a WordPress
 * plugin and cannot run on this Next.js site. No dependencies: Node 18+ only.
 */

const args = process.argv.slice(2);
const flag = (...names) => {
  const i = args.findIndex((a) => names.includes(a));
  return i >= 0 ? args[i + 1] : undefined;
};
const target = args.find((a, i) => !a.startsWith("-") && !["--keyword", "-k"].includes(args[i - 1]));
const keyword = (flag("--keyword", "-k") || "").trim().toLowerCase();
const asJson = args.includes("--json");

if (!target || !keyword) {
  console.error('Usage: npm run seo:score -- <url-or-path> --keyword "focus keyword" [--json]');
  process.exit(1);
}

const base = (process.env.SEO_BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const url = /^https?:\/\//.test(target) ? target : `${base}${target.startsWith("/") ? "" : "/"}${target}`;

// ---------- tiny HTML helpers (no parser dependency) ----------
const decode = (s) =>
  s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
// React separates adjacent text with <!-- --> comments: drop those without adding a space
const stripTags = (s) => decode(s.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i"));
  return m ? decode(m[2] ?? m[3] ?? "") : undefined;
};
const all = (html, re) => [...html.matchAll(re)];
const count = (hay, needle) => (needle ? hay.split(needle).length - 1 : 0);

const POWER_WORDS = ["best", "proven", "trusted", "complete", "essential", "ultimate", "guide", "official", "affordable", "fast", "easy", "new", "free", "expert", "safe", "genuine", "licensed", "certified"];
const SENTIMENT_WORDS = ["best", "trusted", "affordable", "safe", "easy", "reliable", "genuine", "effective", "quality", "fast", "free", "better", "great"];

(async () => {
  const res = await fetch(url, { headers: { "User-Agent": "getmeds-seo-score/1.0" }, redirect: "follow" });
  if (!res.ok) {
    console.error(`Fetch failed: ${res.status} ${res.statusText} for ${url}`);
    process.exit(1);
  }
  const html = await res.text();
  const finalUrl = new URL(res.url);

  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
  const title = stripTags(head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const metaDesc = (() => {
    const tag = all(head, /<meta\b[^>]*>/gi).map((m) => m[0]).find((t) => attr(t, "name")?.toLowerCase() === "description");
    return tag ? attr(tag, "content") || "" : "";
  })();
  const canonical = (() => {
    const tag = all(head, /<link\b[^>]*>/gi).map((m) => m[0]).find((t) => attr(t, "rel")?.toLowerCase() === "canonical");
    return tag ? attr(tag, "href") || "" : "";
  })();

  // JSON-LD types anywhere in the document
  const ldTypes = [];
  for (const m of all(html, /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const walk = (n) => {
        if (!n || typeof n !== "object") return;
        if (Array.isArray(n)) return n.forEach(walk);
        if (n["@type"]) ldTypes.push(...[].concat(n["@type"]));
        Object.values(n).forEach(walk);
      };
      walk(JSON.parse(m[1]));
    } catch {
      /* ignore malformed blocks */
    }
  }

  // Page content: body without scripts, styles, site chrome (nav/header/footer), forms and hidden templates
  let body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] || html;
  body = body
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<template[\s\S]*?<\/template>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|header|footer|form)\b[\s\S]*?<\/\1>/gi, " ");

  const text = stripTags(body);
  const lower = text.toLowerCase();
  const words = text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));
  const kwWords = keyword.split(/\s+/).length;
  const kwHits = count(lower, keyword);
  const density = words.length ? (kwHits * kwWords * 100) / words.length : 0;
  const first10 = words.slice(0, Math.max(1, Math.round(words.length * 0.1))).join(" ").toLowerCase();

  const headings = all(body, /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi).map((m) => ({ level: Number(m[1]), text: stripTags(m[2]) }));
  const h1s = headings.filter((h) => h.level === 1);
  const subheads = headings.filter((h) => h.level === 2 || h.level === 3);
  const imgs = all(body, /<img\b[^>]*>/gi).map((m) => ({ src: attr(m[0], "src") || "", alt: attr(m[0], "alt") }));
  const links = all(body, /<a\b[^>]*>/gi)
    .map((m) => ({ href: attr(m[0], "href") || "", rel: (attr(m[0], "rel") || "").toLowerCase() }))
    .filter((l) => l.href && !l.href.startsWith("#") && !/^(mailto|tel|javascript):/i.test(l.href));
  const isExternal = (h) => {
    try {
      return new URL(h, finalUrl).host !== finalUrl.host;
    } catch {
      return false;
    }
  };
  const internal = links.filter((l) => !isExternal(l.href));
  const external = links.filter((l) => isExternal(l.href));
  const dofollowExternal = external.filter((l) => !l.rel.includes("nofollow"));
  const paragraphs = all(body, /<p\b[^>]*>([\s\S]*?)<\/p>/gi).map((m) => stripTags(m[1])).filter((p) => p.split(/\s+/).length >= 5);
  const longParas = paragraphs.filter((p) => p.split(/\s+/).length > 120);
  // A real contents list: a heading that names one, or an element marked as a TOC (not just the phrase in body copy)
  const hasToc =
    headings.some((h) => /^(table of contents|contents|on this page|in this article)$/i.test(h.text)) ||
    /<[^>]+(class|id)=["'][^"']*\b(toc|table-of-contents)\b/i.test(body);
  const urlPath = decodeURIComponent(finalUrl.pathname);
  const kwSlug = keyword.replace(/\s+/g, "-");
  const titleLower = title.toLowerCase();
  const kwPosInTitle = titleLower.indexOf(keyword);

  // ---------- checks: [group, label, points earned, points possible, detail] ----------
  const checks = [];
  const add = (group, label, earned, possible, detail) => checks.push({ group, label, earned, possible, detail, status: earned >= possible ? "pass" : earned > 0 ? "warn" : "fail" });

  add("Basic SEO", "Keyword in SEO title", titleLower.includes(keyword) ? 8 : 0, 8, `"${title}"`);
  add("Basic SEO", "Keyword in meta description", metaDesc.toLowerCase().includes(keyword) ? 6 : 0, 6, metaDesc ? `"${metaDesc}"` : "no meta description");
  add("Basic SEO", "Keyword in URL", urlPath.toLowerCase().includes(kwSlug) || urlPath.toLowerCase().includes(keyword) ? 5 : 0, 5, urlPath);
  add("Basic SEO", "Keyword in first 10% of content", first10.includes(keyword) ? 5 : 0, 5, first10.includes(keyword) ? "found" : "not in the opening text");
  add("Basic SEO", "Keyword in content", kwHits > 0 ? 5 : 0, 5, `${kwHits} mention(s)`);
  const len = words.length;
  add("Basic SEO", "Content length (600+, 2,500 for full marks)", len >= 2500 ? 16 : len >= 1500 ? 13 : len >= 1000 ? 10 : len >= 600 ? 6 : len >= 300 ? 2 : 0, 16, `${len} words`);

  add("Additional", "Keyword in a subheading (H2/H3)", subheads.some((h) => h.text.toLowerCase().includes(keyword)) ? 6 : 0, 6, subheads.length ? subheads.map((h) => h.text).slice(0, 8).join(" | ") : "no H2/H3");
  add("Additional", "Keyword in an image alt", imgs.some((i) => (i.alt || "").toLowerCase().includes(keyword)) ? 4 : 0, 4, `${imgs.length} image(s), ${imgs.filter((i) => !i.alt).length} without alt`);
  add("Additional", "Keyword density 1–1.5%", density >= 1 && density <= 1.5 ? 5 : density >= 0.5 && density <= 2.5 ? 3 : 0, 5, `${density.toFixed(2)}%`);
  add("Additional", "URL length ≤ 75 characters", urlPath.length <= 75 ? 3 : 0, 3, `${urlPath.length} characters`);
  add("Additional", "Dofollow external link", dofollowExternal.length ? 4 : external.length ? 2 : 0, 4, `${external.length} external (${dofollowExternal.length} dofollow)`);
  add("Additional", "Internal links", internal.length >= 3 ? 4 : internal.length ? 2 : 0, 4, `${internal.length} internal`);
  add("Additional", "Title length 50–60 characters", title.length >= 50 && title.length <= 60 ? 3 : title.length >= 40 && title.length <= 65 ? 2 : 0, 3, `${title.length} characters`);

  add("Title readability", "Keyword near the start of the title", kwPosInTitle >= 0 && kwPosInTitle <= title.length / 2 ? 4 : 0, 4, kwPosInTitle >= 0 ? `at character ${kwPosInTitle + 1}` : "not in title");
  add("Title readability", "Positive / sentiment word in title", SENTIMENT_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(titleLower)) ? 2 : 0, 2, "");
  add("Title readability", "Power word in title", POWER_WORDS.some((w) => new RegExp(`\\b${w}\\b`).test(titleLower)) ? 2 : 0, 2, "");
  add("Title readability", "Number in title", /\d/.test(title) ? 2 : 0, 2, "");

  add("Content readability", "Table of contents", hasToc ? 3 : 0, 3, "");
  add("Content readability", "Short paragraphs (≤ 120 words)", paragraphs.length && !longParas.length ? 4 : paragraphs.length ? 2 : 0, 4, `${paragraphs.length} paragraph(s), ${longParas.length} too long`);
  add("Content readability", "Images or video in content", imgs.length ? 3 : 0, 3, `${imgs.length} image(s)`);

  add("Schema", "Structured data (JSON-LD)", ldTypes.length ? 3 : 0, 3, ldTypes.length ? [...new Set(ldTypes)].join(", ") : "none");
  add("Schema", "FAQ structured data", ldTypes.includes("FAQPage") ? 3 : 0, 3, ldTypes.includes("FAQPage") ? "FAQPage present" : "no FAQPage");

  const score = checks.reduce((n, c) => n + c.earned, 0);
  const extras = {
    h1Count: h1s.length,
    h1: h1s.map((h) => h.text),
    canonical,
  };

  if (asJson) {
    console.log(JSON.stringify({ url: finalUrl.href, keyword, score, checks, ...extras }, null, 2));
    return;
  }

  const icon = { pass: "✅", warn: "⚠️", fail: "❌" };
  const band = score >= 90 ? "great" : score >= 80 ? "good" : score >= 60 ? "needs work" : "poor";
  const out = [];
  out.push(`## Rank Math-style SEO score: ${score}/100 (${band})`);
  out.push("");
  out.push(`- **Page:** ${finalUrl.pathname}`);
  out.push(`- **Focus keyword:** "${keyword}"`);
  out.push(`- **H1:** ${h1s.length === 1 ? `"${h1s[0].text}"` : `${h1s.length} found${h1s.length ? `: ${h1s.map((h) => `"${h.text}"`).join(", ")}` : ""} (should be exactly 1)`}`);
  out.push(`- **Canonical:** ${canonical || "missing"}`);
  out.push("");
  for (const status of ["pass", "warn", "fail"]) {
    const rows = checks.filter((c) => c.status === status);
    if (!rows.length) continue;
    out.push(`**${status === "pass" ? "Passing" : status === "warn" ? "Partly passing" : "Failing"}**`);
    out.push("");
    out.push("| Check | Points | Detail |");
    out.push("|---|---|---|");
    rows.forEach((c) => out.push(`| ${icon[c.status]} ${c.label} | ${c.earned}/${c.possible} | ${String(c.detail).replace(/\|/g, "\\|")} |`));
    out.push("");
  }
  const missing = checks.filter((c) => c.status !== "pass").sort((a, b) => b.possible - b.earned - (a.possible - a.earned));
  if (missing.length) {
    out.push(`**Biggest gains:** ${missing.slice(0, 4).map((c) => `${c.label} (+${c.possible - c.earned})`).join(", ")}`);
    out.push("");
  }
  out.push("_Approximation of Rank Math's checklist, scored from the server HTML. See docs/seo/RANK_MATH_CHECKLIST.md._");
  console.log(out.join("\n"));
})().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
