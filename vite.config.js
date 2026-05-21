import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

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

export default defineConfig({
  build: {
    rollupOptions: {
      input: getHtmlInputs()
    }
  },
  plugins: [
    {
      name: 'pap-tsx-rewrite',
      configureServer(server) {
        if (process.env.NODE_ENV !== 'production') {
          server.middlewares.use((req, res, next) => {
            const urlPath = (req.url || '').split('?')[0];
            const cleanPath = urlPath.startsWith('/') ? urlPath : '/' + urlPath;
            
            if (cleanPath === '/pap' || cleanPath === '/pap/') {
              const htmlPath = path.join(process.cwd(), 'pap-preview.html');
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
});
