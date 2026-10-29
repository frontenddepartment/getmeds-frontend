# Rank Math-style SEO checklist

The team grades pages with the **Rank Math** checklist (the WordPress SEO plugin's 100-point score).
Rank Math cannot run on this Next.js site, so `scripts/seo-score.mjs` re-implements its checks and
scores any page from its **server HTML**, the HTML Google downloads before any JavaScript runs.

> **For AI agents and developers:** after changing any public page (its copy, headings, metadata,
> structured data, images or layout), score it with the script and put the report in your reply
> or PR, in the format under [Report format](#report-format). Compare before and after when you can,
> and never ship a change that lowers the score without saying so.

## How to run it

```bash
npm run dev                      # the script reads http://localhost:3000 by default
npm run seo:score -- /cancer-medicines/doseget-20-docetaxel-20mg-0.5ml-infusion --keyword "docetaxel"
npm run seo:score -- /ungc -k "un global compact"
npm run seo:score -- https://getmeds.ph/blog -k "health news" --json    # live site, machine-readable
```

- `--keyword` / `-k` is the **focus keyword**: what someone types into Google to find this page.
  Pick it per page (see [Choosing the focus keyword](#choosing-the-focus-keyword)).
- A bare path is fetched from `http://localhost:3000`. Set `SEO_BASE_URL` to score another host.
- `--json` prints the raw checks for scripts and CI.

## The checks (100 points)

Points are this project's approximation of Rank Math's weighting. Content length counts the most,
as it does in Rank Math.

| Group | Check | Points | Pass when |
|---|---|---|---|
| Basic SEO | Keyword in SEO title | 8 | `<title>` contains it |
| | Keyword in meta description | 6 | description contains it |
| | Keyword in URL | 5 | the path contains it (spaces as `-`) |
| | Keyword in first 10% of content | 5 | it appears early in the page text |
| | Keyword in content | 5 | at least once |
| | Content length | 16 | 600 words = 6 · 1,000 = 10 · 1,500 = 13 · 2,500+ = 16 |
| Additional | Keyword in a subheading | 6 | an H2 or H3 contains it |
| | Keyword in an image alt | 4 | an `<img alt>` contains it |
| | Keyword density | 5 | 1–1.5% (0.5–2.5% earns 3) |
| | URL length | 3 | path ≤ 75 characters |
| | Dofollow external link | 4 | at least one outbound link without `nofollow` |
| | Internal links | 4 | 3+ links to other pages on getmeds.ph |
| | Title length | 3 | 50–60 characters (40–65 earns 2) |
| Title readability | Keyword near the start of the title | 4 | in the first half |
| | Positive / sentiment word | 2 | e.g. trusted, affordable, reliable |
| | Power word | 2 | e.g. guide, official, licensed, complete |
| | Number in title | 2 | any digit |
| Content readability | Table of contents | 3 | an on-page contents list |
| | Short paragraphs | 4 | no paragraph over 120 words |
| | Images or video | 3 | at least one in the content |
| Schema | Structured data | 3 | any JSON-LD block |
| | FAQ structured data | 3 | a `FAQPage` block |

Bands: **90+ great · 80–89 good · 60–79 needs work · under 60 poor.** The team's target is 90.

Also check, though they aren't scored: exactly **one H1**, a **canonical** URL (both are printed
in the report), and descriptive **alt text** on every image.

## Report format

Show results in this shape, so every report reads the same:

```markdown
## Rank Math-style SEO score: 49/100 (poor)

- **Page:** /cancer-medicines/doseget-20-docetaxel-20mg-0.5ml-infusion
- **Focus keyword:** "docetaxel"
- **H1:** "DoseGet-20 (Docetaxel (as Trihydrate))"
- **Canonical:** https://getmeds.ph/cancer-medicines/doseget-20-docetaxel-20mg-0.5ml-infusion

**Passing**
| Check | Points | Detail |
|---|---|---|
| ✅ Keyword in SEO title | 8/8 | "DoseGet-20 (Docetaxel) 20mg / 0.5mL Infusion | Getmeds Philippines" |

**Failing**
| Check | Points | Detail |
|---|---|---|
| ❌ Content length | 0/16 | 130 words |

**Biggest gains:** Content length (+16), Keyword in a subheading (+6), …
```

Then add, in plain language:

1. **Honest verdict.** Does it reach 90? Say so plainly if it doesn't.
2. **What would get it to 90,** split into:
   - **Code changes** an agent can make: headings, schema, alt text, internal links, title format.
   - **Content** that people must supply: copy, especially medical copy (see the rules below).
3. **Before → after** scores, if you changed the page.

## Choosing the focus keyword

| Page type | Focus keyword | Example |
|---|---|---|
| Product | generic name (what patients search) | "docetaxel" |
| Condition | condition name | "breast cancer" |
| Category | category + "medicines" | "cancer medicines" |
| Blog post | the post's main topic | "pcso medical assistance" |
| Company pages | the page's subject | "un global compact" |

Search-result wording the team approved ("How it looks on Google" prototype board):

- **Product title:** `{Generic} {strength} {Injection|Tablet|Capsule} Price in the Philippines`
- **Product description:** `Buy {generic} {strength} {form} ({Brand}) from Getmeds. Send an inquiry to order and get a price quote. Prescription required.`
- **Condition title:** `{Condition}: Symptoms, Treatment and Available Medicines`
- **Category title:** `{Category}: Cancer Medicines in the Philippines`

Product titles and descriptions set in the catalogue sheet (`metaTitle` / `metaDescription`) take
priority. `src/lib/catalogSeo.tsx` uses the formats above only when the sheet leaves them blank.

## Rules for this site

- **Prescription medicines.** Oncology and other Rx products have no online price, cart or "buy now".
  Use **order / buy / purchase** wording that leads to the inquiry form or WhatsApp, and keep
  "Prescription required" visible.
- **No invented medical claims.** An agent must not write indications, dosing, side effects or
  efficacy statements. Those come from the catalogue sheet (reviewed by the pharmacist team).
  Agents may add structure (headings, FAQ layout, schema) that is filled from that data.
- **The score isn't a ranking.** Google does not use Rank Math's score. For health pages
  (Google's "Your Money or Your Life" category) accurate, reviewed content and visible credentials
  (FDA licence, licensed pharmacists) matter more than any checklist item.
- **Score the server HTML.** Product and catalogue pages render through `PrerenderHandoff`. Google's
  first pass reads the *baked* server copy (`baked` in `src/lib/catalogSeo.tsx`), not the client
  page, so content that only appears after JavaScript runs barely counts. Keep the baked copy and the
  client page in step: the product image, "Also available in" strengths, "How to order {generic} in
  the Philippines" steps and the ordering FAQs (`src/lib/productFaq.ts`, which also feeds the
  `FAQPage` JSON-LD) appear in both. What still holds product pages back is copy length: the
  catalogue sheet gives each product only a few sentences.
