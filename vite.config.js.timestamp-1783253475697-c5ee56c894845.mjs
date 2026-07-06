// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/Getmeds/Desktop/getmeds-frontend/node_modules/vite/dist/node/index.js";
import fs2 from "fs";
import path2 from "path";
import { execSync } from "child_process";

// src/plugins/sanityImageSync.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "file:///C:/Users/Getmeds/Desktop/getmeds-frontend/node_modules/@sanity/client/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Getmeds/Desktop/getmeds-frontend/src/plugins/sanityImageSync.js";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var IMAGE_CALL_PATTERN = /getImage\(\s*['"]([^'"]+)['"]/g;
var SLIDER_CALL_PATTERN = /getSliderImages\(\s*['"]([^'"]+)['"]/g;
function extractSlotNamesFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const names = /* @__PURE__ */ new Set();
  for (const match of content.matchAll(IMAGE_CALL_PATTERN)) {
    names.add(match[1]);
  }
  for (const match of content.matchAll(SLIDER_CALL_PATTERN)) {
    names.add(match[1]);
  }
  return names;
}
function scanAllPageSlots(pagesDir) {
  const nameToPageMap = /* @__PURE__ */ new Map();
  if (!fs.existsSync(pagesDir)) {
    console.warn(`[ImageSync] Pages directory not found: ${pagesDir}`);
    return nameToPageMap;
  }
  const files = fs.readdirSync(pagesDir).filter((f) => f.endsWith(".tsx"));
  for (const file of files) {
    const pageSlug = file.replace(/\.tsx$/, "");
    const filePath = path.join(pagesDir, file);
    const names = extractSlotNamesFromFile(filePath);
    for (const name of names) {
      nameToPageMap.set(name, pageSlug);
    }
  }
  return nameToPageMap;
}
function sanityImageSyncPlugin() {
  return {
    name: "sanity-image-sync",
    async buildStart() {
      const projectId = process.env.VITE_SANITY_PROJECT_ID || "s7ocz8zp";
      const dataset = process.env.VITE_SANITY_DATASET || "production";
      const apiVersion = process.env.VITE_SANITY_API_VERSION || "2024-01-01";
      const writeToken = process.env.SANITY_WRITE_TOKEN;
      if (!writeToken) {
        console.warn(
          "\n[ImageSync] \u26A0\uFE0F  SANITY_WRITE_TOKEN is not set in .env \u2014 skipping auto-sync.\n           Add SANITY_WRITE_TOKEN=sk... to your .env file to enable it.\n"
        );
        return;
      }
      const sanity = createClient({
        projectId,
        dataset,
        apiVersion,
        token: writeToken,
        useCdn: false
      });
      const pagesDir = path.resolve(__dirname, "../src/pages");
      const nameToPageMap = scanAllPageSlots(pagesDir);
      if (nameToPageMap.size === 0) {
        console.log("[ImageSync] No getImage() calls found in src/pages/");
        return;
      }
      nameToPageMap.delete("assets/getmedslogo.png");
      let existingNames = /* @__PURE__ */ new Set();
      try {
        const existing = await sanity.fetch(
          `*[_type == "pageAsset"]{ name }`,
          {},
          { cache: "no-store" }
        );
        existingNames = new Set(existing.map((doc) => doc.name));
      } catch (err) {
        console.error("[ImageSync] Failed to fetch existing pageAsset docs:", err.message);
        return;
      }
      const missing = [...nameToPageMap.keys()].filter((name) => !existingNames.has(name));
      if (missing.length === 0) {
        console.log(`[ImageSync] \u2705 All ${nameToPageMap.size} image slots are already in Sanity.`);
        return;
      }
      console.log(`
[ImageSync] Found ${missing.length} new image slot(s) not yet in Sanity:`);
      missing.forEach((name) => console.log(`  + "${name}" (Page: ${nameToPageMap.get(name)})`));
      let created = 0;
      for (const name of missing) {
        const docId = `page-asset-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
        const pageSlug = nameToPageMap.get(name);
        try {
          await sanity.createIfNotExists({
            _type: "pageAsset",
            _id: docId,
            name,
            page: pageSlug,
            images: []
          });
          console.log(`[ImageSync]   \u2713 Created slot: "${name}" for page: ${pageSlug}`);
          created++;
        } catch (err) {
          console.error(`[ImageSync]   \u2717 Failed to create slot "${name}":`, err.message);
        }
      }
      console.log(
        `
[ImageSync] \u2705 Done \u2014 ${created} new slot(s) created in Sanity.
`
      );
    }
  };
}

// vite.config.js
var getHtmlInputs = () => {
  const dir = process.cwd();
  const files = fs2.readdirSync(dir);
  const htmlFiles = files.filter((f) => f.endsWith(".html"));
  const inputs = {};
  htmlFiles.forEach((file) => {
    const name = file.replace(/\.html$/, "");
    inputs[name] = path2.resolve(dir, file);
  });
  return inputs;
};
var getSubcategorySlug = (name) => {
  return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-");
};
async function fetchSanitySubcategories(env) {
  const projectId = env.VITE_SANITY_PROJECT_ID || "q9y7lsh1";
  const dataset = env.VITE_SANITY_DATASET || "production";
  const query = '*[_type == "category"] { category, subcategory }';
  const url = `https://${projectId}.api.sanity.io/v2023-08-01/data/query/${dataset}?query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const subcats = /* @__PURE__ */ new Set();
    if (json.result) {
      json.result.forEach((cat) => {
        if (cat.category) {
          subcats.add(getSubcategorySlug(cat.category));
        }
        if (Array.isArray(cat.subcategory)) {
          cat.subcategory.forEach((sub) => {
            if (sub) {
              subcats.add(getSubcategorySlug(sub));
            }
          });
        }
      });
    }
    const list = Array.from(subcats).filter(Boolean);
    if (list.length > 0) {
      return list;
    }
  } catch (error) {
  }
  return [
    "breast-cancer",
    "ovarian-cancer",
    "lung-cancer",
    "prostate-cancer",
    "colorectal-cancer",
    "pancreatic-cancer",
    "aml",
    "cml",
    "lymphoma",
    "sickle-cell",
    "respiratory",
    "uti",
    "skin-infections",
    "bone-infections",
    "endometriosis",
    "fibrocystic",
    "multiple-myeloma",
    "osteoporosis",
    "arrhythmia",
    "hypertension",
    "glioblastoma",
    "allergic-rhinitis",
    "kidney-disease",
    "pain",
    "rheumatology",
    "chronic-lymphocytic-leukemia"
  ];
}
var vite_config_default = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  try {
    execSync("node scripts/update-vercel-headers.cjs", { stdio: "inherit" });
  } catch (err) {
    console.error("[CORS Script] Warning: Failed to run update-vercel-headers.cjs:", err.message);
  }
  const subcategories = await fetchSanitySubcategories(env);
  process.env.VITE_SANITY_PROJECT_ID = env.VITE_SANITY_PROJECT_ID || "s7ocz8zp";
  process.env.VITE_SANITY_DATASET = env.VITE_SANITY_DATASET || "production";
  process.env.VITE_SANITY_API_VERSION = env.VITE_SANITY_API_VERSION || "2024-01-01";
  process.env.SANITY_WRITE_TOKEN = env.SANITY_WRITE_TOKEN || "";
  const deploymentMode = env.VITE_DEPLOYMENT || env.DEPLOYMENT || "development";
  const isProduction = deploymentMode === "production";
  const chatbotUrl = isProduction ? env.VITE_CHATBOT_API_URL && !env.VITE_CHATBOT_API_URL.includes("localhost") ? env.VITE_CHATBOT_API_URL : "/api/chatbot/ask" : env.VITE_CHATBOT_API_URL || "http://localhost:8000/api/chatbot/ask";
  const spreadsheetUrl = isProduction ? env.VITE_SPREADSHEET_API_URL && !env.VITE_SPREADSHEET_API_URL.includes("localhost") ? env.VITE_SPREADSHEET_API_URL : "/api/append-to-spreadsheet" : env.VITE_SPREADSHEET_API_URL || "http://localhost:3333/api/append-to-spreadsheet";
  const sanityProjectId = env.VITE_SANITY_PROJECT_ID || "s7ocz8zp";
  const sanityDataset = env.VITE_SANITY_DATASET || "production";
  const sanityApiVersion = env.VITE_SANITY_API_VERSION || "2024-01-01";
  const wordpressApiBase = env.VITE_WORDPRESS_API_BASE || "/wp-json/wp/v2";
  const wordpressApiRoot = env.VITE_WORDPRESS_API_ROOT || "https://cms.getmeds.ph";
  return {
    define: {
      "import.meta.env.VITE_DEPLOYMENT": JSON.stringify(deploymentMode),
      "import.meta.env.VITE_SPREADSHEET_API_URL": JSON.stringify(spreadsheetUrl),
      "import.meta.env.VITE_SANITY_PROJECT_ID": JSON.stringify(sanityProjectId),
      "import.meta.env.VITE_SANITY_DATASET": JSON.stringify(sanityDataset),
      "import.meta.env.VITE_SANITY_API_VERSION": JSON.stringify(sanityApiVersion),
      "import.meta.env.VITE_WORDPRESS_API_BASE": JSON.stringify(wordpressApiBase),
      "import.meta.env.VITE_WORDPRESS_API_ROOT": JSON.stringify(wordpressApiRoot)
    },
    server: {
      cors: {
        origin: (origin, callback) => {
          const allowedString = env.VITE_ALLOWED_CORS_ORIGIN || env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN || "*";
          const allowedOrigins = allowedString.split(",").map((o) => o.trim()).filter(Boolean);
          if (!origin || allowedOrigins.includes("*")) {
            callback(null, true);
            return;
          }
          const isAllowed = allowedOrigins.some((allowed) => {
            if (origin === allowed) return true;
            try {
              const allowedUrl = allowed.startsWith("http") ? new URL(allowed) : null;
              const allowedHost = allowedUrl ? allowedUrl.hostname : allowed;
              const originUrl = new URL(origin);
              if (originUrl.hostname === allowedHost) return true;
            } catch (e) {
            }
            return false;
          });
          if (isAllowed) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        credentials: true
      },
      proxy: {
        "/wp-json": {
          target: wordpressApiRoot,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, _req, _res) => {
              proxyReq.removeHeader("origin");
              proxyReq.removeHeader("Origin");
              proxyReq.removeHeader("referer");
              proxyReq.removeHeader("Referer");
              proxyReq.removeHeader("sec-fetch-site");
              proxyReq.removeHeader("sec-fetch-mode");
              proxyReq.removeHeader("sec-fetch-dest");
              proxyReq.removeHeader("x-forwarded-for");
              proxyReq.removeHeader("X-Forwarded-For");
              proxyReq.removeHeader("x-forwarded-host");
              proxyReq.removeHeader("X-Forwarded-Host");
              proxyReq.removeHeader("x-forwarded-proto");
              proxyReq.removeHeader("X-Forwarded-Proto");
              proxyReq.removeHeader("x-forwarded-port");
              proxyReq.removeHeader("X-Forwarded-Port");
              const targetUrl = new URL(wordpressApiRoot);
              proxyReq.setHeader("Host", targetUrl.host);
              proxyReq.setHeader("host", targetUrl.host);
              proxyReq.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            });
          }
        },
        "/wp-content": {
          target: wordpressApiRoot,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on("proxyReq", (proxyReq, _req, _res) => {
              proxyReq.removeHeader("origin");
              proxyReq.removeHeader("Origin");
              proxyReq.removeHeader("referer");
              proxyReq.removeHeader("Referer");
              proxyReq.removeHeader("sec-fetch-site");
              proxyReq.removeHeader("sec-fetch-mode");
              proxyReq.removeHeader("sec-fetch-dest");
              proxyReq.removeHeader("x-forwarded-for");
              proxyReq.removeHeader("X-Forwarded-For");
              proxyReq.removeHeader("x-forwarded-host");
              proxyReq.removeHeader("X-Forwarded-Host");
              proxyReq.removeHeader("x-forwarded-proto");
              proxyReq.removeHeader("X-Forwarded-Proto");
              proxyReq.removeHeader("x-forwarded-port");
              proxyReq.removeHeader("X-Forwarded-Port");
              const targetUrl = new URL(wordpressApiRoot);
              proxyReq.setHeader("Host", targetUrl.host);
              proxyReq.setHeader("host", targetUrl.host);
              proxyReq.setHeader("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
            });
          }
        },
        "/api/careers": {
          target: "https://getmeds-test-creation.vercel.app",
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      rollupOptions: {
        input: getHtmlInputs()
      }
    },
    plugins: [
      sanityImageSyncPlugin(),
      {
        name: "inject-chatbot-meta",
        transformIndexHtml(html) {
          const suppressor = `
  <script>
    (function() {
      var w = console.warn;
      console.warn = function() {
        if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('cdn.tailwindcss.com') !== -1) return;
        w.apply(console, arguments);
      };
    })();
  </script>`;
          return html.replace("<head>", "<head>" + suppressor).replace(
            "</head>",
            `  <meta name="getmeds-chatbot-api" content="${chatbotUrl}" />
  <meta name="getmeds-sanity-project-id" content="${sanityProjectId}" />
  <meta name="getmeds-sanity-dataset" content="${sanityDataset}" />
  <meta name="getmeds-sanity-api-version" content="${sanityApiVersion}" />
</head>`
          );
        }
      },
      {
        name: "pap-tsx-rewrite",
        configureServer(server) {
          if (process.env.NODE_ENV !== "production") {
            server.middlewares.use((req, res, next) => {
              const urlPath = (req.url || "").split("?")[0];
              const cleanPath = urlPath.startsWith("/") ? urlPath : "/" + urlPath;
              const qs = (req.url || "").includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
              if (cleanPath === "/index.html") {
                const htmlPath = path2.join(process.cwd(), "home-preview.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/pap.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/pap" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/pap" || cleanPath === "/pap/") {
                const htmlPath = path2.join(process.cwd(), "pap-preview.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/ungc.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/ungc" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/ungc" || cleanPath === "/ungc/") {
                const htmlPath = path2.join(process.cwd(), "ungc.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/careers.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/careers" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/careers" || cleanPath === "/careers/") {
                const htmlPath = path2.join(process.cwd(), "careers.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/csr.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/csr" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/csr" || cleanPath === "/csr/") {
                const htmlPath = path2.join(process.cwd(), "csr.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/global-presence.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/global-presence" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/global-presence" || cleanPath === "/global-presence/") {
                const htmlPath = path2.join(process.cwd(), "global-presence.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/services.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/services" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/services" || cleanPath === "/services/") {
                const htmlPath = path2.join(process.cwd(), "services.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/contact-us.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/contact-us" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/contact-us" || cleanPath === "/contact-us/") {
                const htmlPath = path2.join(process.cwd(), "contact-us.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/about-us.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/about-us" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/about-us" || cleanPath === "/about-us/") {
                const htmlPath = path2.join(process.cwd(), "about-us.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/meditations.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/meditations" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/meditations" || cleanPath === "/meditations/") {
                const htmlPath = path2.join(process.cwd(), "meditations.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/product-range.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/product-range" + qs);
                res.end();
                return;
              }
              if (cleanPath.startsWith("/product-range")) {
                const segments = cleanPath.split("/").filter(Boolean);
                if (segments.length === 2) {
                  const slug = segments[1];
                  if (subcategories.includes(slug)) {
                    const htmlPath = path2.join(process.cwd(), "cancer-medicines.html");
                    if (fs2.existsSync(htmlPath)) {
                      res.setHeader("Content-Type", "text/html");
                      res.end(fs2.readFileSync(htmlPath, "utf-8"));
                      return;
                    }
                  } else {
                    const htmlPath = path2.join(process.cwd(), "product-detail.html");
                    if (fs2.existsSync(htmlPath)) {
                      res.setHeader("Content-Type", "text/html");
                      res.end(fs2.readFileSync(htmlPath, "utf-8"));
                      return;
                    }
                  }
                } else {
                  const htmlPath = path2.join(process.cwd(), "cancer-medicines.html");
                  if (fs2.existsSync(htmlPath)) {
                    res.setHeader("Content-Type", "text/html");
                    res.end(fs2.readFileSync(htmlPath, "utf-8"));
                    return;
                  }
                }
              }
              if (cleanPath === "/cancer-medicines.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/cancer-medicines" + qs);
                res.end();
                return;
              }
              if (cleanPath.startsWith("/cancer-medicines")) {
                const segments = cleanPath.split("/").filter(Boolean);
                if (segments.length === 2) {
                  const slug = segments[1];
                  if (subcategories.includes(slug)) {
                    const htmlPath = path2.join(process.cwd(), "cancer-medicines.html");
                    if (fs2.existsSync(htmlPath)) {
                      res.setHeader("Content-Type", "text/html");
                      res.end(fs2.readFileSync(htmlPath, "utf-8"));
                      return;
                    }
                  } else {
                    const htmlPath = path2.join(process.cwd(), "product-detail.html");
                    if (fs2.existsSync(htmlPath)) {
                      res.setHeader("Content-Type", "text/html");
                      res.end(fs2.readFileSync(htmlPath, "utf-8"));
                      return;
                    }
                  }
                } else {
                  const htmlPath = path2.join(process.cwd(), "cancer-medicines.html");
                  if (fs2.existsSync(htmlPath)) {
                    res.setHeader("Content-Type", "text/html");
                    res.end(fs2.readFileSync(htmlPath, "utf-8"));
                    return;
                  }
                }
              }
              if (cleanPath === "/product-detail.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/product-detail" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/product-detail" || cleanPath === "/product-detail/") {
                const htmlPath = path2.join(process.cwd(), "product-detail.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/order-medicines.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/order-medicines" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/order-medicines" || cleanPath === "/order-medicines/") {
                const htmlPath = path2.join(process.cwd(), "order-medicines.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/articles.html" || cleanPath === "/articles" || cleanPath === "/articles/") {
                res.statusCode = 301;
                res.setHeader("Location", "/blog" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/article-detail.html" || cleanPath === "/article-detail" || cleanPath === "/article-detail/") {
                const htmlPath = path2.join(process.cwd(), "blog-detail.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/blog.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/blog" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/blog" || cleanPath === "/blog/") {
                const htmlPath = path2.join(process.cwd(), "blog.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath.startsWith("/blog/") && cleanPath.split("/").filter(Boolean).length >= 2) {
                const htmlPath = path2.join(process.cwd(), "blog-detail.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              if (cleanPath === "/" || cleanPath === "/home" || cleanPath === "/home/") {
                const htmlPath = path2.join(process.cwd(), "home-preview.html");
                if (fs2.existsSync(htmlPath)) {
                  const htmlContent = fs2.readFileSync(htmlPath, "utf-8");
                  res.setHeader("Content-Type", "text/html");
                  res.end(htmlContent);
                  return;
                }
              }
              next();
            });
          }
        }
      }
    ]
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL3BsdWdpbnMvc2FuaXR5SW1hZ2VTeW5jLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcR2V0bWVkc1xcXFxEZXNrdG9wXFxcXGdldG1lZHMtZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEdldG1lZHNcXFxcRGVza3RvcFxcXFxnZXRtZWRzLWZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9HZXRtZWRzL0Rlc2t0b3AvZ2V0bWVkcy1mcm9udGVuZC92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcclxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHsgc2FuaXR5SW1hZ2VTeW5jUGx1Z2luIH0gZnJvbSAnLi9zcmMvcGx1Z2lucy9zYW5pdHlJbWFnZVN5bmMuanMnO1xyXG5cclxuY29uc3QgZ2V0SHRtbElucHV0cyA9ICgpID0+IHtcclxuICBjb25zdCBkaXIgPSBwcm9jZXNzLmN3ZCgpO1xyXG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcclxuICBjb25zdCBodG1sRmlsZXMgPSBmaWxlcy5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuaHRtbCcpKTtcclxuICBjb25zdCBpbnB1dHMgPSB7fTtcclxuICBodG1sRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgIGNvbnN0IG5hbWUgPSBmaWxlLnJlcGxhY2UoL1xcLmh0bWwkLywgJycpO1xyXG4gICAgaW5wdXRzW25hbWVdID0gcGF0aC5yZXNvbHZlKGRpciwgZmlsZSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGlucHV0cztcclxufTtcclxuXHJcbmNvbnN0IGdldFN1YmNhdGVnb3J5U2x1ZyA9IChuYW1lKSA9PiB7XHJcbiAgcmV0dXJuIG5hbWVcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAudHJpbSgpXHJcbiAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJylcclxuICAgIC5yZXBsYWNlKC8tKy9nLCAnLScpO1xyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hTYW5pdHlTdWJjYXRlZ29yaWVzKGVudikge1xyXG4gIGNvbnN0IHByb2plY3RJZCA9IGVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEIHx8ICdxOXk3bHNoMSc7XHJcbiAgY29uc3QgZGF0YXNldCA9IGVudi5WSVRFX1NBTklUWV9EQVRBU0VUIHx8ICdwcm9kdWN0aW9uJztcclxuICBjb25zdCBxdWVyeSA9ICcqW190eXBlID09IFwiY2F0ZWdvcnlcIl0geyBjYXRlZ29yeSwgc3ViY2F0ZWdvcnkgfSc7XHJcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vJHtwcm9qZWN0SWR9LmFwaS5zYW5pdHkuaW8vdjIwMjMtMDgtMDEvZGF0YS9xdWVyeS8ke2RhdGFzZXR9P3F1ZXJ5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXMuc3RhdHVzfWApO1xyXG4gICAgY29uc3QganNvbiA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICBjb25zdCBzdWJjYXRzID0gbmV3IFNldCgpO1xyXG5cclxuICAgIGlmIChqc29uLnJlc3VsdCkge1xyXG4gICAgICBqc29uLnJlc3VsdC5mb3JFYWNoKGNhdCA9PiB7XHJcbiAgICAgICAgaWYgKGNhdC5jYXRlZ29yeSkge1xyXG4gICAgICAgICAgc3ViY2F0cy5hZGQoZ2V0U3ViY2F0ZWdvcnlTbHVnKGNhdC5jYXRlZ29yeSkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShjYXQuc3ViY2F0ZWdvcnkpKSB7XHJcbiAgICAgICAgICBjYXQuc3ViY2F0ZWdvcnkuZm9yRWFjaChzdWIgPT4ge1xyXG4gICAgICAgICAgICBpZiAoc3ViKSB7XHJcbiAgICAgICAgICAgICAgc3ViY2F0cy5hZGQoZ2V0U3ViY2F0ZWdvcnlTbHVnKHN1YikpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxpc3QgPSBBcnJheS5mcm9tKHN1YmNhdHMpLmZpbHRlcihCb29sZWFuKTtcclxuICAgIGlmIChsaXN0Lmxlbmd0aCA+IDApIHtcclxuICAgICAgcmV0dXJuIGxpc3Q7XHJcbiAgICB9XHJcbiAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgIC8vIGZhbGxiYWNrIHNpbGVudGx5IG9yIGxvZyB3YXJuaW5nXHJcbiAgfVxyXG4gIHJldHVybiBbXHJcbiAgICAnYnJlYXN0LWNhbmNlcicsICdvdmFyaWFuLWNhbmNlcicsICdsdW5nLWNhbmNlcicsICdwcm9zdGF0ZS1jYW5jZXInLCAnY29sb3JlY3RhbC1jYW5jZXInLFxyXG4gICAgJ3BhbmNyZWF0aWMtY2FuY2VyJywgJ2FtbCcsICdjbWwnLCAnbHltcGhvbWEnLCAnc2lja2xlLWNlbGwnLCAncmVzcGlyYXRvcnknLCAndXRpJyxcclxuICAgICdza2luLWluZmVjdGlvbnMnLCAnYm9uZS1pbmZlY3Rpb25zJywgJ2VuZG9tZXRyaW9zaXMnLCAnZmlicm9jeXN0aWMnLCAnbXVsdGlwbGUtbXllbG9tYScsXHJcbiAgICAnb3N0ZW9wb3Jvc2lzJywgJ2Fycmh5dGhtaWEnLCAnaHlwZXJ0ZW5zaW9uJywgJ2dsaW9ibGFzdG9tYScsICdhbGxlcmdpYy1yaGluaXRpcycsXHJcbiAgICAna2lkbmV5LWRpc2Vhc2UnLCAncGFpbicsICdyaGV1bWF0b2xvZ3knLCAnY2hyb25pYy1seW1waG9jeXRpYy1sZXVrZW1pYSdcclxuICBdO1xyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoYXN5bmMgKHsgbW9kZSB9KSA9PiB7XHJcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XHJcblxyXG4gIC8vIFVwZGF0ZSB2ZXJjZWwuanNvbiBoZWFkZXJzICYgc3ViY2F0ZWdvcmllcyBkeW5hbWljYWxseSBhdCBzdGFydFxyXG4gIHRyeSB7XHJcbiAgICBleGVjU3luYygnbm9kZSBzY3JpcHRzL3VwZGF0ZS12ZXJjZWwtaGVhZGVycy5janMnLCB7IHN0ZGlvOiAnaW5oZXJpdCcgfSk7XHJcbiAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKCdbQ09SUyBTY3JpcHRdIFdhcm5pbmc6IEZhaWxlZCB0byBydW4gdXBkYXRlLXZlcmNlbC1oZWFkZXJzLmNqczonLCBlcnIubWVzc2FnZSk7XHJcbiAgfVxyXG5cclxuICBjb25zdCBzdWJjYXRlZ29yaWVzID0gYXdhaXQgZmV0Y2hTYW5pdHlTdWJjYXRlZ29yaWVzKGVudik7XHJcblxyXG4gIC8vIEV4cG9zZSBTYW5pdHkgZW52IHZhcnMgdG8gTm9kZSBwbHVnaW4gY29udGV4dCAocGx1Z2lucyBydW4gYmVmb3JlIFZpdGUgc2V0cyBwcm9jZXNzLmVudilcclxuICBwcm9jZXNzLmVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEICA9IGVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEICB8fCAnczdvY3o4enAnXHJcbiAgcHJvY2Vzcy5lbnYuVklURV9TQU5JVFlfREFUQVNFVCAgICAgPSBlbnYuVklURV9TQU5JVFlfREFUQVNFVCAgICAgfHwgJ3Byb2R1Y3Rpb24nXHJcbiAgcHJvY2Vzcy5lbnYuVklURV9TQU5JVFlfQVBJX1ZFUlNJT04gPSBlbnYuVklURV9TQU5JVFlfQVBJX1ZFUlNJT04gfHwgJzIwMjQtMDEtMDEnXHJcbiAgcHJvY2Vzcy5lbnYuU0FOSVRZX1dSSVRFX1RPS0VOICAgICAgPSBlbnYuU0FOSVRZX1dSSVRFX1RPS0VOIHx8ICcnXHJcblxyXG4gIGNvbnN0IGRlcGxveW1lbnRNb2RlID0gZW52LlZJVEVfREVQTE9ZTUVOVCB8fCBlbnYuREVQTE9ZTUVOVCB8fCAnZGV2ZWxvcG1lbnQnO1xyXG4gIGNvbnN0IGlzUHJvZHVjdGlvbiA9IGRlcGxveW1lbnRNb2RlID09PSAncHJvZHVjdGlvbic7XHJcblxyXG4gIGNvbnN0IGNoYXRib3RVcmwgPSBpc1Byb2R1Y3Rpb25cclxuICAgID8gKGVudi5WSVRFX0NIQVRCT1RfQVBJX1VSTCAmJiAhZW52LlZJVEVfQ0hBVEJPVF9BUElfVVJMLmluY2x1ZGVzKCdsb2NhbGhvc3QnKSA/IGVudi5WSVRFX0NIQVRCT1RfQVBJX1VSTCA6ICcvYXBpL2NoYXRib3QvYXNrJylcclxuICAgIDogKGVudi5WSVRFX0NIQVRCT1RfQVBJX1VSTCB8fCAnaHR0cDovL2xvY2FsaG9zdDo4MDAwL2FwaS9jaGF0Ym90L2FzaycpO1xyXG5cclxuICBjb25zdCBzcHJlYWRzaGVldFVybCA9IGlzUHJvZHVjdGlvblxyXG4gICAgPyAoZW52LlZJVEVfU1BSRUFEU0hFRVRfQVBJX1VSTCAmJiAhZW52LlZJVEVfU1BSRUFEU0hFRVRfQVBJX1VSTC5pbmNsdWRlcygnbG9jYWxob3N0JykgPyBlbnYuVklURV9TUFJFQURTSEVFVF9BUElfVVJMIDogJy9hcGkvYXBwZW5kLXRvLXNwcmVhZHNoZWV0JylcclxuICAgIDogKGVudi5WSVRFX1NQUkVBRFNIRUVUX0FQSV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzMzMy9hcGkvYXBwZW5kLXRvLXNwcmVhZHNoZWV0Jyk7XHJcblxyXG4gIGNvbnN0IHNhbml0eVByb2plY3RJZCA9IGVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEIHx8ICdzN29jejh6cCc7XHJcbiAgY29uc3Qgc2FuaXR5RGF0YXNldCA9IGVudi5WSVRFX1NBTklUWV9EQVRBU0VUIHx8ICdwcm9kdWN0aW9uJztcclxuICBjb25zdCBzYW5pdHlBcGlWZXJzaW9uID0gZW52LlZJVEVfU0FOSVRZX0FQSV9WRVJTSU9OIHx8ICcyMDI0LTAxLTAxJztcclxuICBjb25zdCB3b3JkcHJlc3NBcGlCYXNlID0gZW52LlZJVEVfV09SRFBSRVNTX0FQSV9CQVNFIHx8ICcvd3AtanNvbi93cC92Mic7XHJcbiAgY29uc3Qgd29yZHByZXNzQXBpUm9vdCA9IGVudi5WSVRFX1dPUkRQUkVTU19BUElfUk9PVCB8fCAnaHR0cHM6Ly9jbXMuZ2V0bWVkcy5waCc7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBkZWZpbmU6IHtcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX0RFUExPWU1FTlQnOiBKU09OLnN0cmluZ2lmeShkZXBsb3ltZW50TW9kZSksXHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9TUFJFQURTSEVFVF9BUElfVVJMJzogSlNPTi5zdHJpbmdpZnkoc3ByZWFkc2hlZXRVcmwpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfU0FOSVRZX1BST0pFQ1RfSUQnOiBKU09OLnN0cmluZ2lmeShzYW5pdHlQcm9qZWN0SWQpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfU0FOSVRZX0RBVEFTRVQnOiBKU09OLnN0cmluZ2lmeShzYW5pdHlEYXRhc2V0KSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1NBTklUWV9BUElfVkVSU0lPTic6IEpTT04uc3RyaW5naWZ5KHNhbml0eUFwaVZlcnNpb24pLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfV09SRFBSRVNTX0FQSV9CQVNFJzogSlNPTi5zdHJpbmdpZnkod29yZHByZXNzQXBpQmFzZSksXHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9XT1JEUFJFU1NfQVBJX1JPT1QnOiBKU09OLnN0cmluZ2lmeSh3b3JkcHJlc3NBcGlSb290KVxyXG4gICAgfSxcclxuICAgIHNlcnZlcjoge1xyXG4gICAgICBjb3JzOiB7XHJcbiAgICAgICAgb3JpZ2luOiAob3JpZ2luLCBjYWxsYmFjaykgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYWxsb3dlZFN0cmluZyA9IGVudi5WSVRFX0FMTE9XRURfQ09SU19PUklHSU4gfHwgZW52LlZJVEVfQ09SU19BTExPV0VEX09SSUdJTiB8fCBlbnYuQ09SU19BTExPV0VEX09SSUdJTiB8fCAnKic7XHJcbiAgICAgICAgICBjb25zdCBhbGxvd2VkT3JpZ2lucyA9IGFsbG93ZWRTdHJpbmcuc3BsaXQoJywnKS5tYXAobyA9PiBvLnRyaW0oKSkuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBpZiAoIW9yaWdpbiB8fCBhbGxvd2VkT3JpZ2lucy5pbmNsdWRlcygnKicpKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRydWUpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBcclxuICAgICAgICAgIGNvbnN0IGlzQWxsb3dlZCA9IGFsbG93ZWRPcmlnaW5zLnNvbWUoYWxsb3dlZCA9PiB7XHJcbiAgICAgICAgICAgIGlmIChvcmlnaW4gPT09IGFsbG93ZWQpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGFsbG93ZWRVcmwgPSBhbGxvd2VkLnN0YXJ0c1dpdGgoJ2h0dHAnKSA/IG5ldyBVUkwoYWxsb3dlZCkgOiBudWxsO1xyXG4gICAgICAgICAgICAgIGNvbnN0IGFsbG93ZWRIb3N0ID0gYWxsb3dlZFVybCA/IGFsbG93ZWRVcmwuaG9zdG5hbWUgOiBhbGxvd2VkO1xyXG4gICAgICAgICAgICAgIGNvbnN0IG9yaWdpblVybCA9IG5ldyBVUkwob3JpZ2luKTtcclxuICAgICAgICAgICAgICBpZiAob3JpZ2luVXJsLmhvc3RuYW1lID09PSBhbGxvd2VkSG9zdCkgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAvLyBpZ25vcmVcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBpZiAoaXNBbGxvd2VkKSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRydWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgY2FsbGJhY2sobmV3IEVycm9yKCdOb3QgYWxsb3dlZCBieSBDT1JTJykpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcclxuICAgICAgICBjcmVkZW50aWFsczogdHJ1ZVxyXG4gICAgICB9LFxyXG4gICAgICBwcm94eToge1xyXG4gICAgICAgICcvd3AtanNvbic6IHtcclxuICAgICAgICAgIHRhcmdldDogd29yZHByZXNzQXBpUm9vdCxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgICBjb25maWd1cmU6IChwcm94eSwgX29wdGlvbnMpID0+IHtcclxuICAgICAgICAgICAgcHJveHkub24oJ3Byb3h5UmVxJywgKHByb3h5UmVxLCBfcmVxLCBfcmVzKSA9PiB7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdvcmlnaW4nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ09yaWdpbicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcigncmVmZXJlcicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignUmVmZXJlcicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignc2VjLWZldGNoLXNpdGUnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3NlYy1mZXRjaC1tb2RlJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdzZWMtZmV0Y2gtZGVzdCcpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcigneC1mb3J3YXJkZWQtZm9yJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdYLUZvcndhcmRlZC1Gb3InKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLWhvc3QnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1gtRm9yd2FyZGVkLUhvc3QnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLXByb3RvJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdYLUZvcndhcmRlZC1Qcm90bycpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcigneC1mb3J3YXJkZWQtcG9ydCcpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtUG9ydCcpO1xyXG4gICAgICAgICAgICAgIGNvbnN0IHRhcmdldFVybCA9IG5ldyBVUkwod29yZHByZXNzQXBpUm9vdCk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdIb3N0JywgdGFyZ2V0VXJsLmhvc3QpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignaG9zdCcsIHRhcmdldFVybC5ob3N0KTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ1VzZXItQWdlbnQnLCAnTW96aWxsYS81LjAgKFdpbmRvd3MgTlQgMTAuMDsgV2luNjQ7IHg2NCknKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICAnL3dwLWNvbnRlbnQnOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IHdvcmRwcmVzc0FwaVJvb3QsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgX3JlcSwgX3JlcykgPT4ge1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignb3JpZ2luJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdPcmlnaW4nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3JlZmVyZXInKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1JlZmVyZXInKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3NlYy1mZXRjaC1zaXRlJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdzZWMtZmV0Y2gtbW9kZScpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignc2VjLWZldGNoLWRlc3QnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLWZvcicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtRm9yJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1ob3N0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdYLUZvcndhcmRlZC1Ib3N0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1wcm90bycpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtUHJvdG8nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLXBvcnQnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1gtRm9yd2FyZGVkLVBvcnQnKTtcclxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRVcmwgPSBuZXcgVVJMKHdvcmRwcmVzc0FwaVJvb3QpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignSG9zdCcsIHRhcmdldFVybC5ob3N0KTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ2hvc3QnLCB0YXJnZXRVcmwuaG9zdCk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdVc2VyLUFnZW50JywgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJy9hcGkvY2FyZWVycyc6IHtcclxuICAgICAgICAgIHRhcmdldDogJ2h0dHBzOi8vZ2V0bWVkcy10ZXN0LWNyZWF0aW9uLnZlcmNlbC5hcHAnLFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBidWlsZDoge1xyXG4gICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgaW5wdXQ6IGdldEh0bWxJbnB1dHMoKVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgcGx1Z2luczogW1xyXG4gICAgICBzYW5pdHlJbWFnZVN5bmNQbHVnaW4oKSxcclxuICAgICAge1xyXG5cclxuICAgICAgICBuYW1lOiAnaW5qZWN0LWNoYXRib3QtbWV0YScsXHJcbiAgICAgICAgdHJhbnNmb3JtSW5kZXhIdG1sKGh0bWwpIHtcclxuICAgICAgICAgIGNvbnN0IHN1cHByZXNzb3IgPSBgXFxuICA8c2NyaXB0PlxyXG4gICAgKGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgdyA9IGNvbnNvbGUud2FybjtcclxuICAgICAgY29uc29sZS53YXJuID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKGFyZ3VtZW50c1swXSAmJiB0eXBlb2YgYXJndW1lbnRzWzBdID09PSAnc3RyaW5nJyAmJiBhcmd1bWVudHNbMF0uaW5kZXhPZignY2RuLnRhaWx3aW5kY3NzLmNvbScpICE9PSAtMSkgcmV0dXJuO1xyXG4gICAgICAgIHcuYXBwbHkoY29uc29sZSwgYXJndW1lbnRzKTtcclxuICAgICAgfTtcclxuICAgIH0pKCk7XHJcbiAgPC9zY3JpcHQ+YDtcclxuICAgICAgICAgIHJldHVybiBodG1sXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKCc8aGVhZD4nLCAnPGhlYWQ+JyArIHN1cHByZXNzb3IpXHJcbiAgICAgICAgICAgIC5yZXBsYWNlKFxyXG4gICAgICAgICAgICAgICc8L2hlYWQ+JyxcclxuICAgICAgICAgICAgICBgICA8bWV0YSBuYW1lPVwiZ2V0bWVkcy1jaGF0Ym90LWFwaVwiIGNvbnRlbnQ9XCIke2NoYXRib3RVcmx9XCIgLz5cclxuICA8bWV0YSBuYW1lPVwiZ2V0bWVkcy1zYW5pdHktcHJvamVjdC1pZFwiIGNvbnRlbnQ9XCIke3Nhbml0eVByb2plY3RJZH1cIiAvPlxyXG4gIDxtZXRhIG5hbWU9XCJnZXRtZWRzLXNhbml0eS1kYXRhc2V0XCIgY29udGVudD1cIiR7c2FuaXR5RGF0YXNldH1cIiAvPlxyXG4gIDxtZXRhIG5hbWU9XCJnZXRtZWRzLXNhbml0eS1hcGktdmVyc2lvblwiIGNvbnRlbnQ9XCIke3Nhbml0eUFwaVZlcnNpb259XCIgLz5cXG48L2hlYWQ+YFxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIHtcclxuICAgICAgbmFtZTogJ3BhcC10c3gtcmV3cml0ZScsXHJcbiAgICAgIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcclxuICAgICAgICBpZiAocHJvY2Vzcy5lbnYuTk9ERV9FTlYgIT09ICdwcm9kdWN0aW9uJykge1xyXG4gICAgICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgdXJsUGF0aCA9IChyZXEudXJsIHx8ICcnKS5zcGxpdCgnPycpWzBdO1xyXG4gICAgICAgICAgICBjb25zdCBjbGVhblBhdGggPSB1cmxQYXRoLnN0YXJ0c1dpdGgoJy8nKSA/IHVybFBhdGggOiAnLycgKyB1cmxQYXRoO1xyXG4gICAgICAgICAgICBjb25zdCBxcyA9IChyZXEudXJsIHx8ICcnKS5pbmNsdWRlcygnPycpID8gcmVxLnVybC5zbGljZShyZXEudXJsLmluZGV4T2YoJz8nKSkgOiAnJztcclxuICAgICAgICAgICAgXHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvaW5kZXguaHRtbCcpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnaG9tZS1wcmV2aWV3Lmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL3BhcC5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9wYXAnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9wYXAnIHx8IGNsZWFuUGF0aCA9PT0gJy9wYXAvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwYXAtcHJldmlldy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy91bmdjLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL3VuZ2MnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy91bmdjJyB8fCBjbGVhblBhdGggPT09ICcvdW5nYy8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3VuZ2MuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FyZWVycy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9jYXJlZXJzJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FyZWVycycgfHwgY2xlYW5QYXRoID09PSAnL2NhcmVlcnMvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjYXJlZXJzLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2Nzci5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9jc3InICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jc3InIHx8IGNsZWFuUGF0aCA9PT0gJy9jc3IvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjc3IuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvZ2xvYmFsLXByZXNlbmNlLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2dsb2JhbC1wcmVzZW5jZScgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2dsb2JhbC1wcmVzZW5jZScgfHwgY2xlYW5QYXRoID09PSAnL2dsb2JhbC1wcmVzZW5jZS8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2dsb2JhbC1wcmVzZW5jZS5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9zZXJ2aWNlcy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9zZXJ2aWNlcycgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL3NlcnZpY2VzJyB8fCBjbGVhblBhdGggPT09ICcvc2VydmljZXMvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzZXJ2aWNlcy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jb250YWN0LXVzLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2NvbnRhY3QtdXMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jb250YWN0LXVzJyB8fCBjbGVhblBhdGggPT09ICcvY29udGFjdC11cy8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2NvbnRhY3QtdXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYWJvdXQtdXMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvYWJvdXQtdXMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9hYm91dC11cycgfHwgY2xlYW5QYXRoID09PSAnL2Fib3V0LXVzLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnYWJvdXQtdXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvbWVkaXRhdGlvbnMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvbWVkaXRhdGlvbnMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9tZWRpdGF0aW9ucycgfHwgY2xlYW5QYXRoID09PSAnL21lZGl0YXRpb25zLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbWVkaXRhdGlvbnMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvcHJvZHVjdC1yYW5nZS5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9wcm9kdWN0LXJhbmdlJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGguc3RhcnRzV2l0aCgnL3Byb2R1Y3QtcmFuZ2UnKSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzID0gY2xlYW5QYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNsdWcgPSBzZWdtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIGlmIChzdWJjYXRlZ29yaWVzLmluY2x1ZGVzKHNsdWcpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjYW5jZXItbWVkaWNpbmVzLmh0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncHJvZHVjdC1kZXRhaWwuaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2NhbmNlci1tZWRpY2luZXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2NhbmNlci1tZWRpY2luZXMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvY2FuY2VyLW1lZGljaW5lcycgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoLnN0YXJ0c1dpdGgoJy9jYW5jZXItbWVkaWNpbmVzJykpIHtcclxuICAgICAgICAgICAgICBjb25zdCBzZWdtZW50cyA9IGNsZWFuUGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICAgICAgICBpZiAoc2VnbWVudHMubGVuZ3RoID09PSAyKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBzbHVnID0gc2VnbWVudHNbMV07XHJcbiAgICAgICAgICAgICAgICBpZiAoc3ViY2F0ZWdvcmllcy5pbmNsdWRlcyhzbHVnKSkge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnY2FuY2VyLW1lZGljaW5lcy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04JykpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Byb2R1Y3QtZGV0YWlsLmh0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjYW5jZXItbWVkaWNpbmVzLmh0bWwnKTtcclxuICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9wcm9kdWN0LWRldGFpbC5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9wcm9kdWN0LWRldGFpbCcgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL3Byb2R1Y3QtZGV0YWlsJyB8fCBjbGVhblBhdGggPT09ICcvcHJvZHVjdC1kZXRhaWwvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwcm9kdWN0LWRldGFpbC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9vcmRlci1tZWRpY2luZXMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvb3JkZXItbWVkaWNpbmVzJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvb3JkZXItbWVkaWNpbmVzJyB8fCBjbGVhblBhdGggPT09ICcvb3JkZXItbWVkaWNpbmVzLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnb3JkZXItbWVkaWNpbmVzLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2FydGljbGVzLmh0bWwnIHx8IGNsZWFuUGF0aCA9PT0gJy9hcnRpY2xlcycgfHwgY2xlYW5QYXRoID09PSAnL2FydGljbGVzLycpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMTtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvYmxvZycgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2FydGljbGUtZGV0YWlsLmh0bWwnIHx8IGNsZWFuUGF0aCA9PT0gJy9hcnRpY2xlLWRldGFpbCcgfHwgY2xlYW5QYXRoID09PSAnL2FydGljbGUtZGV0YWlsLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnYmxvZy1kZXRhaWwuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYmxvZy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9ibG9nJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYmxvZycgfHwgY2xlYW5QYXRoID09PSAnL2Jsb2cvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdibG9nLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoLnN0YXJ0c1dpdGgoJy9ibG9nLycpICYmIGNsZWFuUGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKS5sZW5ndGggPj0gMikge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdibG9nLWRldGFpbC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy8nIHx8IGNsZWFuUGF0aCA9PT0gJy9ob21lJyB8fCBjbGVhblBhdGggPT09ICcvaG9tZS8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2hvbWUtcHJldmlldy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgbmV4dCgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgXVxyXG59O1xyXG59KTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxHZXRtZWRzXFxcXERlc2t0b3BcXFxcZ2V0bWVkcy1mcm9udGVuZFxcXFxzcmNcXFxccGx1Z2luc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcR2V0bWVkc1xcXFxEZXNrdG9wXFxcXGdldG1lZHMtZnJvbnRlbmRcXFxcc3JjXFxcXHBsdWdpbnNcXFxcc2FuaXR5SW1hZ2VTeW5jLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9HZXRtZWRzL0Rlc2t0b3AvZ2V0bWVkcy1mcm9udGVuZC9zcmMvcGx1Z2lucy9zYW5pdHlJbWFnZVN5bmMuanNcIjsvKipcbiAqIHNhbml0eUltYWdlU3luYy5qc1xuICogXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG4gKiBWaXRlIHBsdWdpbiB0aGF0IGF1dG9tYXRpY2FsbHkgc3luY3MgaW1hZ2Ugc2xvdCBuYW1lcyBmcm9tXG4gKiB5b3VyIGZyb250ZW5kIHNvdXJjZSBjb2RlIGludG8gU2FuaXR5IGFzIHBhZ2VBc3NldCBkb2N1bWVudHMuXG4gKlxuICogSG93IGl0IHdvcmtzOlxuICogIDEuIE9uIGV2ZXJ5IGB2aXRlIGRldmAgc3RhcnQgb3IgYHZpdGUgYnVpbGRgLCBpdCBzY2FucyBhbGxcbiAqICAgICAudHN4IGZpbGVzIGluIHNyYy9wYWdlcy8gZm9yIGdldEltYWdlKCkgYW5kIGdldFNsaWRlckltYWdlcygpIGNhbGxzLlxuICogIDIuIEV4dHJhY3RzIHRoZSBmaXJzdCBhcmd1bWVudCAodGhlIHNsb3QgbmFtZSkgZnJvbSBlYWNoIGNhbGwuXG4gKiAgMy4gUXVlcmllcyBTYW5pdHkgZm9yIGFsbCBleGlzdGluZyBwYWdlQXNzZXQgZG9jdW1lbnQgbmFtZXMuXG4gKiAgNC4gRm9yIGFueSBzbG90IG5hbWUgZm91bmQgaW4gY29kZSB0aGF0IGRvZXMgTk9UIGV4aXN0IGluIFNhbml0eSxcbiAqICAgICBpdCBjcmVhdGVzIGFuIGVtcHR5IHBhZ2VBc3NldCBkb2N1bWVudCAobmFtZSBvbmx5LCBubyBpbWFnZSB5ZXQpLlxuICogIDUuIENvbnRlbnQgbWFuYWdlcnMgdGhlbiBzZWUgdGhlIG5ldyBzbG90IGluIFN0dWRpbyBhbmQganVzdCB1cGxvYWQuXG4gKlxuICogUmVxdWlyZW1lbnRzOlxuICogIEFkZCB0byB5b3VyIC5lbnY6XG4gKiAgICBTQU5JVFlfV1JJVEVfVE9LRU49c2suLi4gIChFZGl0b3Igb3IgaGlnaGVyIHRva2VuIGZyb20gbWFuYWdlLnNhbml0eS5pbylcbiAqL1xuXG5pbXBvcnQgZnMgZnJvbSAnZnMnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ3VybCdcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzYW5pdHkvY2xpZW50J1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBwYXRoLmRpcm5hbWUoZmlsZVVSTFRvUGF0aChpbXBvcnQubWV0YS51cmwpKVxuXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcbi8vIFJlZ2V4IHBhdHRlcm5zIHRoYXQgbWF0Y2ggeW91ciBnZXRJbWFnZSAvIGdldFNsaWRlckltYWdlcyBjYWxsc1xuLy8gQ2FwdHVyZXMgdGhlIHNsb3QgbmFtZSAoZmlyc3Qgc3RyaW5nIGFyZ3VtZW50KVxuLy8gXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXG5jb25zdCBJTUFHRV9DQUxMX1BBVFRFUk4gPSAvZ2V0SW1hZ2VcXChcXHMqWydcIl0oW14nXCJdKylbJ1wiXS9nXG5jb25zdCBTTElERVJfQ0FMTF9QQVRURVJOID0gL2dldFNsaWRlckltYWdlc1xcKFxccypbJ1wiXShbXidcIl0rKVsnXCJdL2dcblxuLyoqXG4gKiBTY2FuIGEgc2luZ2xlIC50c3ggZmlsZSBhbmQgcmV0dXJuIGFsbCBzbG90IG5hbWVzIGZvdW5kLlxuICovXG5mdW5jdGlvbiBleHRyYWN0U2xvdE5hbWVzRnJvbUZpbGUoZmlsZVBhdGgpIHtcbiAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JylcbiAgY29uc3QgbmFtZXMgPSBuZXcgU2V0KClcblxuICBmb3IgKGNvbnN0IG1hdGNoIG9mIGNvbnRlbnQubWF0Y2hBbGwoSU1BR0VfQ0FMTF9QQVRURVJOKSkge1xuICAgIG5hbWVzLmFkZChtYXRjaFsxXSlcbiAgfVxuICBmb3IgKGNvbnN0IG1hdGNoIG9mIGNvbnRlbnQubWF0Y2hBbGwoU0xJREVSX0NBTExfUEFUVEVSTikpIHtcbiAgICBuYW1lcy5hZGQobWF0Y2hbMV0pXG4gIH1cblxuICByZXR1cm4gbmFtZXNcbn1cblxuLyoqXG4gKiBTY2FuIGFsbCAudHN4IGZpbGVzIGluIHNyYy9wYWdlcy8gYW5kIG1hcCBzbG90IG5hbWUgdG8gcGFnZSBzbHVnLlxuICovXG5mdW5jdGlvbiBzY2FuQWxsUGFnZVNsb3RzKHBhZ2VzRGlyKSB7XG4gIGNvbnN0IG5hbWVUb1BhZ2VNYXAgPSBuZXcgTWFwKClcblxuICBpZiAoIWZzLmV4aXN0c1N5bmMocGFnZXNEaXIpKSB7XG4gICAgY29uc29sZS53YXJuKGBbSW1hZ2VTeW5jXSBQYWdlcyBkaXJlY3Rvcnkgbm90IGZvdW5kOiAke3BhZ2VzRGlyfWApXG4gICAgcmV0dXJuIG5hbWVUb1BhZ2VNYXBcbiAgfVxuXG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMocGFnZXNEaXIpLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy50c3gnKSlcblxuICBmb3IgKGNvbnN0IGZpbGUgb2YgZmlsZXMpIHtcbiAgICBjb25zdCBwYWdlU2x1ZyA9IGZpbGUucmVwbGFjZSgvXFwudHN4JC8sICcnKVxuICAgIGNvbnN0IGZpbGVQYXRoID0gcGF0aC5qb2luKHBhZ2VzRGlyLCBmaWxlKVxuICAgIGNvbnN0IG5hbWVzID0gZXh0cmFjdFNsb3ROYW1lc0Zyb21GaWxlKGZpbGVQYXRoKVxuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xuICAgICAgbmFtZVRvUGFnZU1hcC5zZXQobmFtZSwgcGFnZVNsdWcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5hbWVUb1BhZ2VNYXBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNhbml0eUltYWdlU3luY1BsdWdpbigpIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnc2FuaXR5LWltYWdlLXN5bmMnLFxuXG4gICAgYXN5bmMgYnVpbGRTdGFydCgpIHtcbiAgICAgIGNvbnN0IHByb2plY3RJZCA9IHByb2Nlc3MuZW52LlZJVEVfU0FOSVRZX1BST0pFQ1RfSUQgfHwgJ3M3b2N6OHpwJ1xuICAgICAgY29uc3QgZGF0YXNldCAgID0gcHJvY2Vzcy5lbnYuVklURV9TQU5JVFlfREFUQVNFVCAgICB8fCAncHJvZHVjdGlvbidcbiAgICAgIGNvbnN0IGFwaVZlcnNpb24gPSBwcm9jZXNzLmVudi5WSVRFX1NBTklUWV9BUElfVkVSU0lPTiB8fCAnMjAyNC0wMS0wMSdcbiAgICAgIGNvbnN0IHdyaXRlVG9rZW4gPSBwcm9jZXNzLmVudi5TQU5JVFlfV1JJVEVfVE9LRU5cblxuICAgICAgaWYgKCF3cml0ZVRva2VuKSB7XG4gICAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgICAnXFxuW0ltYWdlU3luY10gXHUyNkEwXHVGRTBGICBTQU5JVFlfV1JJVEVfVE9LRU4gaXMgbm90IHNldCBpbiAuZW52IFx1MjAxNCBza2lwcGluZyBhdXRvLXN5bmMuXFxuJyArXG4gICAgICAgICAgJyAgICAgICAgICAgQWRkIFNBTklUWV9XUklURV9UT0tFTj1zay4uLiB0byB5b3VyIC5lbnYgZmlsZSB0byBlbmFibGUgaXQuXFxuJ1xuICAgICAgICApXG4gICAgICAgIHJldHVyblxuICAgICAgfVxuXG4gICAgICBjb25zdCBzYW5pdHkgPSBjcmVhdGVDbGllbnQoe1xuICAgICAgICBwcm9qZWN0SWQsXG4gICAgICAgIGRhdGFzZXQsXG4gICAgICAgIGFwaVZlcnNpb24sXG4gICAgICAgIHRva2VuOiB3cml0ZVRva2VuLFxuICAgICAgICB1c2VDZG46IGZhbHNlLFxuICAgICAgfSlcblxuICAgICAgY29uc3QgcGFnZXNEaXIgPSBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vc3JjL3BhZ2VzJylcbiAgICAgIGNvbnN0IG5hbWVUb1BhZ2VNYXAgPSBzY2FuQWxsUGFnZVNsb3RzKHBhZ2VzRGlyKVxuXG4gICAgICBpZiAobmFtZVRvUGFnZU1hcC5zaXplID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdbSW1hZ2VTeW5jXSBObyBnZXRJbWFnZSgpIGNhbGxzIGZvdW5kIGluIHNyYy9wYWdlcy8nKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cblxuICAgICAgLy8gU2tpcCB0aGUgbG9nbyBcdTIwMTQgaXQncyBoYW5kbGVkIHZpYSBzaXRlU2V0dGluZ3NcbiAgICAgIG5hbWVUb1BhZ2VNYXAuZGVsZXRlKCdhc3NldHMvZ2V0bWVkc2xvZ28ucG5nJylcblxuICAgICAgbGV0IGV4aXN0aW5nTmFtZXMgPSBuZXcgU2V0KClcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGV4aXN0aW5nID0gYXdhaXQgc2FuaXR5LmZldGNoKFxuICAgICAgICAgIGAqW190eXBlID09IFwicGFnZUFzc2V0XCJdeyBuYW1lIH1gLFxuICAgICAgICAgIHt9LFxuICAgICAgICAgIHsgY2FjaGU6ICduby1zdG9yZScgfVxuICAgICAgICApXG4gICAgICAgIGV4aXN0aW5nTmFtZXMgPSBuZXcgU2V0KGV4aXN0aW5nLm1hcChkb2MgPT4gZG9jLm5hbWUpKVxuICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tJbWFnZVN5bmNdIEZhaWxlZCB0byBmZXRjaCBleGlzdGluZyBwYWdlQXNzZXQgZG9jczonLCBlcnIubWVzc2FnZSlcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnN0IG1pc3NpbmcgPSBbLi4ubmFtZVRvUGFnZU1hcC5rZXlzKCldLmZpbHRlcihuYW1lID0+ICFleGlzdGluZ05hbWVzLmhhcyhuYW1lKSlcblxuICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGBbSW1hZ2VTeW5jXSBcdTI3MDUgQWxsICR7bmFtZVRvUGFnZU1hcC5zaXplfSBpbWFnZSBzbG90cyBhcmUgYWxyZWFkeSBpbiBTYW5pdHkuYClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKGBcXG5bSW1hZ2VTeW5jXSBGb3VuZCAke21pc3NpbmcubGVuZ3RofSBuZXcgaW1hZ2Ugc2xvdChzKSBub3QgeWV0IGluIFNhbml0eTpgKVxuICAgICAgbWlzc2luZy5mb3JFYWNoKG5hbWUgPT4gY29uc29sZS5sb2coYCAgKyBcIiR7bmFtZX1cIiAoUGFnZTogJHtuYW1lVG9QYWdlTWFwLmdldChuYW1lKX0pYCkpXG5cbiAgICAgIGxldCBjcmVhdGVkID0gMFxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIG1pc3NpbmcpIHtcbiAgICAgICAgY29uc3QgZG9jSWQgPSBgcGFnZS1hc3NldC0ke25hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9bXmEtejAtOV0rL2csICctJyl9YFxuICAgICAgICBjb25zdCBwYWdlU2x1ZyA9IG5hbWVUb1BhZ2VNYXAuZ2V0KG5hbWUpXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgYXdhaXQgc2FuaXR5LmNyZWF0ZUlmTm90RXhpc3RzKHtcbiAgICAgICAgICAgIF90eXBlOiAncGFnZUFzc2V0JyxcbiAgICAgICAgICAgIF9pZDogZG9jSWQsXG4gICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgcGFnZTogcGFnZVNsdWcsXG4gICAgICAgICAgICBpbWFnZXM6IFtdLFxuICAgICAgICAgIH0pXG4gICAgICAgICAgY29uc29sZS5sb2coYFtJbWFnZVN5bmNdICAgXHUyNzEzIENyZWF0ZWQgc2xvdDogXCIke25hbWV9XCIgZm9yIHBhZ2U6ICR7cGFnZVNsdWd9YClcbiAgICAgICAgICBjcmVhdGVkKytcbiAgICAgICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihgW0ltYWdlU3luY10gICBcdTI3MTcgRmFpbGVkIHRvIGNyZWF0ZSBzbG90IFwiJHtuYW1lfVwiOmAsIGVyci5tZXNzYWdlKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBgXFxuW0ltYWdlU3luY10gXHUyNzA1IERvbmUgXHUyMDE0ICR7Y3JlYXRlZH0gbmV3IHNsb3QocykgY3JlYXRlZCBpbiBTYW5pdHkuXFxuYFxuICAgICAgKVxuICAgIH0sXG4gIH1cbn1cbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBdVQsU0FBUyxjQUFjLGVBQWU7QUFDN1YsT0FBT0EsU0FBUTtBQUNmLE9BQU9DLFdBQVU7QUFFakIsU0FBUyxnQkFBZ0I7OztBQ2dCekIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBdkJzTSxJQUFNLDJDQUEyQztBQXlCcFIsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFNN0QsSUFBTSxxQkFBcUI7QUFDM0IsSUFBTSxzQkFBc0I7QUFLNUIsU0FBUyx5QkFBeUIsVUFBVTtBQUMxQyxRQUFNLFVBQVUsR0FBRyxhQUFhLFVBQVUsT0FBTztBQUNqRCxRQUFNLFFBQVEsb0JBQUksSUFBSTtBQUV0QixhQUFXLFNBQVMsUUFBUSxTQUFTLGtCQUFrQixHQUFHO0FBQ3hELFVBQU0sSUFBSSxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ3BCO0FBQ0EsYUFBVyxTQUFTLFFBQVEsU0FBUyxtQkFBbUIsR0FBRztBQUN6RCxVQUFNLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQSxFQUNwQjtBQUVBLFNBQU87QUFDVDtBQUtBLFNBQVMsaUJBQWlCLFVBQVU7QUFDbEMsUUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUU5QixNQUFJLENBQUMsR0FBRyxXQUFXLFFBQVEsR0FBRztBQUM1QixZQUFRLEtBQUssMENBQTBDLFFBQVEsRUFBRTtBQUNqRSxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sUUFBUSxHQUFHLFlBQVksUUFBUSxFQUFFLE9BQU8sT0FBSyxFQUFFLFNBQVMsTUFB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QWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLE9BQU8sY0FBYyxXQUFXLGNBQWMsVUFBVTtBQUN4RSxzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsbUJBQW1CO0FBQzdELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxtQkFBSztBQUFBLFlBQ1AsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsQ0FBQzsiLAogICJuYW1lcyI6IFsiZnMiLCAicGF0aCIsICJmcyIsICJwYXRoIl0KfQo=
