// vite.config.js
import { defineConfig, loadEnv } from "file:///C:/Users/Getmeds/Desktop/Getmeds/node_modules/vite/dist/node/index.js";
import fs2 from "fs";
import path2 from "path";
import { execSync } from "child_process";

// src/plugins/sanityImageSync.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "file:///C:/Users/Getmeds/Desktop/Getmeds/node_modules/@sanity/client/dist/index.js";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Getmeds/Desktop/Getmeds/src/plugins/sanityImageSync.js";
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
var subcategorySpecials = {
  "non-small-cell-lung-cancer": "lung-cancer",
  "acute-myeloid-leukemia": "aml",
  "chronic-myeloid-leukemia": "cml",
  "hodgkin-non-hodgkins-lymphoma": "lymphoma",
  "hodgkin-non-hodgkin-s-lymphoma": "lymphoma",
  "sickle-cell-anemia": "sickle-cell",
  "respiratory-infections": "respiratory",
  "urinary-tract-infections": "uti",
  "skin-and-soft-tissue-infections": "skin-infections",
  "bone-and-joint-infections": "bone-infections",
  "fibrocystic-breast-disease": "fibrocystic",
  "arrhythmia-management": "arrhythmia",
  "hypertension-angina": "hypertension",
  "hypertension-and-angina": "hypertension",
  "seasonal-allergic-rhinitis": "allergic-rhinitis",
  "chronic-kidney-disease": "kidney-disease",
  "chronic-pain": "pain",
  "inflammatory-disorders": "rheumatology",
  "inflammatory-and-rheumatic-disorders": "rheumatology"
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
          const clean = getSubcategorySlug(cat.category);
          subcats.add(clean);
          if (subcategorySpecials[clean]) {
            subcats.add(subcategorySpecials[clean]);
          }
        }
        if (Array.isArray(cat.subcategory)) {
          cat.subcategory.forEach((sub) => {
            if (sub) {
              const clean = getSubcategorySlug(sub);
              subcats.add(clean);
              if (subcategorySpecials[clean]) {
                subcats.add(subcategorySpecials[clean]);
              }
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
    "chronic-lymphocytic-leukemia",
    "acute-lymphoblastic-leukemia",
    "malignant-pleural-mesothelioma",
    "head-and-neck-cancer",
    "chronic-myeloid-leukemia",
    "sickle-cell-anemia",
    "malignant-pleural-effusion",
    "gastrointestinal-stromal-tumors",
    "acute-myeloid-leukemia",
    "acute-lymphocytic-leukemia",
    "chronic-myelocytic-leukemia",
    "meningeal-leukemia",
    "acute-promyelocytic-leukemia",
    "mantle-cell-lymphoma",
    "neuro-oncology",
    "glioblastoma-multiforme",
    "obstetrician",
    "folate-deficiency-anemia",
    "iron-deficiency-anemia",
    "allergy",
    "seasonal-allergic-rhinitis",
    "chronic-pain-management",
    "inflammatory-rheumatic-disorders",
    "endocrinology",
    "fibrocystic-breast-disease",
    "benign-prostatic-hyperplasia",
    "cardiology",
    "arrhythmia-management",
    "hypertension-angina",
    "renal",
    "radiology",
    "radiologic-imaging-enhancement-ct-scans-angiography-urography",
    "hematology",
    "orthopedic",
    "glucocorticoid-induced-osteoporosis",
    "gynecology",
    "anti-infectives",
    "respiratory-infections",
    "urinary-tract-infections",
    "gynecological-infections",
    "intra-abdominal-infections",
    "skin-and-soft-tissue-infections",
    "bone-and-joint-infections",
    "bloodstream-infections",
    "ocular-or-topical-infections",
    "nephrology"
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
              if (cleanPath === "/pap.html" || cleanPath === "/pap" || cleanPath === "/pap/") {
                res.statusCode = 301;
                res.setHeader("Location", "/patient-assistance-program" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/patient-assistance-program.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/patient-assistance-program" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/patient-assistance-program" || cleanPath === "/patient-assistance-program/") {
                const htmlPath = path2.join(process.cwd(), "patient-assistance-program-preview.html");
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
              if (cleanPath === "/employee-verification.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/employee-verification" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/employee-verification" || cleanPath === "/employee-verification/") {
                const htmlPath = path2.join(process.cwd(), "employee-verification.html");
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
              if (cleanPath === "/cancer-medicine.html") {
                res.statusCode = 302;
                res.setHeader("Location", "/product-range" + qs);
                res.end();
                return;
              }
              if (cleanPath === "/cancer-medicine" || cleanPath === "/cancer-medicine/" || cleanPath.startsWith("/cancer-medicine/") && !cleanPath.startsWith("/cancer-medicines")) {
                const segments = cleanPath.split("/").filter(Boolean);
                if (segments[0] === "cancer-medicine" && segments.length === 2) {
                  const htmlPath = path2.join(process.cwd(), "product-detail.html");
                  if (fs2.existsSync(htmlPath)) {
                    res.setHeader("Content-Type", "text/html");
                    res.end(fs2.readFileSync(htmlPath, "utf-8"));
                    return;
                  }
                } else {
                  res.statusCode = 302;
                  res.setHeader("Location", "/product-range" + qs);
                  res.end();
                  return;
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiLCAic3JjL3BsdWdpbnMvc2FuaXR5SW1hZ2VTeW5jLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcR2V0bWVkc1xcXFxEZXNrdG9wXFxcXEdldG1lZHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEdldG1lZHNcXFxcRGVza3RvcFxcXFxHZXRtZWRzXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9HZXRtZWRzL0Rlc2t0b3AvR2V0bWVkcy92aXRlLmNvbmZpZy5qc1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuaW1wb3J0IGh0dHBzIGZyb20gJ2h0dHBzJztcclxuaW1wb3J0IHsgZXhlY1N5bmMgfSBmcm9tICdjaGlsZF9wcm9jZXNzJztcclxuaW1wb3J0IHsgc2FuaXR5SW1hZ2VTeW5jUGx1Z2luIH0gZnJvbSAnLi9zcmMvcGx1Z2lucy9zYW5pdHlJbWFnZVN5bmMuanMnO1xyXG5cclxuY29uc3QgZ2V0SHRtbElucHV0cyA9ICgpID0+IHtcclxuICBjb25zdCBkaXIgPSBwcm9jZXNzLmN3ZCgpO1xyXG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMoZGlyKTtcclxuICBjb25zdCBodG1sRmlsZXMgPSBmaWxlcy5maWx0ZXIoZiA9PiBmLmVuZHNXaXRoKCcuaHRtbCcpKTtcclxuICBjb25zdCBpbnB1dHMgPSB7fTtcclxuICBodG1sRmlsZXMuZm9yRWFjaChmaWxlID0+IHtcclxuICAgIGNvbnN0IG5hbWUgPSBmaWxlLnJlcGxhY2UoL1xcLmh0bWwkLywgJycpO1xyXG4gICAgaW5wdXRzW25hbWVdID0gcGF0aC5yZXNvbHZlKGRpciwgZmlsZSk7XHJcbiAgfSk7XHJcbiAgcmV0dXJuIGlucHV0cztcclxufTtcclxuXHJcbmNvbnN0IHN1YmNhdGVnb3J5U3BlY2lhbHMgPSB7XHJcbiAgJ25vbi1zbWFsbC1jZWxsLWx1bmctY2FuY2VyJzogJ2x1bmctY2FuY2VyJyxcclxuICAnYWN1dGUtbXllbG9pZC1sZXVrZW1pYSc6ICdhbWwnLFxyXG4gICdjaHJvbmljLW15ZWxvaWQtbGV1a2VtaWEnOiAnY21sJyxcclxuICAnaG9kZ2tpbi1ub24taG9kZ2tpbnMtbHltcGhvbWEnOiAnbHltcGhvbWEnLFxyXG4gICdob2Rna2luLW5vbi1ob2Rna2luLXMtbHltcGhvbWEnOiAnbHltcGhvbWEnLFxyXG4gICdzaWNrbGUtY2VsbC1hbmVtaWEnOiAnc2lja2xlLWNlbGwnLFxyXG4gICdyZXNwaXJhdG9yeS1pbmZlY3Rpb25zJzogJ3Jlc3BpcmF0b3J5JyxcclxuICAndXJpbmFyeS10cmFjdC1pbmZlY3Rpb25zJzogJ3V0aScsXHJcbiAgJ3NraW4tYW5kLXNvZnQtdGlzc3VlLWluZmVjdGlvbnMnOiAnc2tpbi1pbmZlY3Rpb25zJyxcclxuICAnYm9uZS1hbmQtam9pbnQtaW5mZWN0aW9ucyc6ICdib25lLWluZmVjdGlvbnMnLFxyXG4gICdmaWJyb2N5c3RpYy1icmVhc3QtZGlzZWFzZSc6ICdmaWJyb2N5c3RpYycsXHJcbiAgJ2Fycmh5dGhtaWEtbWFuYWdlbWVudCc6ICdhcnJoeXRobWlhJyxcclxuICAnaHlwZXJ0ZW5zaW9uLWFuZ2luYSc6ICdoeXBlcnRlbnNpb24nLFxyXG4gICdoeXBlcnRlbnNpb24tYW5kLWFuZ2luYSc6ICdoeXBlcnRlbnNpb24nLFxyXG4gICdzZWFzb25hbC1hbGxlcmdpYy1yaGluaXRpcyc6ICdhbGxlcmdpYy1yaGluaXRpcycsXHJcbiAgJ2Nocm9uaWMta2lkbmV5LWRpc2Vhc2UnOiAna2lkbmV5LWRpc2Vhc2UnLFxyXG4gICdjaHJvbmljLXBhaW4nOiAncGFpbicsXHJcbiAgJ2luZmxhbW1hdG9yeS1kaXNvcmRlcnMnOiAncmhldW1hdG9sb2d5JyxcclxuICAnaW5mbGFtbWF0b3J5LWFuZC1yaGV1bWF0aWMtZGlzb3JkZXJzJzogJ3JoZXVtYXRvbG9neSdcclxufTtcclxuXHJcbmNvbnN0IGdldFN1YmNhdGVnb3J5U2x1ZyA9IChuYW1lKSA9PiB7XHJcbiAgcmV0dXJuIG5hbWVcclxuICAgIC50b0xvd2VyQ2FzZSgpXHJcbiAgICAudHJpbSgpXHJcbiAgICAucmVwbGFjZSgvXFxzKy9nLCAnLScpXHJcbiAgICAucmVwbGFjZSgvW15hLXowLTktXS9nLCAnJylcclxuICAgIC5yZXBsYWNlKC8tKy9nLCAnLScpO1xyXG59O1xyXG5cclxuYXN5bmMgZnVuY3Rpb24gZmV0Y2hTYW5pdHlTdWJjYXRlZ29yaWVzKGVudikge1xyXG4gIGNvbnN0IHByb2plY3RJZCA9IGVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEIHx8ICdxOXk3bHNoMSc7XHJcbiAgY29uc3QgZGF0YXNldCA9IGVudi5WSVRFX1NBTklUWV9EQVRBU0VUIHx8ICdwcm9kdWN0aW9uJztcclxuICBjb25zdCBxdWVyeSA9ICcqW190eXBlID09IFwiY2F0ZWdvcnlcIl0geyBjYXRlZ29yeSwgc3ViY2F0ZWdvcnkgfSc7XHJcbiAgY29uc3QgdXJsID0gYGh0dHBzOi8vJHtwcm9qZWN0SWR9LmFwaS5zYW5pdHkuaW8vdjIwMjMtMDgtMDEvZGF0YS9xdWVyeS8ke2RhdGFzZXR9P3F1ZXJ5PSR7ZW5jb2RlVVJJQ29tcG9uZW50KHF1ZXJ5KX1gO1xyXG5cclxuICB0cnkge1xyXG4gICAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2godXJsKTtcclxuICAgIGlmICghcmVzLm9rKSB0aHJvdyBuZXcgRXJyb3IoYEhUVFAgJHtyZXMuc3RhdHVzfWApO1xyXG4gICAgY29uc3QganNvbiA9IGF3YWl0IHJlcy5qc29uKCk7XHJcbiAgICBjb25zdCBzdWJjYXRzID0gbmV3IFNldCgpO1xyXG5cclxuICAgIGlmIChqc29uLnJlc3VsdCkge1xyXG4gICAgICBqc29uLnJlc3VsdC5mb3JFYWNoKGNhdCA9PiB7XHJcbiAgICAgICAgaWYgKGNhdC5jYXRlZ29yeSkge1xyXG4gICAgICAgICAgY29uc3QgY2xlYW4gPSBnZXRTdWJjYXRlZ29yeVNsdWcoY2F0LmNhdGVnb3J5KTtcclxuICAgICAgICAgIHN1YmNhdHMuYWRkKGNsZWFuKTtcclxuICAgICAgICAgIGlmIChzdWJjYXRlZ29yeVNwZWNpYWxzW2NsZWFuXSkge1xyXG4gICAgICAgICAgICBzdWJjYXRzLmFkZChzdWJjYXRlZ29yeVNwZWNpYWxzW2NsZWFuXSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGNhdC5zdWJjYXRlZ29yeSkpIHtcclxuICAgICAgICAgIGNhdC5zdWJjYXRlZ29yeS5mb3JFYWNoKHN1YiA9PiB7XHJcbiAgICAgICAgICAgIGlmIChzdWIpIHtcclxuICAgICAgICAgICAgICBjb25zdCBjbGVhbiA9IGdldFN1YmNhdGVnb3J5U2x1ZyhzdWIpO1xyXG4gICAgICAgICAgICAgIHN1YmNhdHMuYWRkKGNsZWFuKTtcclxuICAgICAgICAgICAgICBpZiAoc3ViY2F0ZWdvcnlTcGVjaWFsc1tjbGVhbl0pIHtcclxuICAgICAgICAgICAgICAgIHN1YmNhdHMuYWRkKHN1YmNhdGVnb3J5U3BlY2lhbHNbY2xlYW5dKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgbGlzdCA9IEFycmF5LmZyb20oc3ViY2F0cykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgaWYgKGxpc3QubGVuZ3RoID4gMCkge1xyXG4gICAgICByZXR1cm4gbGlzdDtcclxuICAgIH1cclxuICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgLy8gZmFsbGJhY2sgc2lsZW50bHkgb3IgbG9nIHdhcm5pbmdcclxuICB9XHJcbiAgcmV0dXJuIFtcclxuICAgICdicmVhc3QtY2FuY2VyJywgJ292YXJpYW4tY2FuY2VyJywgJ2x1bmctY2FuY2VyJywgJ3Byb3N0YXRlLWNhbmNlcicsICdjb2xvcmVjdGFsLWNhbmNlcicsXHJcbiAgICAncGFuY3JlYXRpYy1jYW5jZXInLCAnYW1sJywgJ2NtbCcsICdseW1waG9tYScsICdzaWNrbGUtY2VsbCcsICdyZXNwaXJhdG9yeScsICd1dGknLFxyXG4gICAgJ3NraW4taW5mZWN0aW9ucycsICdib25lLWluZmVjdGlvbnMnLCAnZW5kb21ldHJpb3NpcycsICdmaWJyb2N5c3RpYycsICdtdWx0aXBsZS1teWVsb21hJyxcclxuICAgICdvc3Rlb3Bvcm9zaXMnLCAnYXJyaHl0aG1pYScsICdoeXBlcnRlbnNpb24nLCAnZ2xpb2JsYXN0b21hJywgJ2FsbGVyZ2ljLXJoaW5pdGlzJyxcclxuICAgICdraWRuZXktZGlzZWFzZScsICdwYWluJywgJ3JoZXVtYXRvbG9neScsICdjaHJvbmljLWx5bXBob2N5dGljLWxldWtlbWlhJyxcclxuICAgICdhY3V0ZS1seW1waG9ibGFzdGljLWxldWtlbWlhJywgJ21hbGlnbmFudC1wbGV1cmFsLW1lc290aGVsaW9tYScsICdoZWFkLWFuZC1uZWNrLWNhbmNlcicsXHJcbiAgICAnY2hyb25pYy1teWVsb2lkLWxldWtlbWlhJywgJ3NpY2tsZS1jZWxsLWFuZW1pYScsICdtYWxpZ25hbnQtcGxldXJhbC1lZmZ1c2lvbicsXHJcbiAgICAnZ2FzdHJvaW50ZXN0aW5hbC1zdHJvbWFsLXR1bW9ycycsICdhY3V0ZS1teWVsb2lkLWxldWtlbWlhJywgJ2FjdXRlLWx5bXBob2N5dGljLWxldWtlbWlhJyxcclxuICAgICdjaHJvbmljLW15ZWxvY3l0aWMtbGV1a2VtaWEnLCAnbWVuaW5nZWFsLWxldWtlbWlhJywgJ2FjdXRlLXByb215ZWxvY3l0aWMtbGV1a2VtaWEnLFxyXG4gICAgJ21hbnRsZS1jZWxsLWx5bXBob21hJywgJ25ldXJvLW9uY29sb2d5JywgJ2dsaW9ibGFzdG9tYS1tdWx0aWZvcm1lJywgJ29ic3RldHJpY2lhbicsXHJcbiAgICAnZm9sYXRlLWRlZmljaWVuY3ktYW5lbWlhJywgJ2lyb24tZGVmaWNpZW5jeS1hbmVtaWEnLCAnYWxsZXJneScsICdzZWFzb25hbC1hbGxlcmdpYy1yaGluaXRpcycsXHJcbiAgICAnY2hyb25pYy1wYWluLW1hbmFnZW1lbnQnLCAnaW5mbGFtbWF0b3J5LXJoZXVtYXRpYy1kaXNvcmRlcnMnLCAnZW5kb2NyaW5vbG9neScsXHJcbiAgICAnZmlicm9jeXN0aWMtYnJlYXN0LWRpc2Vhc2UnLCAnYmVuaWduLXByb3N0YXRpYy1oeXBlcnBsYXNpYScsICdjYXJkaW9sb2d5JywgJ2Fycmh5dGhtaWEtbWFuYWdlbWVudCcsXHJcbiAgICAnaHlwZXJ0ZW5zaW9uLWFuZ2luYScsICdyZW5hbCcsICdyYWRpb2xvZ3knLCAncmFkaW9sb2dpYy1pbWFnaW5nLWVuaGFuY2VtZW50LWN0LXNjYW5zLWFuZ2lvZ3JhcGh5LXVyb2dyYXBoeScsXHJcbiAgICAnaGVtYXRvbG9neScsICdvcnRob3BlZGljJywgJ2dsdWNvY29ydGljb2lkLWluZHVjZWQtb3N0ZW9wb3Jvc2lzJywgJ2d5bmVjb2xvZ3knLCAnYW50aS1pbmZlY3RpdmVzJyxcclxuICAgICdyZXNwaXJhdG9yeS1pbmZlY3Rpb25zJywgJ3VyaW5hcnktdHJhY3QtaW5mZWN0aW9ucycsICdneW5lY29sb2dpY2FsLWluZmVjdGlvbnMnLCAnaW50cmEtYWJkb21pbmFsLWluZmVjdGlvbnMnLFxyXG4gICAgJ3NraW4tYW5kLXNvZnQtdGlzc3VlLWluZmVjdGlvbnMnLCAnYm9uZS1hbmQtam9pbnQtaW5mZWN0aW9ucycsICdibG9vZHN0cmVhbS1pbmZlY3Rpb25zJywgJ29jdWxhci1vci10b3BpY2FsLWluZmVjdGlvbnMnLFxyXG4gICAgJ25lcGhyb2xvZ3knXHJcbiAgXTtcclxufVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKGFzeW5jICh7IG1vZGUgfSkgPT4ge1xyXG4gIGNvbnN0IGVudiA9IGxvYWRFbnYobW9kZSwgcHJvY2Vzcy5jd2QoKSwgJycpO1xyXG5cclxuICAvLyBVcGRhdGUgdmVyY2VsLmpzb24gaGVhZGVycyAmIHN1YmNhdGVnb3JpZXMgZHluYW1pY2FsbHkgYXQgc3RhcnRcclxuICB0cnkge1xyXG4gICAgZXhlY1N5bmMoJ25vZGUgc2NyaXB0cy91cGRhdGUtdmVyY2VsLWhlYWRlcnMuY2pzJywgeyBzdGRpbzogJ2luaGVyaXQnIH0pO1xyXG4gIH0gY2F0Y2ggKGVycikge1xyXG4gICAgY29uc29sZS5lcnJvcignW0NPUlMgU2NyaXB0XSBXYXJuaW5nOiBGYWlsZWQgdG8gcnVuIHVwZGF0ZS12ZXJjZWwtaGVhZGVycy5janM6JywgZXJyLm1lc3NhZ2UpO1xyXG4gIH1cclxuXHJcbiAgY29uc3Qgc3ViY2F0ZWdvcmllcyA9IGF3YWl0IGZldGNoU2FuaXR5U3ViY2F0ZWdvcmllcyhlbnYpO1xyXG5cclxuICAvLyBFeHBvc2UgU2FuaXR5IGVudiB2YXJzIHRvIE5vZGUgcGx1Z2luIGNvbnRleHQgKHBsdWdpbnMgcnVuIGJlZm9yZSBWaXRlIHNldHMgcHJvY2Vzcy5lbnYpXHJcbiAgcHJvY2Vzcy5lbnYuVklURV9TQU5JVFlfUFJPSkVDVF9JRCAgPSBlbnYuVklURV9TQU5JVFlfUFJPSkVDVF9JRCAgfHwgJ3M3b2N6OHpwJ1xyXG4gIHByb2Nlc3MuZW52LlZJVEVfU0FOSVRZX0RBVEFTRVQgICAgID0gZW52LlZJVEVfU0FOSVRZX0RBVEFTRVQgICAgIHx8ICdwcm9kdWN0aW9uJ1xyXG4gIHByb2Nlc3MuZW52LlZJVEVfU0FOSVRZX0FQSV9WRVJTSU9OID0gZW52LlZJVEVfU0FOSVRZX0FQSV9WRVJTSU9OIHx8ICcyMDI0LTAxLTAxJ1xyXG4gIHByb2Nlc3MuZW52LlNBTklUWV9XUklURV9UT0tFTiAgICAgID0gZW52LlNBTklUWV9XUklURV9UT0tFTiB8fCAnJ1xyXG5cclxuICBjb25zdCBkZXBsb3ltZW50TW9kZSA9IGVudi5WSVRFX0RFUExPWU1FTlQgfHwgZW52LkRFUExPWU1FTlQgfHwgJ2RldmVsb3BtZW50JztcclxuICBjb25zdCBpc1Byb2R1Y3Rpb24gPSBkZXBsb3ltZW50TW9kZSA9PT0gJ3Byb2R1Y3Rpb24nO1xyXG5cclxuICBjb25zdCBjaGF0Ym90VXJsID0gaXNQcm9kdWN0aW9uXHJcbiAgICA/IChlbnYuVklURV9DSEFUQk9UX0FQSV9VUkwgJiYgIWVudi5WSVRFX0NIQVRCT1RfQVBJX1VSTC5pbmNsdWRlcygnbG9jYWxob3N0JykgPyBlbnYuVklURV9DSEFUQk9UX0FQSV9VUkwgOiAnL2FwaS9jaGF0Ym90L2FzaycpXHJcbiAgICA6IChlbnYuVklURV9DSEFUQk9UX0FQSV9VUkwgfHwgJ2h0dHA6Ly9sb2NhbGhvc3Q6ODAwMC9hcGkvY2hhdGJvdC9hc2snKTtcclxuXHJcbiAgY29uc3Qgc3ByZWFkc2hlZXRVcmwgPSBpc1Byb2R1Y3Rpb25cclxuICAgID8gKGVudi5WSVRFX1NQUkVBRFNIRUVUX0FQSV9VUkwgJiYgIWVudi5WSVRFX1NQUkVBRFNIRUVUX0FQSV9VUkwuaW5jbHVkZXMoJ2xvY2FsaG9zdCcpID8gZW52LlZJVEVfU1BSRUFEU0hFRVRfQVBJX1VSTCA6ICcvYXBpL2FwcGVuZC10by1zcHJlYWRzaGVldCcpXHJcbiAgICA6IChlbnYuVklURV9TUFJFQURTSEVFVF9BUElfVVJMIHx8ICdodHRwOi8vbG9jYWxob3N0OjMzMzMvYXBpL2FwcGVuZC10by1zcHJlYWRzaGVldCcpO1xyXG5cclxuICBjb25zdCBzYW5pdHlQcm9qZWN0SWQgPSBlbnYuVklURV9TQU5JVFlfUFJPSkVDVF9JRCB8fCAnczdvY3o4enAnO1xyXG4gIGNvbnN0IHNhbml0eURhdGFzZXQgPSBlbnYuVklURV9TQU5JVFlfREFUQVNFVCB8fCAncHJvZHVjdGlvbic7XHJcbiAgY29uc3Qgc2FuaXR5QXBpVmVyc2lvbiA9IGVudi5WSVRFX1NBTklUWV9BUElfVkVSU0lPTiB8fCAnMjAyNC0wMS0wMSc7XHJcbiAgY29uc3Qgd29yZHByZXNzQXBpQmFzZSA9IGVudi5WSVRFX1dPUkRQUkVTU19BUElfQkFTRSB8fCAnL3dwLWpzb24vd3AvdjInO1xyXG4gIGNvbnN0IHdvcmRwcmVzc0FwaVJvb3QgPSBlbnYuVklURV9XT1JEUFJFU1NfQVBJX1JPT1QgfHwgJ2h0dHBzOi8vY21zLmdldG1lZHMucGgnO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZGVmaW5lOiB7XHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9ERVBMT1lNRU5UJzogSlNPTi5zdHJpbmdpZnkoZGVwbG95bWVudE1vZGUpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfU1BSRUFEU0hFRVRfQVBJX1VSTCc6IEpTT04uc3RyaW5naWZ5KHNwcmVhZHNoZWV0VXJsKSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1NBTklUWV9QUk9KRUNUX0lEJzogSlNPTi5zdHJpbmdpZnkoc2FuaXR5UHJvamVjdElkKSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1NBTklUWV9EQVRBU0VUJzogSlNPTi5zdHJpbmdpZnkoc2FuaXR5RGF0YXNldCksXHJcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9TQU5JVFlfQVBJX1ZFUlNJT04nOiBKU09OLnN0cmluZ2lmeShzYW5pdHlBcGlWZXJzaW9uKSxcclxuICAgICAgJ2ltcG9ydC5tZXRhLmVudi5WSVRFX1dPUkRQUkVTU19BUElfQkFTRSc6IEpTT04uc3RyaW5naWZ5KHdvcmRwcmVzc0FwaUJhc2UpLFxyXG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfV09SRFBSRVNTX0FQSV9ST09UJzogSlNPTi5zdHJpbmdpZnkod29yZHByZXNzQXBpUm9vdClcclxuICAgIH0sXHJcbiAgICBzZXJ2ZXI6IHtcclxuICAgICAgY29yczoge1xyXG4gICAgICAgIG9yaWdpbjogKG9yaWdpbiwgY2FsbGJhY2spID0+IHtcclxuICAgICAgICAgIGNvbnN0IGFsbG93ZWRTdHJpbmcgPSBlbnYuVklURV9BTExPV0VEX0NPUlNfT1JJR0lOIHx8IGVudi5WSVRFX0NPUlNfQUxMT1dFRF9PUklHSU4gfHwgZW52LkNPUlNfQUxMT1dFRF9PUklHSU4gfHwgJyonO1xyXG4gICAgICAgICAgY29uc3QgYWxsb3dlZE9yaWdpbnMgPSBhbGxvd2VkU3RyaW5nLnNwbGl0KCcsJykubWFwKG8gPT4gby50cmltKCkpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICAgIFxyXG4gICAgICAgICAgaWYgKCFvcmlnaW4gfHwgYWxsb3dlZE9yaWdpbnMuaW5jbHVkZXMoJyonKSkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCB0cnVlKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgXHJcbiAgICAgICAgICBjb25zdCBpc0FsbG93ZWQgPSBhbGxvd2VkT3JpZ2lucy5zb21lKGFsbG93ZWQgPT4ge1xyXG4gICAgICAgICAgICBpZiAob3JpZ2luID09PSBhbGxvd2VkKSByZXR1cm4gdHJ1ZTtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICBjb25zdCBhbGxvd2VkVXJsID0gYWxsb3dlZC5zdGFydHNXaXRoKCdodHRwJykgPyBuZXcgVVJMKGFsbG93ZWQpIDogbnVsbDtcclxuICAgICAgICAgICAgICBjb25zdCBhbGxvd2VkSG9zdCA9IGFsbG93ZWRVcmwgPyBhbGxvd2VkVXJsLmhvc3RuYW1lIDogYWxsb3dlZDtcclxuICAgICAgICAgICAgICBjb25zdCBvcmlnaW5VcmwgPSBuZXcgVVJMKG9yaWdpbik7XHJcbiAgICAgICAgICAgICAgaWYgKG9yaWdpblVybC5ob3N0bmFtZSA9PT0gYWxsb3dlZEhvc3QpIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgLy8gaWdub3JlXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgaWYgKGlzQWxsb3dlZCkge1xyXG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCB0cnVlKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNhbGxiYWNrKG5ldyBFcnJvcignTm90IGFsbG93ZWQgYnkgQ09SUycpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG1ldGhvZHM6IFsnR0VUJywgJ1BPU1QnLCAnUFVUJywgJ0RFTEVURScsICdPUFRJT05TJ10sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6IHRydWVcclxuICAgICAgfSxcclxuICAgICAgcHJveHk6IHtcclxuICAgICAgICAnL3dwLWpzb24nOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6IHdvcmRwcmVzc0FwaVJvb3QsXHJcbiAgICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgICBzZWN1cmU6IGZhbHNlLFxyXG4gICAgICAgICAgY29uZmlndXJlOiAocHJveHksIF9vcHRpb25zKSA9PiB7XHJcbiAgICAgICAgICAgIHByb3h5Lm9uKCdwcm94eVJlcScsIChwcm94eVJlcSwgX3JlcSwgX3JlcykgPT4ge1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignb3JpZ2luJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdPcmlnaW4nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3JlZmVyZXInKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1JlZmVyZXInKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3NlYy1mZXRjaC1zaXRlJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdzZWMtZmV0Y2gtbW9kZScpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignc2VjLWZldGNoLWRlc3QnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLWZvcicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtRm9yJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1ob3N0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdYLUZvcndhcmRlZC1Ib3N0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1wcm90bycpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtUHJvdG8nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3gtZm9yd2FyZGVkLXBvcnQnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1gtRm9yd2FyZGVkLVBvcnQnKTtcclxuICAgICAgICAgICAgICBjb25zdCB0YXJnZXRVcmwgPSBuZXcgVVJMKHdvcmRwcmVzc0FwaVJvb3QpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignSG9zdCcsIHRhcmdldFVybC5ob3N0KTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ2hvc3QnLCB0YXJnZXRVcmwuaG9zdCk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdVc2VyLUFnZW50JywgJ01vemlsbGEvNS4wIChXaW5kb3dzIE5UIDEwLjA7IFdpbjY0OyB4NjQpJyk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgJy93cC1jb250ZW50Jzoge1xyXG4gICAgICAgICAgdGFyZ2V0OiB3b3JkcHJlc3NBcGlSb290LFxyXG4gICAgICAgICAgY2hhbmdlT3JpZ2luOiB0cnVlLFxyXG4gICAgICAgICAgc2VjdXJlOiBmYWxzZSxcclxuICAgICAgICAgIGNvbmZpZ3VyZTogKHByb3h5LCBfb3B0aW9ucykgPT4ge1xyXG4gICAgICAgICAgICBwcm94eS5vbigncHJveHlSZXEnLCAocHJveHlSZXEsIF9yZXEsIF9yZXMpID0+IHtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ29yaWdpbicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignT3JpZ2luJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdyZWZlcmVyJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdSZWZlcmVyJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdzZWMtZmV0Y2gtc2l0ZScpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignc2VjLWZldGNoLW1vZGUnKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ3NlYy1mZXRjaC1kZXN0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1mb3InKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1gtRm9yd2FyZGVkLUZvcicpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcigneC1mb3J3YXJkZWQtaG9zdCcpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcignWC1Gb3J3YXJkZWQtSG9zdCcpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnJlbW92ZUhlYWRlcigneC1mb3J3YXJkZWQtcHJvdG8nKTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5yZW1vdmVIZWFkZXIoJ1gtRm9yd2FyZGVkLVByb3RvJyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCd4LWZvcndhcmRlZC1wb3J0Jyk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEucmVtb3ZlSGVhZGVyKCdYLUZvcndhcmRlZC1Qb3J0Jyk7XHJcbiAgICAgICAgICAgICAgY29uc3QgdGFyZ2V0VXJsID0gbmV3IFVSTCh3b3JkcHJlc3NBcGlSb290KTtcclxuICAgICAgICAgICAgICBwcm94eVJlcS5zZXRIZWFkZXIoJ0hvc3QnLCB0YXJnZXRVcmwuaG9zdCk7XHJcbiAgICAgICAgICAgICAgcHJveHlSZXEuc2V0SGVhZGVyKCdob3N0JywgdGFyZ2V0VXJsLmhvc3QpO1xyXG4gICAgICAgICAgICAgIHByb3h5UmVxLnNldEhlYWRlcignVXNlci1BZ2VudCcsICdNb3ppbGxhLzUuMCAoV2luZG93cyBOVCAxMC4wOyBXaW42NDsgeDY0KScpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgICcvYXBpL2NhcmVlcnMnOiB7XHJcbiAgICAgICAgICB0YXJnZXQ6ICdodHRwczovL2dldG1lZHMtdGVzdC1jcmVhdGlvbi52ZXJjZWwuYXBwJyxcclxuICAgICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcclxuICAgICAgICAgIHNlY3VyZTogZmFsc2UsXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICAgIGlucHV0OiBnZXRIdG1sSW5wdXRzKClcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgc2FuaXR5SW1hZ2VTeW5jUGx1Z2luKCksXHJcbiAgICAgIHtcclxuXHJcbiAgICAgICAgbmFtZTogJ2luamVjdC1jaGF0Ym90LW1ldGEnLFxyXG4gICAgICAgIHRyYW5zZm9ybUluZGV4SHRtbChodG1sKSB7XHJcbiAgICAgICAgICBjb25zdCBzdXBwcmVzc29yID0gYFxcbiAgPHNjcmlwdD5cclxuICAgIChmdW5jdGlvbigpIHtcclxuICAgICAgdmFyIHcgPSBjb25zb2xlLndhcm47XHJcbiAgICAgIGNvbnNvbGUud2FybiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChhcmd1bWVudHNbMF0gJiYgdHlwZW9mIGFyZ3VtZW50c1swXSA9PT0gJ3N0cmluZycgJiYgYXJndW1lbnRzWzBdLmluZGV4T2YoJ2Nkbi50YWlsd2luZGNzcy5jb20nKSAhPT0gLTEpIHJldHVybjtcclxuICAgICAgICB3LmFwcGx5KGNvbnNvbGUsIGFyZ3VtZW50cyk7XHJcbiAgICAgIH07XHJcbiAgICB9KSgpO1xyXG4gIDwvc2NyaXB0PmA7XHJcbiAgICAgICAgICByZXR1cm4gaHRtbFxyXG4gICAgICAgICAgICAucmVwbGFjZSgnPGhlYWQ+JywgJzxoZWFkPicgKyBzdXBwcmVzc29yKVxyXG4gICAgICAgICAgICAucmVwbGFjZShcclxuICAgICAgICAgICAgICAnPC9oZWFkPicsXHJcbiAgICAgICAgICAgICAgYCAgPG1ldGEgbmFtZT1cImdldG1lZHMtY2hhdGJvdC1hcGlcIiBjb250ZW50PVwiJHtjaGF0Ym90VXJsfVwiIC8+XHJcbiAgPG1ldGEgbmFtZT1cImdldG1lZHMtc2FuaXR5LXByb2plY3QtaWRcIiBjb250ZW50PVwiJHtzYW5pdHlQcm9qZWN0SWR9XCIgLz5cclxuICA8bWV0YSBuYW1lPVwiZ2V0bWVkcy1zYW5pdHktZGF0YXNldFwiIGNvbnRlbnQ9XCIke3Nhbml0eURhdGFzZXR9XCIgLz5cclxuICA8bWV0YSBuYW1lPVwiZ2V0bWVkcy1zYW5pdHktYXBpLXZlcnNpb25cIiBjb250ZW50PVwiJHtzYW5pdHlBcGlWZXJzaW9ufVwiIC8+XFxuPC9oZWFkPmBcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdwYXAtdHN4LXJld3JpdGUnLFxyXG4gICAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XHJcbiAgICAgICAgaWYgKHByb2Nlc3MuZW52Lk5PREVfRU5WICE9PSAncHJvZHVjdGlvbicpIHtcclxuICAgICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHVybFBhdGggPSAocmVxLnVybCB8fCAnJykuc3BsaXQoJz8nKVswXTtcclxuICAgICAgICAgICAgY29uc3QgY2xlYW5QYXRoID0gdXJsUGF0aC5zdGFydHNXaXRoKCcvJykgPyB1cmxQYXRoIDogJy8nICsgdXJsUGF0aDtcclxuICAgICAgICAgICAgY29uc3QgcXMgPSAocmVxLnVybCB8fCAnJykuaW5jbHVkZXMoJz8nKSA/IHJlcS51cmwuc2xpY2UocmVxLnVybC5pbmRleE9mKCc/JykpIDogJyc7XHJcbiAgICAgICAgICAgIFxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2luZGV4Lmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2hvbWUtcHJldmlldy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9wYXAuaHRtbCcgfHwgY2xlYW5QYXRoID09PSAnL3BhcCcgfHwgY2xlYW5QYXRoID09PSAnL3BhcC8nKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDE7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL3BhdGllbnQtYXNzaXN0YW5jZS1wcm9ncmFtJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvcGF0aWVudC1hc3Npc3RhbmNlLXByb2dyYW0uaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvcGF0aWVudC1hc3Npc3RhbmNlLXByb2dyYW0nICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9wYXRpZW50LWFzc2lzdGFuY2UtcHJvZ3JhbScgfHwgY2xlYW5QYXRoID09PSAnL3BhdGllbnQtYXNzaXN0YW5jZS1wcm9ncmFtLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncGF0aWVudC1hc3Npc3RhbmNlLXByb2dyYW0tcHJldmlldy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy91bmdjLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL3VuZ2MnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy91bmdjJyB8fCBjbGVhblBhdGggPT09ICcvdW5nYy8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3VuZ2MuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FyZWVycy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9jYXJlZXJzJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FyZWVycycgfHwgY2xlYW5QYXRoID09PSAnL2NhcmVlcnMvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjYXJlZXJzLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2Nzci5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9jc3InICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jc3InIHx8IGNsZWFuUGF0aCA9PT0gJy9jc3IvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjc3IuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvZ2xvYmFsLXByZXNlbmNlLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2dsb2JhbC1wcmVzZW5jZScgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2dsb2JhbC1wcmVzZW5jZScgfHwgY2xlYW5QYXRoID09PSAnL2dsb2JhbC1wcmVzZW5jZS8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2dsb2JhbC1wcmVzZW5jZS5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9zZXJ2aWNlcy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9zZXJ2aWNlcycgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL3NlcnZpY2VzJyB8fCBjbGVhblBhdGggPT09ICcvc2VydmljZXMvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdzZXJ2aWNlcy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jb250YWN0LXVzLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2NvbnRhY3QtdXMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9jb250YWN0LXVzJyB8fCBjbGVhblBhdGggPT09ICcvY29udGFjdC11cy8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2NvbnRhY3QtdXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYWJvdXQtdXMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvYWJvdXQtdXMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9hYm91dC11cycgfHwgY2xlYW5QYXRoID09PSAnL2Fib3V0LXVzLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnYWJvdXQtdXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvbWVkaXRhdGlvbnMuaHRtbCcpIHtcclxuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDMwMjtcclxuICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvbWVkaXRhdGlvbnMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9tZWRpdGF0aW9ucycgfHwgY2xlYW5QYXRoID09PSAnL21lZGl0YXRpb25zLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnbWVkaXRhdGlvbnMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvZW1wbG95ZWUtdmVyaWZpY2F0aW9uLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2VtcGxveWVlLXZlcmlmaWNhdGlvbicgKyBxcyk7XHJcbiAgICAgICAgICAgICAgcmVzLmVuZCgpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2VtcGxveWVlLXZlcmlmaWNhdGlvbicgfHwgY2xlYW5QYXRoID09PSAnL2VtcGxveWVlLXZlcmlmaWNhdGlvbi8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2VtcGxveWVlLXZlcmlmaWNhdGlvbi5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9wcm9kdWN0LXJhbmdlLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL3Byb2R1Y3QtcmFuZ2UnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aC5zdGFydHNXaXRoKCcvcHJvZHVjdC1yYW5nZScpKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgc2VnbWVudHMgPSBjbGVhblBhdGguc3BsaXQoJy8nKS5maWx0ZXIoQm9vbGVhbik7XHJcbiAgICAgICAgICAgICAgaWYgKHNlZ21lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qgc2x1ZyA9IHNlZ21lbnRzWzFdO1xyXG4gICAgICAgICAgICAgICAgaWYgKHN1YmNhdGVnb3JpZXMuaW5jbHVkZXMoc2x1ZykpIHtcclxuICAgICAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2NhbmNlci1tZWRpY2luZXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwcm9kdWN0LWRldGFpbC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgICByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04JykpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnY2FuY2VyLW1lZGljaW5lcy5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04JykpO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIC8vIC9jYW5jZXItbWVkaWNpbmUvKiAoc2luZ3VsYXIpIFx1MjAxNCBvbmNvbG9neSBwcm9kdWN0IGRldGFpbCBwYWdlc1xyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL2NhbmNlci1tZWRpY2luZS5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9wcm9kdWN0LXJhbmdlJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FuY2VyLW1lZGljaW5lJyB8fCBjbGVhblBhdGggPT09ICcvY2FuY2VyLW1lZGljaW5lLycgfHwgKGNsZWFuUGF0aC5zdGFydHNXaXRoKCcvY2FuY2VyLW1lZGljaW5lLycpICYmICFjbGVhblBhdGguc3RhcnRzV2l0aCgnL2NhbmNlci1tZWRpY2luZXMnKSkpIHtcclxuICAgICAgICAgICAgICBjb25zdCBzZWdtZW50cyA9IGNsZWFuUGF0aC5zcGxpdCgnLycpLmZpbHRlcihCb29sZWFuKTtcclxuICAgICAgICAgICAgICBpZiAoc2VnbWVudHNbMF0gPT09ICdjYW5jZXItbWVkaWNpbmUnICYmIHNlZ21lbnRzLmxlbmd0aCA9PT0gMikge1xyXG4gICAgICAgICAgICAgICAgLy8gQWx3YXlzIGEgcHJvZHVjdCBzbHVnIChub3QgYSBzdWJjYXRlZ29yeSlcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwcm9kdWN0LWRldGFpbC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICByZXMuZW5kKGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04JykpO1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIC8vIC9jYW5jZXItbWVkaWNpbmUgd2l0aCBubyBzbHVnIC0gcmVkaXJlY3QgdG8gY2F0YWxvZ1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdMb2NhdGlvbicsICcvcHJvZHVjdC1yYW5nZScgKyBxcyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvY2FuY2VyLW1lZGljaW5lcy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9jYW5jZXItbWVkaWNpbmVzJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGguc3RhcnRzV2l0aCgnL2NhbmNlci1tZWRpY2luZXMnKSkge1xyXG4gICAgICAgICAgICAgIGNvbnN0IHNlZ21lbnRzID0gY2xlYW5QYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pO1xyXG4gICAgICAgICAgICAgIGlmIChzZWdtZW50cy5sZW5ndGggPT09IDIpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHNsdWcgPSBzZWdtZW50c1sxXTtcclxuICAgICAgICAgICAgICAgIGlmIChzdWJjYXRlZ29yaWVzLmluY2x1ZGVzKHNsdWcpKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdjYW5jZXItbWVkaWNpbmVzLmh0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKSk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncHJvZHVjdC1kZXRhaWwuaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpKTtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2NhbmNlci1tZWRpY2luZXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpKTtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL3Byb2R1Y3QtZGV0YWlsLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL3Byb2R1Y3QtZGV0YWlsJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvcHJvZHVjdC1kZXRhaWwnIHx8IGNsZWFuUGF0aCA9PT0gJy9wcm9kdWN0LWRldGFpbC8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Byb2R1Y3QtZGV0YWlsLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnL29yZGVyLW1lZGljaW5lcy5odG1sJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAyO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9vcmRlci1tZWRpY2luZXMnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9vcmRlci1tZWRpY2luZXMnIHx8IGNsZWFuUGF0aCA9PT0gJy9vcmRlci1tZWRpY2luZXMvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdvcmRlci1tZWRpY2luZXMuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYXJ0aWNsZXMuaHRtbCcgfHwgY2xlYW5QYXRoID09PSAnL2FydGljbGVzJyB8fCBjbGVhblBhdGggPT09ICcvYXJ0aWNsZXMvJykge1xyXG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMzAxO1xyXG4gICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0xvY2F0aW9uJywgJy9ibG9nJyArIHFzKTtcclxuICAgICAgICAgICAgICByZXMuZW5kKCk7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGggPT09ICcvYXJ0aWNsZS1kZXRhaWwuaHRtbCcgfHwgY2xlYW5QYXRoID09PSAnL2FydGljbGUtZGV0YWlsJyB8fCBjbGVhblBhdGggPT09ICcvYXJ0aWNsZS1kZXRhaWwvJykge1xyXG4gICAgICAgICAgICAgIGNvbnN0IGh0bWxQYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdibG9nLWRldGFpbC5odG1sJyk7XHJcbiAgICAgICAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMoaHRtbFBhdGgpKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBodG1sQ29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhodG1sUGF0aCwgJ3V0Zi04Jyk7XHJcbiAgICAgICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9odG1sJyk7XHJcbiAgICAgICAgICAgICAgICByZXMuZW5kKGh0bWxDb250ZW50KTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9ibG9nLmh0bWwnKSB7XHJcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAzMDI7XHJcbiAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignTG9jYXRpb24nLCAnL2Jsb2cnICsgcXMpO1xyXG4gICAgICAgICAgICAgIHJlcy5lbmQoKTtcclxuICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGNsZWFuUGF0aCA9PT0gJy9ibG9nJyB8fCBjbGVhblBhdGggPT09ICcvYmxvZy8nKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2Jsb2cuaHRtbCcpO1xyXG4gICAgICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKGh0bWxQYXRoKSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgaHRtbENvbnRlbnQgPSBmcy5yZWFkRmlsZVN5bmMoaHRtbFBhdGgsICd1dGYtOCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvaHRtbCcpO1xyXG4gICAgICAgICAgICAgICAgcmVzLmVuZChodG1sQ29udGVudCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChjbGVhblBhdGguc3RhcnRzV2l0aCgnL2Jsb2cvJykgJiYgY2xlYW5QYXRoLnNwbGl0KCcvJykuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCA+PSAyKSB7XHJcbiAgICAgICAgICAgICAgY29uc3QgaHRtbFBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2Jsb2ctZGV0YWlsLmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoY2xlYW5QYXRoID09PSAnLycgfHwgY2xlYW5QYXRoID09PSAnL2hvbWUnIHx8IGNsZWFuUGF0aCA9PT0gJy9ob21lLycpIHtcclxuICAgICAgICAgICAgICBjb25zdCBodG1sUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnaG9tZS1wcmV2aWV3Lmh0bWwnKTtcclxuICAgICAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhodG1sUGF0aCkpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGh0bWxDb250ZW50ID0gZnMucmVhZEZpbGVTeW5jKGh0bWxQYXRoLCAndXRmLTgnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2h0bWwnKTtcclxuICAgICAgICAgICAgICAgIHJlcy5lbmQoaHRtbENvbnRlbnQpO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBuZXh0KCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdXHJcbn07XHJcbn0pO1xyXG4iLCAiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEdldG1lZHNcXFxcRGVza3RvcFxcXFxHZXRtZWRzXFxcXHNyY1xcXFxwbHVnaW5zXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxHZXRtZWRzXFxcXERlc2t0b3BcXFxcR2V0bWVkc1xcXFxzcmNcXFxccGx1Z2luc1xcXFxzYW5pdHlJbWFnZVN5bmMuanNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0dldG1lZHMvRGVza3RvcC9HZXRtZWRzL3NyYy9wbHVnaW5zL3Nhbml0eUltYWdlU3luYy5qc1wiOy8qKlxyXG4gKiBzYW5pdHlJbWFnZVN5bmMuanNcclxuICogXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHUyNTAwXHJcbiAqIFZpdGUgcGx1Z2luIHRoYXQgYXV0b21hdGljYWxseSBzeW5jcyBpbWFnZSBzbG90IG5hbWVzIGZyb21cclxuICogeW91ciBmcm9udGVuZCBzb3VyY2UgY29kZSBpbnRvIFNhbml0eSBhcyBwYWdlQXNzZXQgZG9jdW1lbnRzLlxyXG4gKlxyXG4gKiBIb3cgaXQgd29ya3M6XHJcbiAqICAxLiBPbiBldmVyeSBgdml0ZSBkZXZgIHN0YXJ0IG9yIGB2aXRlIGJ1aWxkYCwgaXQgc2NhbnMgYWxsXHJcbiAqICAgICAudHN4IGZpbGVzIGluIHNyYy9wYWdlcy8gZm9yIGdldEltYWdlKCkgYW5kIGdldFNsaWRlckltYWdlcygpIGNhbGxzLlxyXG4gKiAgMi4gRXh0cmFjdHMgdGhlIGZpcnN0IGFyZ3VtZW50ICh0aGUgc2xvdCBuYW1lKSBmcm9tIGVhY2ggY2FsbC5cclxuICogIDMuIFF1ZXJpZXMgU2FuaXR5IGZvciBhbGwgZXhpc3RpbmcgcGFnZUFzc2V0IGRvY3VtZW50IG5hbWVzLlxyXG4gKiAgNC4gRm9yIGFueSBzbG90IG5hbWUgZm91bmQgaW4gY29kZSB0aGF0IGRvZXMgTk9UIGV4aXN0IGluIFNhbml0eSxcclxuICogICAgIGl0IGNyZWF0ZXMgYW4gZW1wdHkgcGFnZUFzc2V0IGRvY3VtZW50IChuYW1lIG9ubHksIG5vIGltYWdlIHlldCkuXHJcbiAqICA1LiBDb250ZW50IG1hbmFnZXJzIHRoZW4gc2VlIHRoZSBuZXcgc2xvdCBpbiBTdHVkaW8gYW5kIGp1c3QgdXBsb2FkLlxyXG4gKlxyXG4gKiBSZXF1aXJlbWVudHM6XHJcbiAqICBBZGQgdG8geW91ciAuZW52OlxyXG4gKiAgICBTQU5JVFlfV1JJVEVfVE9LRU49c2suLi4gIChFZGl0b3Igb3IgaGlnaGVyIHRva2VuIGZyb20gbWFuYWdlLnNhbml0eS5pbylcclxuICovXHJcblxyXG5pbXBvcnQgZnMgZnJvbSAnZnMnXHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnXHJcbmltcG9ydCB7IGNyZWF0ZUNsaWVudCB9IGZyb20gJ0BzYW5pdHkvY2xpZW50J1xyXG5cclxuY29uc3QgX19kaXJuYW1lID0gcGF0aC5kaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSlcclxuXHJcbi8vIFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFx1MjUwMFxyXG4vLyBSZWdleCBwYXR0ZXJucyB0aGF0IG1hdGNoIHlvdXIgZ2V0SW1hZ2UgLyBnZXRTbGlkZXJJbWFnZXMgY2FsbHNcclxuLy8gQ2FwdHVyZXMgdGhlIHNsb3QgbmFtZSAoZmlyc3Qgc3RyaW5nIGFyZ3VtZW50KVxyXG4vLyBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcdTI1MDBcclxuY29uc3QgSU1BR0VfQ0FMTF9QQVRURVJOID0gL2dldEltYWdlXFwoXFxzKlsnXCJdKFteJ1wiXSspWydcIl0vZ1xyXG5jb25zdCBTTElERVJfQ0FMTF9QQVRURVJOID0gL2dldFNsaWRlckltYWdlc1xcKFxccypbJ1wiXShbXidcIl0rKVsnXCJdL2dcclxuXHJcbi8qKlxyXG4gKiBTY2FuIGEgc2luZ2xlIC50c3ggZmlsZSBhbmQgcmV0dXJuIGFsbCBzbG90IG5hbWVzIGZvdW5kLlxyXG4gKi9cclxuZnVuY3Rpb24gZXh0cmFjdFNsb3ROYW1lc0Zyb21GaWxlKGZpbGVQYXRoKSB7XHJcbiAgY29uc3QgY29udGVudCA9IGZzLnJlYWRGaWxlU3luYyhmaWxlUGF0aCwgJ3V0Zi04JylcclxuICBjb25zdCBuYW1lcyA9IG5ldyBTZXQoKVxyXG5cclxuICBmb3IgKGNvbnN0IG1hdGNoIG9mIGNvbnRlbnQubWF0Y2hBbGwoSU1BR0VfQ0FMTF9QQVRURVJOKSkge1xyXG4gICAgbmFtZXMuYWRkKG1hdGNoWzFdKVxyXG4gIH1cclxuICBmb3IgKGNvbnN0IG1hdGNoIG9mIGNvbnRlbnQubWF0Y2hBbGwoU0xJREVSX0NBTExfUEFUVEVSTikpIHtcclxuICAgIG5hbWVzLmFkZChtYXRjaFsxXSlcclxuICB9XHJcblxyXG4gIHJldHVybiBuYW1lc1xyXG59XHJcblxyXG4vKipcclxuICogU2NhbiBhbGwgLnRzeCBmaWxlcyBpbiBzcmMvcGFnZXMvIGFuZCBtYXAgc2xvdCBuYW1lIHRvIHBhZ2Ugc2x1Zy5cclxuICovXHJcbmZ1bmN0aW9uIHNjYW5BbGxQYWdlU2xvdHMocGFnZXNEaXIpIHtcclxuICBjb25zdCBuYW1lVG9QYWdlTWFwID0gbmV3IE1hcCgpXHJcblxyXG4gIGlmICghZnMuZXhpc3RzU3luYyhwYWdlc0RpcikpIHtcclxuICAgIGNvbnNvbGUud2FybihgW0ltYWdlU3luY10gUGFnZXMgZGlyZWN0b3J5IG5vdCBmb3VuZDogJHtwYWdlc0Rpcn1gKVxyXG4gICAgcmV0dXJuIG5hbWVUb1BhZ2VNYXBcclxuICB9XHJcblxyXG4gIGNvbnN0IGZpbGVzID0gZnMucmVhZGRpclN5bmMocGFnZXNEaXIpLmZpbHRlcihmID0+IGYuZW5kc1dpdGgoJy50c3gnKSlcclxuXHJcbiAgZm9yIChjb25zdCBmaWxlIG9mIGZpbGVzKSB7XHJcbiAgICBjb25zdCBwYWdlU2x1ZyA9IGZpbGUucmVwbGFjZSgvXFwudHN4JC8sICcnKVxyXG4gICAgY29uc3QgZmlsZVBhdGggPSBwYXRoLmpvaW4ocGFnZXNEaXIsIGZpbGUpXHJcbiAgICBjb25zdCBuYW1lcyA9IGV4dHJhY3RTbG90TmFtZXNGcm9tRmlsZShmaWxlUGF0aClcclxuICAgIGZvciAoY29uc3QgbmFtZSBvZiBuYW1lcykge1xyXG4gICAgICBuYW1lVG9QYWdlTWFwLnNldChuYW1lLCBwYWdlU2x1ZylcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiBuYW1lVG9QYWdlTWFwXHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzYW5pdHlJbWFnZVN5bmNQbHVnaW4oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIG5hbWU6ICdzYW5pdHktaW1hZ2Utc3luYycsXHJcblxyXG4gICAgYXN5bmMgYnVpbGRTdGFydCgpIHtcclxuICAgICAgY29uc3QgcHJvamVjdElkID0gcHJvY2Vzcy5lbnYuVklURV9TQU5JVFlfUFJPSkVDVF9JRCB8fCAnczdvY3o4enAnXHJcbiAgICAgIGNvbnN0IGRhdGFzZXQgICA9IHByb2Nlc3MuZW52LlZJVEVfU0FOSVRZX0RBVEFTRVQgICAgfHwgJ3Byb2R1Y3Rpb24nXHJcbiAgICAgIGNvbnN0IGFwaVZlcnNpb24gPSBwcm9jZXNzLmVudi5WSVRFX1NBTklUWV9BUElfVkVSU0lPTiB8fCAnMjAyNC0wMS0wMSdcclxuICAgICAgY29uc3Qgd3JpdGVUb2tlbiA9IHByb2Nlc3MuZW52LlNBTklUWV9XUklURV9UT0tFTlxyXG5cclxuICAgICAgaWYgKCF3cml0ZVRva2VuKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgJ1xcbltJbWFnZVN5bmNdIFx1MjZBMFx1RkUwRiAgU0FOSVRZX1dSSVRFX1RPS0VOIGlzIG5vdCBzZXQgaW4gLmVudiBcdTIwMTQgc2tpcHBpbmcgYXV0by1zeW5jLlxcbicgK1xyXG4gICAgICAgICAgJyAgICAgICAgICAgQWRkIFNBTklUWV9XUklURV9UT0tFTj1zay4uLiB0byB5b3VyIC5lbnYgZmlsZSB0byBlbmFibGUgaXQuXFxuJ1xyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgc2FuaXR5ID0gY3JlYXRlQ2xpZW50KHtcclxuICAgICAgICBwcm9qZWN0SWQsXHJcbiAgICAgICAgZGF0YXNldCxcclxuICAgICAgICBhcGlWZXJzaW9uLFxyXG4gICAgICAgIHRva2VuOiB3cml0ZVRva2VuLFxyXG4gICAgICAgIHVzZUNkbjogZmFsc2UsXHJcbiAgICAgIH0pXHJcblxyXG4gICAgICBjb25zdCBwYWdlc0RpciA9IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9zcmMvcGFnZXMnKVxyXG4gICAgICBjb25zdCBuYW1lVG9QYWdlTWFwID0gc2NhbkFsbFBhZ2VTbG90cyhwYWdlc0RpcilcclxuXHJcbiAgICAgIGlmIChuYW1lVG9QYWdlTWFwLnNpemUgPT09IDApIHtcclxuICAgICAgICBjb25zb2xlLmxvZygnW0ltYWdlU3luY10gTm8gZ2V0SW1hZ2UoKSBjYWxscyBmb3VuZCBpbiBzcmMvcGFnZXMvJylcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gU2tpcCB0aGUgbG9nbyBcdTIwMTQgaXQncyBoYW5kbGVkIHZpYSBzaXRlU2V0dGluZ3NcclxuICAgICAgbmFtZVRvUGFnZU1hcC5kZWxldGUoJ2Fzc2V0cy9nZXRtZWRzbG9nby5wbmcnKVxyXG5cclxuICAgICAgbGV0IGV4aXN0aW5nTmFtZXMgPSBuZXcgU2V0KClcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBleGlzdGluZyA9IGF3YWl0IHNhbml0eS5mZXRjaChcclxuICAgICAgICAgIGAqW190eXBlID09IFwicGFnZUFzc2V0XCJdeyBuYW1lIH1gLFxyXG4gICAgICAgICAge30sXHJcbiAgICAgICAgICB7IGNhY2hlOiAnbm8tc3RvcmUnIH1cclxuICAgICAgICApXHJcbiAgICAgICAgZXhpc3RpbmdOYW1lcyA9IG5ldyBTZXQoZXhpc3RpbmcubWFwKGRvYyA9PiBkb2MubmFtZSkpXHJcbiAgICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ1tJbWFnZVN5bmNdIEZhaWxlZCB0byBmZXRjaCBleGlzdGluZyBwYWdlQXNzZXQgZG9jczonLCBlcnIubWVzc2FnZSlcclxuICAgICAgICByZXR1cm5cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgbWlzc2luZyA9IFsuLi5uYW1lVG9QYWdlTWFwLmtleXMoKV0uZmlsdGVyKG5hbWUgPT4gIWV4aXN0aW5nTmFtZXMuaGFzKG5hbWUpKVxyXG5cclxuICAgICAgaWYgKG1pc3NpbmcubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coYFtJbWFnZVN5bmNdIFx1MjcwNSBBbGwgJHtuYW1lVG9QYWdlTWFwLnNpemV9IGltYWdlIHNsb3RzIGFyZSBhbHJlYWR5IGluIFNhbml0eS5gKVxyXG4gICAgICAgIHJldHVyblxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zb2xlLmxvZyhgXFxuW0ltYWdlU3luY10gRm91bmQgJHttaXNzaW5nLmxlbmd0aH0gbmV3IGltYWdlIHNsb3Qocykgbm90IHlldCBpbiBTYW5pdHk6YClcclxuICAgICAgbWlzc2luZy5mb3JFYWNoKG5hbWUgPT4gY29uc29sZS5sb2coYCAgKyBcIiR7bmFtZX1cIiAoUGFnZTogJHtuYW1lVG9QYWdlTWFwLmdldChuYW1lKX0pYCkpXHJcblxyXG4gICAgICBsZXQgY3JlYXRlZCA9IDBcclxuICAgICAgZm9yIChjb25zdCBuYW1lIG9mIG1pc3NpbmcpIHtcclxuICAgICAgICBjb25zdCBkb2NJZCA9IGBwYWdlLWFzc2V0LSR7bmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoL1teYS16MC05XSsvZywgJy0nKX1gXHJcbiAgICAgICAgY29uc3QgcGFnZVNsdWcgPSBuYW1lVG9QYWdlTWFwLmdldChuYW1lKVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhd2FpdCBzYW5pdHkuY3JlYXRlSWZOb3RFeGlzdHMoe1xyXG4gICAgICAgICAgICBfdHlwZTogJ3BhZ2VBc3NldCcsXHJcbiAgICAgICAgICAgIF9pZDogZG9jSWQsXHJcbiAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgIHBhZ2U6IHBhZ2VTbHVnLFxyXG4gICAgICAgICAgICBpbWFnZXM6IFtdLFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGBbSW1hZ2VTeW5jXSAgIFx1MjcxMyBDcmVhdGVkIHNsb3Q6IFwiJHtuYW1lfVwiIGZvciBwYWdlOiAke3BhZ2VTbHVnfWApXHJcbiAgICAgICAgICBjcmVhdGVkKytcclxuICAgICAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoYFtJbWFnZVN5bmNdICAgXHUyNzE3IEZhaWxlZCB0byBjcmVhdGUgc2xvdCBcIiR7bmFtZX1cIjpgLCBlcnIubWVzc2FnZSlcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnNvbGUubG9nKFxyXG4gICAgICAgIGBcXG5bSW1hZ2VTeW5jXSBcdTI3MDUgRG9uZSBcdTIwMTQgJHtjcmVhdGVkfSBuZXcgc2xvdChzKSBjcmVhdGVkIGluIFNhbml0eS5cXG5gXHJcbiAgICAgIClcclxuICAgIH0sXHJcbiAgfVxyXG59XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNFIsU0FBUyxjQUFjLGVBQWU7QUFDbFUsT0FBT0EsU0FBUTtBQUNmLE9BQU9DLFdBQVU7QUFFakIsU0FBUyxnQkFBZ0I7OztBQ2dCekIsT0FBTyxRQUFRO0FBQ2YsT0FBTyxVQUFVO0FBQ2pCLFNBQVMscUJBQXFCO0FBQzlCLFNBQVMsb0JBQW9CO0FBdkJvTCxJQUFNLDJDQUEyQztBQXlCbFEsSUFBTSxZQUFZLEtBQUssUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFNN0QsSUFBTSxxQkFBcUI7QUFDM0IsSUFBTSxzQkFBc0I7QUFLNUIsU0FBUyx5QkFBeUIsVUFBVTtBQUMxQyxRQUFNLFVBQVUsR0FBRyxhQUFhLFVBQVUsT0FBTztBQUNqRCxRQUFNLFFBQVEsb0JBQUksSUFBSTtBQUV0QixhQUFXLFNBQVMsUUFBUSxTQUFTLGtCQUFrQixHQUFHO0FBQ3hELFVBQU0sSUFBSSxNQUFNLENBQUMsQ0FBQztBQUFBLEVBQ3BCO0FBQ0EsYUFBVyxTQUFTLFFBQVEsU0FBUyxtQkFBbUIsR0FBRztBQUN6RCxVQUFNLElBQUksTUFBTSxDQUFDLENBQUM7QUFBQSxFQUNwQjtBQUVBLFNBQU87QUFDVDtBQUtBLFNBQVMsaUJBQWlCLFVBQVU7QUFDbEMsUUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUU5QixNQUFJLENBQUMsR0FBRyxXQUFXLFFBQVEsR0FBRztBQUM1QixZQUFRLEtBQUssMENBQTBDLFFBQVEsRUFBRTtBQUNqRSxXQUFPO0FBQUEsRUFDVDtBQUVBLFFBQU0sUUFBUSxHQUFHLFlBQVksUUFBUSxFQUFFLE9BQU8sT0FBSyxFQUFFLFNBQVMsTUFBTSxDQUFDO0FBRXJFLGFBQVcsUUFBUSxPQUFPO0FBQ3hCLFVBQU0sV0FBVyxLQUFLLFFBQVEsVUFBVSxFQUFFO0FBQzFDLFVBQU0sV0FBVyxLQUFLLEtBQUssVUFBVSxJQUFJO0FBQ3pDLFVBQU0sUUFBUSx5QkFBeUIsUUFBUTtBQUMvQyxlQUFXLFFBQVEsT0FBTztBQUN4QixvQkFBYyxJQUFJLE1BQU0sUUFBUTtBQUFBLElBQ2xDO0FBQUEsRUFDRjtBQUVBLFNBQU87QUFDVDtBQUVPLFNBQVMsd0JBQXdCO0FBQ3RDLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUVOLE1BQU0sYUFBYTtBQUNqQixZQUFNLFlBQVksUUFBUSxJQUFJLDBCQUEwQjtBQUN4RCxZQUFNLFVBQVksUUFBUSxJQUFJLHVCQUEwQjtBQUN4RCxZQUFNLGFBQWEsUUFBUSxJQUFJLDJCQUEyQjtBQUMxRCxZQUFNLGFBQWEsUUFBUSxJQUFJO0FBRS9CLFVBQUksQ0FBQyxZQUFZO0FBQ2YsZ0JBQVE7QUFBQSxVQUNOO0FBQUEsUUFFRjtBQUNBO0FBQUEsTUFDRjtBQUVBLFlBQU0sU0FBUyxhQUFhO0FBQUEsUUFDMUI7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0EsT0FBTztBQUFBLFFBQ1AsUUFBUTtBQUFBLE1BQ1YsQ0FBQztBQUVELFlBQU0sV0FBVyxLQUFLLFFBQVEsV0FBVyxjQUFjO0FBQ3ZELFlBQU0sZ0JBQWdCLGlCQUFpQixRQUFRO0FBRS9DLFVBQUksY0FBYyxTQUFTLEdBQUc7QUFDNUIsZ0JBQVEsSUFBSSxxREFBcUQ7QUFDakU7QUFBQSxNQUNGO0FBR0Esb0JBQWMsT0FBTyx3QkFBd0I7QUFFN0MsVUFBSSxnQkFBZ0Isb0JBQUksSUFBSTtBQUM1QixVQUFJO0FBQ0YsY0FBTSxXQUFXLE1BQU0sT0FBTztBQUFBLFVBQzVCO0FBQUEsVUFDQSxDQUFDO0FBQUEsVUFDRCxFQUFFLE9BQU8sV0FBVztBQUFBLFFBQ3RCO0FBQ0Esd0JBQWdCLElBQUksSUFBSSxTQUFTLElBQUksU0FBTyxJQUFJLElBQUksQ0FBQztBQUFBLE1BQ3ZELFNBQVMsS0FBSztBQUNaLGdCQUFRLE1BQU0sd0RBQXdELElBQUksT0FBTztBQUNqRjtBQUFBLE1BQ0Y7QUFFQSxZQUFNLFVBQVUsQ0FBQyxHQUFHLGNBQWMsS0FBSyxDQUFDLEVBQUUsT0FBTyxVQUFRLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQztBQUVqRixVQUFJLFFBQVEsV0FBVyxHQUFHO0FBQ3hCLGdCQUFRLElBQUksMEJBQXFCLGNBQWMsSUFBSSxxQ0FBcUM7QUFDeEY7QUFBQSxNQUNGO0FBRUEsY0FBUSxJQUFJO0FBQUEsb0JBQXVCLFFBQVEsTUFBTSx1Q0FBdUM7QUFDeEYsY0FBUSxRQUFRLFVBQVEsUUFBUSxJQUFJLFFBQVEsSUFBSSxZQUFZLGNBQWMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDO0FBRXZGLFVBQUksVUFBVTtBQUNkLGlCQUFXLFFBQVEsU0FBUztBQUMxQixjQUFNLFFBQVEsY0FBYyxLQUFLLFlBQVksRUFBRSxRQUFRLGVBQWUsR0FBRyxDQUFDO0FBQzFFLGNBQU0sV0FBVyxjQUFjLElBQUksSUFBSTtBQUN2QyxZQUFJO0FBQ0YsZ0JBQU0sT0FBTyxrQkFBa0I7QUFBQSxZQUM3QixPQUFPO0FBQUEsWUFDUCxLQUFLO0FBQUEsWUFDTDtBQUFBLFlBQ0EsTUFBTTtBQUFBLFlBQ04sUUFBUSxDQUFDO0FBQUEsVUFDWCxDQUFDO0FBQ0Qsa0JBQVEsSUFBSSx1Q0FBa0MsSUFBSSxlQUFlLFFBQVEsRUFBRTtBQUMzRTtBQUFBLFFBQ0YsU0FBUyxLQUFLO0FBQ1osa0JBQVEsTUFBTSwrQ0FBMEMsSUFBSSxNQUFNLElBQUksT0FBTztBQUFBLFFBQy9FO0FBQUEsTUFDRjtBQUVBLGNBQVE7QUFBQSxRQUNOO0FBQUEsaUNBQTBCLE9BQU87QUFBQTtBQUFBLE1BQ25DO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRjs7O0FEekpBLElBQU0sZ0JBQWdCLE1BQU07QUFDMUIsUUFBTSxNQUFNLFFBQVEsSUFBSTtBQUN4QixRQUFNLFFBQVFDLElBQUcsWUFBWSxHQUFHO0FBQ2hDLFFBQU0sWUFBWSxNQUFNLE9BQU8sT0FBSyxFQUFFLFNBQVMsT0FBTyxDQUFDO0FBQ3ZELFFBQU0sU0FBUyxDQUFDO0FBQ2hCLFlBQVUsUUFBUSxVQUFRO0FBQ3hCLFVBQU0sT0FBTyxLQUFLLFFBQVEsV0FBVyxFQUFFO0FBQ3ZDLFdBQU8sSUFBSSxJQUFJQyxNQUFLLFFBQVEsS0FBSyxJQUFJO0FBQUEsRUFDdkMsQ0FBQztBQUNELFNBQU87QUFDVDtBQUVBLElBQU0sc0JBQXNCO0FBQUEsRUFDMUIsOEJBQThCO0FBQUEsRUFDOUIsMEJBQTBCO0FBQUEsRUFDMUIsNEJBQTRCO0FBQUEsRUFDNUIsaUNBQWlDO0FBQUEsRUFDakMsa0NBQWtDO0FBQUEsRUFDbEMsc0JBQXNCO0FBQUEsRUFDdEIsMEJBQTBCO0FBQUEsRUFDMUIsNEJBQTRCO0FBQUEsRUFDNUIsbUNBQW1DO0FBQUEsRUFDbkMsNkJBQTZCO0FBQUEsRUFDN0IsOEJBQThCO0FBQUEsRUFDOUIseUJBQXlCO0FBQUEsRUFDekIsdUJBQXVCO0FBQUEsRUFDdkIsMkJBQTJCO0FBQUEsRUFDM0IsOEJBQThCO0FBQUEsRUFDOUIsMEJBQTBCO0FBQUEsRUFDMUIsZ0JBQWdCO0FBQUEsRUFDaEIsMEJBQTBCO0FBQUEsRUFDMUIsd0NBQXdDO0FBQzFDO0FBRUEsSUFBTSxxQkFBcUIsQ0FBQyxTQUFTO0FBQ25DLFNBQU8sS0FDSixZQUFZLEVBQ1osS0FBSyxFQUNMLFFBQVEsUUFBUSxHQUFHLEVBQ25CLFFBQVEsZUFBZSxFQUFFLEVBQ3pCLFFBQVEsT0FBTyxHQUFHO0FBQ3ZCO0FBRUEsZUFBZSx5QkFBeUIsS0FBSztBQUMzQyxRQUFNLFlBQVksSUFBSSwwQkFBMEI7QUFDaEQsUUFBTSxVQUFVLElBQUksdUJBQXVCO0FBQzNDLFFBQU0sUUFBUTtBQUNkLFFBQU0sTUFBTSxXQUFXLFNBQVMseUNBQXlDLE9BQU8sVUFBVSxtQkFBbUIsS0FBSyxDQUFDO0FBRW5ILE1BQUk7QUFDRixVQUFNLE1BQU0sTUFBTSxNQUFNLEdBQUc7QUFDM0IsUUFBSSxDQUFDLElBQUksR0FBSSxPQUFNLElBQUksTUFBTSxRQUFRLElBQUksTUFBTSxFQUFFO0FBQ2pELFVBQU0sT0FBTyxNQUFNLElBQUksS0FBSztBQUM1QixVQUFNLFVBQVUsb0JBQUksSUFBSTtBQUV4QixRQUFJLEtBQUssUUFBUTtBQUNmLFdBQUssT0FBTyxRQUFRLFNBQU87QUFDekIsWUFBSSxJQUFJLFVBQVU7QUFDaEIsZ0JBQU0sUUFBUSxtQkFBbUIsSUFBSSxRQUFRO0FBQzdDLGtCQUFRLElBQUksS0FBSztBQUNqQixjQUFJLG9CQUFvQixLQUFLLEdBQUc7QUFDOUIsb0JBQVEsSUFBSSxvQkFBb0IsS0FBSyxDQUFDO0FBQUEsVUFDeEM7QUFBQSxRQUNGO0FBQ0EsWUFBSSxNQUFNLFFBQVEsSUFBSSxXQUFXLEdBQUc7QUFDbEMsY0FBSSxZQUFZLFFBQVEsU0FBTztBQUM3QixnQkFBSSxLQUFLO0FBQ1Asb0JBQU0sUUFBUSxtQkFBbUIsR0FBRztBQUNwQyxzQkFBUSxJQUFJLEtBQUs7QUFDakIsa0JBQUksb0JBQW9CLEtBQUssR0FBRztBQUM5Qix3QkFBUSxJQUFJLG9CQUFvQixLQUFLLENBQUM7QUFBQSxjQUN4QztBQUFBLFlBQ0Y7QUFBQSxVQUNGLENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRixDQUFDO0FBQUEsSUFDSDtBQUVBLFVBQU0sT0FBTyxNQUFNLEtBQUssT0FBTyxFQUFFLE9BQU8sT0FBTztBQUMvQyxRQUFJLEtBQUssU0FBUyxHQUFHO0FBQ25CLGFBQU87QUFBQSxJQUNUO0FBQUEsRUFDRixTQUFTLE9BQU87QUFBQSxFQUVoQjtBQUNBLFNBQU87QUFBQSxJQUNMO0FBQUEsSUFBaUI7QUFBQSxJQUFrQjtBQUFBLElBQWU7QUFBQSxJQUFtQjtBQUFBLElBQ3JFO0FBQUEsSUFBcUI7QUFBQSxJQUFPO0FBQUEsSUFBTztBQUFBLElBQVk7QUFBQSxJQUFlO0FBQUEsSUFBZTtBQUFBLElBQzdFO0FBQUEsSUFBbUI7QUFBQSxJQUFtQjtBQUFBLElBQWlCO0FBQUEsSUFBZTtBQUFBLElBQ3RFO0FBQUEsSUFBZ0I7QUFBQSxJQUFjO0FBQUEsSUFBZ0I7QUFBQSxJQUFnQjtBQUFBLElBQzlEO0FBQUEsSUFBa0I7QUFBQSxJQUFRO0FBQUEsSUFBZ0I7QUFBQSxJQUMxQztBQUFBLElBQWdDO0FBQUEsSUFBa0M7QUFBQSxJQUNsRTtBQUFBLElBQTRCO0FBQUEsSUFBc0I7QUFBQSxJQUNsRDtBQUFBLElBQW1DO0FBQUEsSUFBMEI7QUFBQSxJQUM3RDtBQUFBLElBQStCO0FBQUEsSUFBc0I7QUFBQSxJQUNyRDtBQUFBLElBQXdCO0FBQUEsSUFBa0I7QUFBQSxJQUEyQjtBQUFBLElBQ3JFO0FBQUEsSUFBNEI7QUFBQSxJQUEwQjtBQUFBLElBQVc7QUFBQSxJQUNqRTtBQUFBLElBQTJCO0FBQUEsSUFBb0M7QUFBQSxJQUMvRDtBQUFBLElBQThCO0FBQUEsSUFBZ0M7QUFBQSxJQUFjO0FBQUEsSUFDNUU7QUFBQSxJQUF1QjtBQUFBLElBQVM7QUFBQSxJQUFhO0FBQUEsSUFDN0M7QUFBQSxJQUFjO0FBQUEsSUFBYztBQUFBLElBQXVDO0FBQUEsSUFBYztBQUFBLElBQ2pGO0FBQUEsSUFBMEI7QUFBQSxJQUE0QjtBQUFBLElBQTRCO0FBQUEsSUFDbEY7QUFBQSxJQUFtQztBQUFBLElBQTZCO0FBQUEsSUFBMEI7QUFBQSxJQUMxRjtBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYSxPQUFPLEVBQUUsS0FBSyxNQUFNO0FBQzlDLFFBQU0sTUFBTSxRQUFRLE1BQU0sUUFBUSxJQUFJLEdBQUcsRUFBRTtBQUczQyxNQUFJO0FBQ0YsYUFBUywwQ0FBMEMsRUFBRSxPQUFPLFVBQVUsQ0FBQztBQUFBLEVBQ3pFLFNBQVMsS0FBSztBQUNaLFlBQVEsTUFBTSxtRUFBbUUsSUFBSSxPQUFPO0FBQUEsRUFDOUY7QUFFQSxRQUFNLGdCQUFnQixNQUFNLHlCQUF5QixHQUFHO0FBR3hELFVBQVEsSUFBSSx5QkFBMEIsSUFBSSwwQkFBMkI7QUFDckUsVUFBUSxJQUFJLHNCQUEwQixJQUFJLHVCQUEyQjtBQUNyRSxVQUFRLElBQUksMEJBQTBCLElBQUksMkJBQTJCO0FBQ3JFLFVBQVEsSUFBSSxxQkFBMEIsSUFBSSxzQkFBc0I7QUFFaEUsUUFBTSxpQkFBaUIsSUFBSSxtQkFBbUIsSUFBSSxjQUFjO0FBQ2hFLFFBQU0sZUFBZSxtQkFBbUI7QUFFeEMsUUFBTSxhQUFhLGVBQ2QsSUFBSSx3QkFBd0IsQ0FBQyxJQUFJLHFCQUFxQixTQUFTLFdBQVcsSUFBSSxJQUFJLHVCQUF1QixxQkFDekcsSUFBSSx3QkFBd0I7QUFFakMsUUFBTSxpQkFBaUIsZUFDbEIsSUFBSSw0QkFBNEIsQ0FBQyxJQUFJLHlCQUF5QixTQUFTLFdBQVcsSUFBSSxJQUFJLDJCQUEyQiwrQkFDckgsSUFBSSw0QkFBNEI7QUFFckMsUUFBTSxrQkFBa0IsSUFBSSwwQkFBMEI7QUFDdEQsUUFBTSxnQkFBZ0IsSUFBSSx1QkFBdUI7QUFDakQsUUFBTSxtQkFBbUIsSUFBSSwyQkFBMkI7QUFDeEQsUUFBTSxtQkFBbUIsSUFBSSwyQkFBMkI7QUFDeEQsUUFBTSxtQkFBbUIsSUFBSSwyQkFBMkI7QUFFeEQsU0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLE1BQ04sbUNBQW1DLEtBQUssVUFBVSxjQUFjO0FBQUEsTUFDaEUsNENBQTRDLEtBQUssVUFBVSxjQUFjO0FBQUEsTUFDekUsMENBQTBDLEtBQUssVUFBVSxlQUFlO0FBQUEsTUFDeEUsdUNBQXVDLEtBQUssVUFBVSxhQUFhO0FBQUEsTUFDbkUsMkNBQTJDLEtBQUssVUFBVSxnQkFBZ0I7QUFBQSxNQUMxRSwyQ0FBMkMsS0FBSyxVQUFVLGdCQUFnQjtBQUFBLE1BQzFFLDJDQUEyQyxLQUFLLFVBQVUsZ0JBQWdCO0FBQUEsSUFDNUU7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLE1BQU07QUFBQSxRQUNKLFFBQVEsQ0FBQyxRQUFRLGFBQWE7QUFDNUIsZ0JBQU0sZ0JBQWdCLElBQUksNEJBQTRCLElBQUksNEJBQTRCLElBQUksdUJBQXVCO0FBQ2pILGdCQUFNLGlCQUFpQixjQUFjLE1BQU0sR0FBRyxFQUFFLElBQUksT0FBSyxFQUFFLEtBQUssQ0FBQyxFQUFFLE9BQU8sT0FBTztBQUVqRixjQUFJLENBQUMsVUFBVSxlQUFlLFNBQVMsR0FBRyxHQUFHO0FBQzNDLHFCQUFTLE1BQU0sSUFBSTtBQUNuQjtBQUFBLFVBQ0Y7QUFFQSxnQkFBTSxZQUFZLGVBQWUsS0FBSyxhQUFXO0FBQy9DLGdCQUFJLFdBQVcsUUFBUyxRQUFPO0FBQy9CLGdCQUFJO0FBQ0Ysb0JBQU0sYUFBYSxRQUFRLFdBQVcsTUFBTSxJQUFJLElBQUksSUFBSSxPQUFPLElBQUk7QUFDbkUsb0JBQU0sY0FBYyxhQUFhLFdBQVcsV0FBVztBQUN2RCxvQkFBTSxZQUFZLElBQUksSUFBSSxNQUFNO0FBQ2hDLGtCQUFJLFVBQVUsYUFBYSxZQUFhLFFBQU87QUFBQSxZQUNqRCxTQUFTLEdBQUc7QUFBQSxZQUVaO0FBQ0EsbUJBQU87QUFBQSxVQUNULENBQUM7QUFFRCxjQUFJLFdBQVc7QUFDYixxQkFBUyxNQUFNLElBQUk7QUFBQSxVQUNyQixPQUFPO0FBQ0wscUJBQVMsSUFBSSxNQUFNLHFCQUFxQixDQUFDO0FBQUEsVUFDM0M7QUFBQSxRQUNGO0FBQUEsUUFDQSxTQUFTLENBQUMsT0FBTyxRQUFRLE9BQU8sVUFBVSxTQUFTO0FBQUEsUUFDbkQsYUFBYTtBQUFBLE1BQ2Y7QUFBQSxNQUNBLE9BQU87QUFBQSxRQUNMLFlBQVk7QUFBQSxVQUNWLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLFdBQVcsQ0FBQyxPQUFPLGFBQWE7QUFDOUIsa0JBQU0sR0FBRyxZQUFZLENBQUMsVUFBVSxNQUFNLFNBQVM7QUFDN0MsdUJBQVMsYUFBYSxRQUFRO0FBQzlCLHVCQUFTLGFBQWEsUUFBUTtBQUM5Qix1QkFBUyxhQUFhLFNBQVM7QUFDL0IsdUJBQVMsYUFBYSxTQUFTO0FBQy9CLHVCQUFTLGFBQWEsZ0JBQWdCO0FBQ3RDLHVCQUFTLGFBQWEsZ0JBQWdCO0FBQ3RDLHVCQUFTLGFBQWEsZ0JBQWdCO0FBQ3RDLHVCQUFTLGFBQWEsaUJBQWlCO0FBQ3ZDLHVCQUFTLGFBQWEsaUJBQWlCO0FBQ3ZDLHVCQUFTLGFBQWEsa0JBQWtCO0FBQ3hDLHVCQUFTLGFBQWEsa0JBQWtCO0FBQ3hDLHVCQUFTLGFBQWEsbUJBQW1CO0FBQ3pDLHVCQUFTLGFBQWEsbUJBQW1CO0FBQ3pDLHVCQUFTLGFBQWEsa0JBQWtCO0FBQ3hDLHVCQUFTLGFBQWEsa0JBQWtCO0FBQ3hDLG9CQUFNLFlBQVksSUFBSSxJQUFJLGdCQUFnQjtBQUMxQyx1QkFBUyxVQUFVLFFBQVEsVUFBVSxJQUFJO0FBQ3pDLHVCQUFTLFVBQVUsUUFBUSxVQUFVLElBQUk7QUFDekMsdUJBQVMsVUFBVSxjQUFjLDJDQUEyQztBQUFBLFlBQzlFLENBQUM7QUFBQSxVQUNIO0FBQUEsUUFDRjtBQUFBLFFBQ0EsZUFBZTtBQUFBLFVBQ2IsUUFBUTtBQUFBLFVBQ1IsY0FBYztBQUFBLFVBQ2QsUUFBUTtBQUFBLFVBQ1IsV0FBVyxDQUFDLE9BQU8sYUFBYTtBQUM5QixrQkFBTSxHQUFHLFlBQVksQ0FBQyxVQUFVLE1BQU0sU0FBUztBQUM3Qyx1QkFBUyxhQUFhLFFBQVE7QUFDOUIsdUJBQVMsYUFBYSxRQUFRO0FBQzlCLHVCQUFTLGFBQWEsU0FBUztBQUMvQix1QkFBUyxhQUFhLFNBQVM7QUFDL0IsdUJBQVMsYUFBYSxnQkFBZ0I7QUFDdEMsdUJBQVMsYUFBYSxnQkFBZ0I7QUFDdEMsdUJBQVMsYUFBYSxnQkFBZ0I7QUFDdEMsdUJBQVMsYUFBYSxpQkFBaUI7QUFDdkMsdUJBQVMsYUFBYSxpQkFBaUI7QUFDdkMsdUJBQVMsYUFBYSxrQkFBa0I7QUFDeEMsdUJBQVMsYUFBYSxrQkFBa0I7QUFDeEMsdUJBQVMsYUFBYSxtQkFBbUI7QUFDekMsdUJBQVMsYUFBYSxtQkFBbUI7QUFDekMsdUJBQVMsYUFBYSxrQkFBa0I7QUFDeEMsdUJBQVMsYUFBYSxrQkFBa0I7QUFDeEMsb0JBQU0sWUFBWSxJQUFJLElBQUksZ0JBQWdCO0FBQzFDLHVCQUFTLFVBQVUsUUFBUSxVQUFVLElBQUk7QUFDekMsdUJBQVMsVUFBVSxRQUFRLFVBQVUsSUFBSTtBQUN6Qyx1QkFBUyxVQUFVLGNBQWMsMkNBQTJDO0FBQUEsWUFDOUUsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsUUFDQSxnQkFBZ0I7QUFBQSxVQUNkLFFBQVE7QUFBQSxVQUNSLGNBQWM7QUFBQSxVQUNkLFFBQVE7QUFBQSxRQUNWO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLGVBQWU7QUFBQSxRQUNiLE9BQU8sY0FBYztBQUFBLE1BQ3ZCO0FBQUEsSUFDRjtBQUFBLElBQ0EsU0FBUztBQUFBLE1BQ1Asc0JBQXNCO0FBQUEsTUFDdEI7QUFBQSxRQUVFLE1BQU07QUFBQSxRQUNOLG1CQUFtQixNQUFNO0FBQ3ZCLGdCQUFNLGFBQWE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFTbkIsaUJBQU8sS0FDSixRQUFRLFVBQVUsV0FBVyxVQUFVLEVBQ3ZDO0FBQUEsWUFDQztBQUFBLFlBQ0EsK0NBQStDLFVBQVU7QUFBQSxvREFDbkIsZUFBZTtBQUFBLGlEQUNsQixhQUFhO0FBQUEscURBQ1QsZ0JBQWdCO0FBQUE7QUFBQSxVQUN6RDtBQUFBLFFBQ0o7QUFBQSxNQUNGO0FBQUEsTUFDRjtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsY0FBSSxRQUFRLElBQUksYUFBYSxjQUFjO0FBQ3pDLG1CQUFPLFlBQVksSUFBSSxDQUFDLEtBQUssS0FBSyxTQUFTO0FBQ3pDLG9CQUFNLFdBQVcsSUFBSSxPQUFPLElBQUksTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUM1QyxvQkFBTSxZQUFZLFFBQVEsV0FBVyxHQUFHLElBQUksVUFBVSxNQUFNO0FBQzVELG9CQUFNLE1BQU0sSUFBSSxPQUFPLElBQUksU0FBUyxHQUFHLElBQUksSUFBSSxJQUFJLE1BQU0sSUFBSSxJQUFJLFFBQVEsR0FBRyxDQUFDLElBQUk7QUFFakYsa0JBQUksY0FBYyxlQUFlO0FBQy9CLHNCQUFNLFdBQVdBLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxtQkFBbUI7QUFDN0Qsb0JBQUlELElBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0Isd0JBQU0sY0FBY0EsSUFBRyxhQUFhLFVBQVUsT0FBTztBQUNyRCxzQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLHNCQUFJLElBQUksV0FBVztBQUNuQjtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUNBLGtCQUFJLGNBQWMsZUFBZSxjQUFjLFVBQVUsY0FBYyxTQUFTO0FBQzlFLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLGdDQUFnQyxFQUFFO0FBQzVELG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLG9DQUFvQztBQUNwRCxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxnQ0FBZ0MsRUFBRTtBQUM1RCxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxpQ0FBaUMsY0FBYyxnQ0FBZ0M7QUFDL0Ysc0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLHlDQUF5QztBQUNuRixvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxjQUFjO0FBQzlCLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLFVBQVUsRUFBRTtBQUN0QyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxXQUFXLGNBQWMsVUFBVTtBQUNuRCxzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsV0FBVztBQUNyRCxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxpQkFBaUI7QUFDakMsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksYUFBYSxFQUFFO0FBQ3pDLG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLGNBQWMsY0FBYyxhQUFhO0FBQ3pELHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxjQUFjO0FBQ3hELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLGFBQWE7QUFDN0Isb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksU0FBUyxFQUFFO0FBQ3JDLG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLFVBQVUsY0FBYyxTQUFTO0FBQ2pELHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxVQUFVO0FBQ3BELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLHlCQUF5QjtBQUN6QyxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxxQkFBcUIsRUFBRTtBQUNqRCxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxzQkFBc0IsY0FBYyxxQkFBcUI7QUFDekUsc0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLHNCQUFzQjtBQUNoRSxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxrQkFBa0I7QUFDbEMsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksY0FBYyxFQUFFO0FBQzFDLG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLGVBQWUsY0FBYyxjQUFjO0FBQzNELHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxlQUFlO0FBQ3pELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLG9CQUFvQjtBQUNwQyxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxnQkFBZ0IsRUFBRTtBQUM1QyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxpQkFBaUIsY0FBYyxnQkFBZ0I7QUFDL0Qsc0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLGlCQUFpQjtBQUMzRCxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxrQkFBa0I7QUFDbEMsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksY0FBYyxFQUFFO0FBQzFDLG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLGVBQWUsY0FBYyxjQUFjO0FBQzNELHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxlQUFlO0FBQ3pELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLHFCQUFxQjtBQUNyQyxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxpQkFBaUIsRUFBRTtBQUM3QyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxrQkFBa0IsY0FBYyxpQkFBaUI7QUFDakUsc0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLGtCQUFrQjtBQUM1RCxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYywrQkFBK0I7QUFDL0Msb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksMkJBQTJCLEVBQUU7QUFDdkQsb0JBQUksSUFBSTtBQUNSO0FBQUEsY0FDRjtBQUNBLGtCQUFJLGNBQWMsNEJBQTRCLGNBQWMsMkJBQTJCO0FBQ3JGLHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyw0QkFBNEI7QUFDdEUsb0JBQUlELElBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0Isd0JBQU0sY0FBY0EsSUFBRyxhQUFhLFVBQVUsT0FBTztBQUNyRCxzQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLHNCQUFJLElBQUksV0FBVztBQUNuQjtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUNBLGtCQUFJLGNBQWMsdUJBQXVCO0FBQ3ZDLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLG1CQUFtQixFQUFFO0FBQy9DLG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxVQUFVLFdBQVcsZ0JBQWdCLEdBQUc7QUFDMUMsc0JBQU0sV0FBVyxVQUFVLE1BQU0sR0FBRyxFQUFFLE9BQU8sT0FBTztBQUNwRCxvQkFBSSxTQUFTLFdBQVcsR0FBRztBQUN6Qix3QkFBTSxPQUFPLFNBQVMsQ0FBQztBQUN2QixzQkFBSSxjQUFjLFNBQVMsSUFBSSxHQUFHO0FBQ2hDLDBCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyx1QkFBdUI7QUFDakUsd0JBQUlELElBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0IsMEJBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QywwQkFBSSxJQUFJQSxJQUFHLGFBQWEsVUFBVSxPQUFPLENBQUM7QUFDMUM7QUFBQSxvQkFDRjtBQUFBLGtCQUNGLE9BQU87QUFDTCwwQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcscUJBQXFCO0FBQy9ELHdCQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLDBCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsMEJBQUksSUFBSUEsSUFBRyxhQUFhLFVBQVUsT0FBTyxDQUFDO0FBQzFDO0FBQUEsb0JBQ0Y7QUFBQSxrQkFDRjtBQUFBLGdCQUNGLE9BQU87QUFDTCx3QkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsdUJBQXVCO0FBQ2pFLHNCQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsd0JBQUksSUFBSUEsSUFBRyxhQUFhLFVBQVUsT0FBTyxDQUFDO0FBQzFDO0FBQUEsa0JBQ0Y7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFFQSxrQkFBSSxjQUFjLHlCQUF5QjtBQUN6QyxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxtQkFBbUIsRUFBRTtBQUMvQyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxzQkFBc0IsY0FBYyx1QkFBd0IsVUFBVSxXQUFXLG1CQUFtQixLQUFLLENBQUMsVUFBVSxXQUFXLG1CQUFtQixHQUFJO0FBQ3RLLHNCQUFNLFdBQVcsVUFBVSxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQU87QUFDcEQsb0JBQUksU0FBUyxDQUFDLE1BQU0scUJBQXFCLFNBQVMsV0FBVyxHQUFHO0FBRTlELHdCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxxQkFBcUI7QUFDL0Qsc0JBQUlELElBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0Isd0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6Qyx3QkFBSSxJQUFJQSxJQUFHLGFBQWEsVUFBVSxPQUFPLENBQUM7QUFDMUM7QUFBQSxrQkFDRjtBQUFBLGdCQUNGLE9BQU87QUFFTCxzQkFBSSxhQUFhO0FBQ2pCLHNCQUFJLFVBQVUsWUFBWSxtQkFBbUIsRUFBRTtBQUMvQyxzQkFBSSxJQUFJO0FBQ1I7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLDBCQUEwQjtBQUMxQyxvQkFBSSxhQUFhO0FBQ2pCLG9CQUFJLFVBQVUsWUFBWSxzQkFBc0IsRUFBRTtBQUNsRCxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksVUFBVSxXQUFXLG1CQUFtQixHQUFHO0FBQzdDLHNCQUFNLFdBQVcsVUFBVSxNQUFNLEdBQUcsRUFBRSxPQUFPLE9BQU87QUFDcEQsb0JBQUksU0FBUyxXQUFXLEdBQUc7QUFDekIsd0JBQU0sT0FBTyxTQUFTLENBQUM7QUFDdkIsc0JBQUksY0FBYyxTQUFTLElBQUksR0FBRztBQUNoQywwQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsdUJBQXVCO0FBQ2pFLHdCQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLDBCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsMEJBQUksSUFBSUEsSUFBRyxhQUFhLFVBQVUsT0FBTyxDQUFDO0FBQzFDO0FBQUEsb0JBQ0Y7QUFBQSxrQkFDRixPQUFPO0FBQ0wsMEJBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLHFCQUFxQjtBQUMvRCx3QkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQiwwQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLDBCQUFJLElBQUlBLElBQUcsYUFBYSxVQUFVLE9BQU8sQ0FBQztBQUMxQztBQUFBLG9CQUNGO0FBQUEsa0JBQ0Y7QUFBQSxnQkFDRixPQUFPO0FBQ0wsd0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLHVCQUF1QjtBQUNqRSxzQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLHdCQUFJLElBQUlBLElBQUcsYUFBYSxVQUFVLE9BQU8sQ0FBQztBQUMxQztBQUFBLGtCQUNGO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyx3QkFBd0I7QUFDeEMsb0JBQUksYUFBYTtBQUNqQixvQkFBSSxVQUFVLFlBQVksb0JBQW9CLEVBQUU7QUFDaEQsb0JBQUksSUFBSTtBQUNSO0FBQUEsY0FDRjtBQUNBLGtCQUFJLGNBQWMscUJBQXFCLGNBQWMsb0JBQW9CO0FBQ3ZFLHNCQUFNLFdBQVdDLE1BQUssS0FBSyxRQUFRLElBQUksR0FBRyxxQkFBcUI7QUFDL0Qsb0JBQUlELElBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0Isd0JBQU0sY0FBY0EsSUFBRyxhQUFhLFVBQVUsT0FBTztBQUNyRCxzQkFBSSxVQUFVLGdCQUFnQixXQUFXO0FBQ3pDLHNCQUFJLElBQUksV0FBVztBQUNuQjtBQUFBLGdCQUNGO0FBQUEsY0FDRjtBQUNBLGtCQUFJLGNBQWMseUJBQXlCO0FBQ3pDLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLHFCQUFxQixFQUFFO0FBQ2pELG9CQUFJLElBQUk7QUFDUjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLHNCQUFzQixjQUFjLHFCQUFxQjtBQUN6RSxzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsc0JBQXNCO0FBQ2hFLG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLG9CQUFvQixjQUFjLGVBQWUsY0FBYyxjQUFjO0FBQzdGLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLFVBQVUsRUFBRTtBQUN0QyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYywwQkFBMEIsY0FBYyxxQkFBcUIsY0FBYyxvQkFBb0I7QUFDL0csc0JBQU0sV0FBV0MsTUFBSyxLQUFLLFFBQVEsSUFBSSxHQUFHLGtCQUFrQjtBQUM1RCxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxjQUFjO0FBQzlCLG9CQUFJLGFBQWE7QUFDakIsb0JBQUksVUFBVSxZQUFZLFVBQVUsRUFBRTtBQUN0QyxvQkFBSSxJQUFJO0FBQ1I7QUFBQSxjQUNGO0FBQ0Esa0JBQUksY0FBYyxXQUFXLGNBQWMsVUFBVTtBQUNuRCxzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsV0FBVztBQUNyRCxvQkFBSUQsSUFBRyxXQUFXLFFBQVEsR0FBRztBQUMzQix3QkFBTSxjQUFjQSxJQUFHLGFBQWEsVUFBVSxPQUFPO0FBQ3JELHNCQUFJLFVBQVUsZ0JBQWdCLFdBQVc7QUFDekMsc0JBQUksSUFBSSxXQUFXO0FBQ25CO0FBQUEsZ0JBQ0Y7QUFBQSxjQUNGO0FBQ0Esa0JBQUksVUFBVSxXQUFXLFFBQVEsS0FBSyxVQUFVLE1BQU0sR0FBRyxFQUFFLE9BQU8sT0FBTyxFQUFFLFVBQVUsR0FBRztBQUN0RixzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsa0JBQWtCO0FBQzVELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxrQkFBSSxjQUFjLE9BQU8sY0FBYyxXQUFXLGNBQWMsVUFBVTtBQUN4RSxzQkFBTSxXQUFXQyxNQUFLLEtBQUssUUFBUSxJQUFJLEdBQUcsbUJBQW1CO0FBQzdELG9CQUFJRCxJQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLHdCQUFNLGNBQWNBLElBQUcsYUFBYSxVQUFVLE9BQU87QUFDckQsc0JBQUksVUFBVSxnQkFBZ0IsV0FBVztBQUN6QyxzQkFBSSxJQUFJLFdBQVc7QUFDbkI7QUFBQSxnQkFDRjtBQUFBLGNBQ0Y7QUFDQSxtQkFBSztBQUFBLFlBQ1AsQ0FBQztBQUFBLFVBQ0g7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0EsQ0FBQzsiLAogICJuYW1lcyI6IFsiZnMiLCAicGF0aCIsICJmcyIsICJwYXRoIl0KfQo=
