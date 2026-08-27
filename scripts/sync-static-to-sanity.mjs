import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@sanity/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file manually if process.env values are missing
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const [key, ...valueParts] = trimmed.split('=');
      const val = valueParts.join('=').trim();
      if (key && !process.env[key]) {
        process.env[key] = val;
      }
    }
  });
}

const projectId = process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || 's7ocz8zp';
const dataset = process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production';
const apiVersion = process.env.VITE_SANITY_API_VERSION || '2024-01-01';
const token = process.env.SANITY_AUTH_TOKEN || process.env.SANITY_WRITE_TOKEN || process.env.SANITY_API_TOKEN;

if (!token) {
  console.warn('[Sanity Sync] Warning: SANITY_WRITE_TOKEN or SANITY_AUTH_TOKEN not set. Skipping Sanity database upload.');
  process.exit(0);
}

const client = createClient({
  projectId,
  dataset,
  apiVersion,
  token,
  useCdn: false,
});

const staticDir = path.resolve(__dirname, '../data/static');

async function syncStaticToSanity() {
  if (!fs.existsSync(staticDir)) {
    console.warn(`[Sanity Sync] Warning: static data directory not found at ${staticDir}. Skipping static sync.`);
    process.exit(0);
  }

  const files = fs.readdirSync(staticDir).filter(f => f.endsWith('.json'));
  console.log(`[Sanity Sync] Found ${files.length} static JSON files in data/static/`);
  console.log(`[Sanity Sync] Connecting to Sanity Project: ${projectId}, Dataset: ${dataset}...`);

  let syncedCount = 0;

  for (const file of files) {
    const pageName = path.basename(file, '.json');
    const filePath = path.join(staticDir, file);
    try {
      let rawText = fs.readFileSync(filePath, 'utf8');
      rawText = rawText.replace(/^\uFEFF/, '').trim();
      const parsedData = JSON.parse(rawText);

      const docId = `static-page-${pageName}`;
      const doc = {
        _id: docId,
        _type: 'staticPage',
        pageName: pageName,
        title: parsedData.meta?.title || pageName,
        data: JSON.stringify(parsedData),
        lastSynced: new Date().toISOString(),
      };

      await client.createOrReplace(doc);
      syncedCount++;
      console.log(`  ✓ Synced '${pageName}' -> Sanity ID: '${docId}'`);
    } catch (err) {
      console.error(`  ✗ Error syncing '${file}':`, err.message || err);
    }
  }

  console.log(`[Sanity Sync] Complete! Successfully synced ${syncedCount}/${files.length} pages to Sanity database.`);
}

syncStaticToSanity();
