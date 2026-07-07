# Getmeds Frontend

This is the customer-facing frontend web application for **Getmeds**, built with Vite, React, and TypeScript.

---

## 🛠️ Developer Scripts

Manage the frontend workspace using the following commands:

* **`npm run dev`**: Starts the local development server (Vite).
* **`npm run build`**: Triggers the pre-build scripts and compiles the production bundle.
* **`npm run prebuild`**: Explicitly runs the build-preparation scripts (sitemap generator and Vercel header config updater).
* **`npm run preview`**: Runs a local preview server for the compiled production bundle.
* **`npm run clean`**: Cleans the build outputs by removing the `dist/` directory.

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

## 🔒 Headless Isolation & Deindex Protection

To prevent search engines from indexation of the backend WordPress domain (`cms.getmeds.ph`) and ranking it over the canonical frontend (`getmeds.ph`), we utilize a multi-layered security setup:

1. **X-Robots-Tag:** An HTTP header set to `noindex, nofollow, noarchive` for all traffic matching the CMS host.
2. **Headless Redirection (410 Gone):** Configured via `.htaccess` on the Apache server. All public-facing page requests served directly by the CMS return an HTTP status code of `410 Gone`. This immediately drops CMS-served pages from search indexes.
3. **Excluded Endpoints:** Critical paths (e.g., `wp-admin`, `wp-json` API endpoints, `wp-content/wp-includes` assets, and `robots.txt`) remain fully accessible to facilitate headless API queries.
