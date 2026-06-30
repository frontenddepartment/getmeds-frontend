import { defineConfig, loadEnv } from 'vite';
import fs from 'fs';
import path from 'path';
import https from 'https';

const getHtmlInputs = () => {
  const dir = process.cwd();
  const files = fs.readdirSync(dir);
  const htmlFiles = files.filter(f => f.endsWith('.html'));
  const inputs = {};
  htmlFiles.forEach(file => {
    const name = file.replace(/\.html$/, '');
    inputs[name] = path.resolve(dir, file);
  });
  return inputs;
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const deploymentMode = env.VITE_DEPLOYMENT || env.DEPLOYMENT || 'development';
  const isProduction = deploymentMode === 'production';

  const chatbotUrl = isProduction
    ? (env.VITE_CHATBOT_API_URL && !env.VITE_CHATBOT_API_URL.includes('localhost') ? env.VITE_CHATBOT_API_URL : '/api/chatbot/ask')
    : (env.VITE_CHATBOT_API_URL || 'http://localhost:8000/api/chatbot/ask');

  const spreadsheetUrl = isProduction
    ? (env.VITE_SPREADSHEET_API_URL && !env.VITE_SPREADSHEET_API_URL.includes('localhost') ? env.VITE_SPREADSHEET_API_URL : '/api/append-to-spreadsheet')
    : (env.VITE_SPREADSHEET_API_URL || 'http://localhost:3333/api/append-to-spreadsheet');

  const sanityProjectId = env.VITE_SANITY_PROJECT_ID || 's7ocz8zp';
  const sanityDataset = env.VITE_SANITY_DATASET || 'production';
  const sanityApiVersion = env.VITE_SANITY_API_VERSION || '2024-01-01';
  const wordpressApiBase = env.VITE_WORDPRESS_API_BASE || '/wp-json/wp/v2';
  const wordpressApiRoot = env.VITE_WORDPRESS_API_ROOT || 'https://cms.getmeds.ph';

  return {
    define: {
      'import.meta.env.VITE_DEPLOYMENT': JSON.stringify(deploymentMode),
      'import.meta.env.VITE_SPREADSHEET_API_URL': JSON.stringify(spreadsheetUrl),
      'import.meta.env.VITE_SANITY_PROJECT_ID': JSON.stringify(sanityProjectId),
      'import.meta.env.VITE_SANITY_DATASET': JSON.stringify(sanityDataset),
      'import.meta.env.VITE_SANITY_API_VERSION': JSON.stringify(sanityApiVersion),
      'import.meta.env.VITE_WORDPRESS_API_BASE': JSON.stringify(wordpressApiBase),
      'import.meta.env.VITE_WORDPRESS_API_ROOT': JSON.stringify(wordpressApiRoot)
    },
    server: {
      cors: {
        origin: (origin, callback) => {
          const allowedString = env.VITE_CORS_ALLOWED_ORIGIN || env.CORS_ALLOWED_ORIGIN || '*';
          const allowedOrigins = allowedString.split(',').map(o => o.trim()).filter(Boolean);
          if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true
      },
      proxy: {
        '/wp-json': {
          target: wordpressApiRoot,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('proxyReq', (proxyReq, _req, _res) => {
              proxyReq.removeHeader('origin');
              proxyReq.removeHeader('Origin');
              proxyReq.removeHeader('referer');
              proxyReq.removeHeader('Referer');
              proxyReq.removeHeader('sec-fetch-site');
              proxyReq.removeHeader('sec-fetch-mode');
              proxyReq.removeHeader('sec-fetch-dest');
              proxyReq.removeHeader('x-forwarded-for');
              proxyReq.removeHeader('X-Forwarded-For');
              proxyReq.removeHeader('x-forwarded-host');
              proxyReq.removeHeader('X-Forwarded-Host');
              proxyReq.removeHeader('x-forwarded-proto');
              proxyReq.removeHeader('X-Forwarded-Proto');
              proxyReq.removeHeader('x-forwarded-port');
              proxyReq.removeHeader('X-Forwarded-Port');
              const targetUrl = new URL(wordpressApiRoot);
              proxyReq.setHeader('Host', targetUrl.host);
              proxyReq.setHeader('host', targetUrl.host);
              proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
            });
          }
        },
        '/api/careers': {
          target: 'https://getmeds-test-creation.vercel.app',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      rollupOptions: {
        input: getHtmlInputs()
      }
    },
    plugins: [
      {
        name: 'inject-chatbot-meta',
        transformIndexHtml(html) {
          const suppressor = `\n  <script>
    (function() {
      var w = console.warn;
      console.warn = function() {
        if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].indexOf('cdn.tailwindcss.com') !== -1) return;
        w.apply(console, arguments);
      };
    })();
  </script>`;
          return html
            .replace('<head>', '<head>' + suppressor)
            .replace(
              '</head>',
              `  <meta name="getmeds-chatbot-api" content="${chatbotUrl}" />
  <meta name="getmeds-sanity-project-id" content="${sanityProjectId}" />
  <meta name="getmeds-sanity-dataset" content="${sanityDataset}" />
  <meta name="getmeds-sanity-api-version" content="${sanityApiVersion}" />\n</head>`
            );
        }
      },
    {
      name: 'pap-tsx-rewrite',
      configureServer(server) {
        if (process.env.NODE_ENV !== 'production') {
          server.middlewares.use((req, res, next) => {
            const urlPath = (req.url || '').split('?')[0];
            const cleanPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
            const qs = (req.url || '').includes('?') ? req.url.slice(req.url.indexOf('?')) : '';
            
            if (cleanPath === '/index.html') {
              const htmlPath = path.join(process.cwd(), 'home-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/pap.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/pap' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/pap' || cleanPath === '/pap/') {
              const htmlPath = path.join(process.cwd(), 'pap-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/ungc.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/ungc' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/ungc' || cleanPath === '/ungc/') {
              const htmlPath = path.join(process.cwd(), 'ungc.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/careers.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/careers' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/careers' || cleanPath === '/careers/') {
              const htmlPath = path.join(process.cwd(), 'careers.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/csr.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/csr' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/csr' || cleanPath === '/csr/') {
              const htmlPath = path.join(process.cwd(), 'csr.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/global-presence.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/global-presence' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/global-presence' || cleanPath === '/global-presence/') {
              const htmlPath = path.join(process.cwd(), 'global-presence.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/services.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/services' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/services' || cleanPath === '/services/') {
              const htmlPath = path.join(process.cwd(), 'services.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/contact-us.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/contact-us' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/contact-us' || cleanPath === '/contact-us/') {
              const htmlPath = path.join(process.cwd(), 'contact-us.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/about-us.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/about-us' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/about-us' || cleanPath === '/about-us/') {
              const htmlPath = path.join(process.cwd(), 'about-us.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/meditations.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/meditations' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/meditations' || cleanPath === '/meditations/') {
              const htmlPath = path.join(process.cwd(), 'meditations.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/product-range.html' || cleanPath === '/product-range' || cleanPath === '/product-range/') {
              res.statusCode = 301;
              res.setHeader('Location', '/cancer-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/cancer-medicines.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/cancer-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath.startsWith('/cancer-medicines')) {
              const segments = cleanPath.split('/').filter(Boolean);
              if (segments.length === 2) {
                const slug = segments[1];
                const subcategories = [
                  'breast-cancer', 'ovarian-cancer', 'lung-cancer', 'prostate-cancer', 'colorectal-cancer',
                  'pancreatic-cancer', 'aml', 'cml', 'lymphoma', 'sickle-cell', 'respiratory', 'uti',
                  'skin-infections', 'bone-infections', 'endometriosis', 'fibrocystic', 'multiple-myeloma',
                  'osteoporosis', 'arrhythmia', 'hypertension', 'glioblastoma', 'allergic-rhinitis',
                  'kidney-disease', 'pain', 'rheumatology'
                ];
                if (subcategories.includes(slug)) {
                  const htmlPath = path.join(process.cwd(), 'cancer-medicines.html');
                  if (fs.existsSync(htmlPath)) {
                    res.setHeader('Content-Type', 'text/html');
                    res.end(fs.readFileSync(htmlPath, 'utf-8'));
                    return;
                  }
                } else {
                  const htmlPath = path.join(process.cwd(), 'product-detail.html');
                  if (fs.existsSync(htmlPath)) {
                    res.setHeader('Content-Type', 'text/html');
                    res.end(fs.readFileSync(htmlPath, 'utf-8'));
                    return;
                  }
                }
              } else {
                const htmlPath = path.join(process.cwd(), 'cancer-medicines.html');
                if (fs.existsSync(htmlPath)) {
                  res.setHeader('Content-Type', 'text/html');
                  res.end(fs.readFileSync(htmlPath, 'utf-8'));
                  return;
                }
              }
            }
            if (cleanPath === '/product-detail.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/product-detail' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/product-detail' || cleanPath === '/product-detail/') {
              const htmlPath = path.join(process.cwd(), 'product-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/order-medicines.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/order-medicines' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/order-medicines' || cleanPath === '/order-medicines/') {
              const htmlPath = path.join(process.cwd(), 'order-medicines.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/articles.html' || cleanPath === '/articles' || cleanPath === '/articles/') {
              res.statusCode = 301;
              res.setHeader('Location', '/blog' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/article-detail.html' || cleanPath === '/article-detail' || cleanPath === '/article-detail/') {
              const htmlPath = path.join(process.cwd(), 'blog-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/blog.html') {
              res.statusCode = 302;
              res.setHeader('Location', '/blog' + qs);
              res.end();
              return;
            }
            if (cleanPath === '/blog' || cleanPath === '/blog/') {
              const htmlPath = path.join(process.cwd(), 'blog.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath.startsWith('/blog/') && cleanPath.split('/').filter(Boolean).length >= 2) {
              const htmlPath = path.join(process.cwd(), 'blog-detail.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
                res.end(htmlContent);
                return;
              }
            }
            if (cleanPath === '/' || cleanPath === '/home' || cleanPath === '/home/') {
              const htmlPath = path.join(process.cwd(), 'home-preview.html');
              if (fs.existsSync(htmlPath)) {
                const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
                res.setHeader('Content-Type', 'text/html');
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
