# Getmeds Frontend

This is the customer-facing frontend web application for **Getmeds**, built with Vite, React, and TypeScript.

---

## 🛠️ Developer Scripts

Manage the frontend workspace using the following commands:

* **`npm run dev`**: Starts the local development server (Vite).
* **`npm run build`**: Triggers the pre-build scripts and compiles the production bundle.
* **`npm run prebuild`**: Explicitly runs the build-preparation scripts (sitemap generator and Vercel header config updater).
* **`npm run postbuild`**: Runs after `build` — generates a static, per-slug HTML file for every product and condition page (`scripts/prerender-slugs.cjs`), so each has its own title/description/canonical/Open Graph/JSON-LD baked into the raw HTML instead of sharing one generic template.
* **`npm run preview`**: Runs a local preview server for the compiled production bundle.
* **`npm run clean`**: Cleans the build outputs by removing the `dist/` directory.
* **`npm run deploy:refresh`**: Builds locally and deploys the already-built output straight to production — see "Refreshing Prerendered Content" below.

---

## 🗺️ Sitemap Generation (`generate-sitemap.cjs`)

The sitemap configuration is generated dynamically by querying CMS APIs to ensure accurate URL lists for search engines.

### How it Works
1. Queries the **Sanity API** to fetch dynamic product ranges, categories, and subcategories.
2. Queries the **WordPress REST API** (`cms.getmeds.ph`) to retrieve all published blog posts.
3. Generates the following output XMLs directly inside the `public/` directory:
   * `category-sitemap.xml`: Contains static routes and dynamic subcategories.
   * `product-sitemap.xml`: Contains dynamic product URLs.
   * `blog-sitemap.xml`: Contains blog articles (formatted canonically as `/blog/[slug]`).
   * `sitemap.xml`: The master Sitemap Index.

### How to Regenerate Sitemaps
Sitemaps are generated **automatically** before every build (via `prebuild` scripts). If you need to manually fetch updates and write the new files without compiling a full build, run:
```bash
node scripts/generate-sitemap.cjs
```
*(Make sure environment variables in `.env` are configured correctly so the script can resolve API endpoints.)*

---

## 🚀 Refreshing Prerendered Content (low-cost manual deploy)

Product pages, condition pages (`scripts/prerender-slugs.cjs`), and blog posts (`scripts/prerender-blog.cjs`) are all prerendered at build time — each gets its own static HTML file with the correct title/description/canonical/OG/JSON-LD baked in. That means editing a product/condition in Sanity, or publishing a post in WordPress, does **not** update the live site by itself — it only takes effect the next time a build runs.

There's no automatic rebuild trigger (no Sanity webhook, no scheduled job) — refreshing is a deliberate, on-demand step, run whenever someone wants Sanity/WordPress edits reflected live. This was a deliberate choice to keep Vercel usage cost fixed and predictable rather than scaling with how often content is edited.

### Why `deploy:refresh` instead of just pushing to Git
Pushing to `main` triggers Vercel to run the *entire* build **on Vercel's own infrastructure**, which is billed as Build CPU Minutes. `npm run deploy:refresh` instead builds on your own machine first, then uploads the finished, already-built output — Vercel just serves it, without spending any of its own build compute. Functionally identical result, lower Vercel cost.

### One-time setup (per machine)
`npm run deploy:refresh` calls the Vercel CLI via `npx`, so no global install is required — but you do need to authenticate and link this repo to the Vercel project once per machine:
```bash
npx vercel login   # authenticate with the Getmeds Vercel account (opens a browser)
npx vercel link    # run inside this repo — links it to the existing Vercel project
```
(If `npx vercel ...` ever fails with "not recognized"/"command not found", it usually means npx couldn't reach the npm registry to fetch the CLI on demand — check your network/proxy, or fall back to `npm install -g vercel` and drop the `npx --yes` prefix from the `deploy:refresh` script in `package.json`.)

**Logged into the wrong Vercel account?** Log out and back in, then re-link:
```bash
npx vercel logout
npx vercel login   # log in with the correct Getmeds account
npx vercel link    # re-run this even if a .vercel folder already exists — it'll ask to confirm/replace the linked project
```
If a `.vercel/` folder already exists from a previous (wrong-account) link, delete it first so `vercel link` starts fresh instead of trying to reuse the old project reference: remove the `.vercel` folder in this repo's root, then run the three commands above.

### To refresh live content
```bash
npm run deploy:refresh
```
This runs `vercel build --prod` (executes the full local pipeline — `prebuild` → `vite build` → `postbuild`, fetching live Sanity/WordPress data — and packages it Vercel's way), then `vercel deploy --prebuilt --prod` (uploads that finished build straight to production, no remote build step). Run it any time after editing products, conditions, or blog posts and you want the change live immediately, rather than waiting for the next Git-triggered deploy.

---

## 🔒 Headless Isolation & Deindex Protection

To prevent search engines from indexation of the backend WordPress domain (`cms.getmeds.ph`) and ranking it over the canonical frontend (`getmeds.ph`), we utilize a multi-layered security setup:

1. **X-Robots-Tag:** An HTTP header set to `noindex, nofollow, noarchive` for all traffic matching the CMS host.
2. **Headless Redirection (410 Gone):** Configured via `.htaccess` on the Apache server. All public-facing page requests served directly by the CMS return an HTTP status code of `410 Gone`. This immediately drops CMS-served pages from search indexes.
3. **Excluded Endpoints:** Critical paths (e.g., `wp-admin`, `wp-json` API endpoints, `wp-content/wp-includes` assets, and `robots.txt`) remain fully accessible to facilitate headless API queries.

##
