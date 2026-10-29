<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SEO: score every public page you change

The team grades pages with the Rank Math SEO checklist (target: 90/100). After changing a public
page's copy, headings, metadata, structured data, images or layout:

1. Read `docs/seo/RANK_MATH_CHECKLIST.md`.
2. Run `npm run seo:score -- <path> --keyword "<focus keyword>"` with `npm run dev` running.
3. Put the report in your reply or PR in the format that document describes: the score, the
   passing and failing tables, an honest verdict on whether it reaches 90, and what would get it
   there (code changes you can make vs. content people must supply).

Never invent medical claims (indications, dosing, side effects) to raise a score; that content
comes from the catalogue sheet. Prescription medicines have no online price or cart: use
order/buy/purchase wording that leads to the inquiry form.