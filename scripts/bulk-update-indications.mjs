/**
 * Bulk update product indications and dosage/administration in Sanity.
 *
 * HOW TO USE:
 *  1. Add your Sanity write token to .env:  SANITY_WRITE_TOKEN=sk...
 *  2. Put your spreadsheet data in scripts/products-data.json (see format below)
 *  3. Run:  node scripts/bulk-update-indications.mjs
 *
 * products-data.json format:
 * [
 *   {
 *     "genericName": "Abiraterone Acetate",
 *     "brandName": "AbiraGet",
 *     "indications": "...",           // leave empty "" to auto-fetch from FDA
 *     "dosageAdministration": "..."   // leave empty "" to auto-fetch from FDA
 *   },
 *   ...
 * ]
 *
 * If you leave indications/dosageAdministration blank, the script
 * will automatically fetch them from the FDA OpenFDA API.
 */

import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ──────────────────────────────────────────────────────────────────

const SANITY_PROJECT_ID = process.env.VITE_SANITY_PROJECT_ID || 's7ocz8zp';
const SANITY_DATASET    = process.env.VITE_SANITY_DATASET    || 'production';
const SANITY_API_VERSION = '2024-01-01';
const SANITY_WRITE_TOKEN = process.env.SANITY_WRITE_TOKEN;  // required for writes

if (!SANITY_WRITE_TOKEN) {
  console.error('\n❌  SANITY_WRITE_TOKEN is not set.');
  console.error('   Get a write token from https://sanity.io/manage → project → API → Tokens');
  console.error('   Add it to your .env:  SANITY_WRITE_TOKEN=sk...\n');
  process.exit(1);
}

const client = createClient({
  projectId: SANITY_PROJECT_ID,
  dataset: SANITY_DATASET,
  apiVersion: SANITY_API_VERSION,
  token: SANITY_WRITE_TOKEN,
  useCdn: false,
});

// ─── FDA API ──────────────────────────────────────────────────────────────────

/**
 * Fetch indication + dosage text from FDA OpenFDA drug label API.
 * Docs: https://open.fda.gov/apis/drug/label/
 */
async function fetchFromFDA(genericName) {
  const query = encodeURIComponent(`generic_name:"${genericName}"`);
  const url = `https://api.fda.gov/drug/label.json?search=${query}&limit=1`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      // Try a looser search if exact match fails
      const looseQuery = encodeURIComponent(genericName);
      const looseRes = await fetch(`https://api.fda.gov/drug/label.json?search=${looseQuery}&limit=1`);
      if (!looseRes.ok) return null;
      const looseData = await looseRes.json();
      return extractFDAFields(looseData);
    }
    const data = await res.json();
    return extractFDAFields(data);
  } catch (err) {
    console.warn(`   ⚠️  FDA API error for "${genericName}":`, err.message);
    return null;
  }
}

function extractFDAFields(data) {
  const result = data?.results?.[0];
  if (!result) return null;

  // FDA returns arrays of text — join into one string
  const indications = result.indications_and_usage?.join(' ')
    || result.purpose?.join(' ')
    || null;

  const dosage = result.dosage_and_administration?.join(' ')
    || result.dosage_forms_and_strengths?.join(' ')
    || null;

  return { indications, dosageAdministration: dosage };
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

async function main() {
  // Load your spreadsheet data
  const dataFile = path.join(__dirname, 'products-data.json');
  if (!fs.existsSync(dataFile)) {
    // Create a sample file so the user knows what format to use
    const sample = [
      {
        "genericName": "Abiraterone Acetate",
        "brandName": "AbiraGet",
        "indications": "",
        "dosageAdministration": ""
      },
      {
        "genericName": "Sorafenib",
        "brandName": "SoraGet",
        "indications": "",
        "dosageAdministration": ""
      }
    ];
    fs.writeFileSync(dataFile, JSON.stringify(sample, null, 2));
    console.log(`\n📄  Created sample file at scripts/products-data.json`);
    console.log('   Fill it in with your products and run again.\n');
    return;
  }

  const products = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));
  console.log(`\n🚀  Processing ${products.length} products...\n`);

  // Fetch all Sanity products once (avoid N+1 queries)
  const sanityProducts = await client.fetch(
    `*[_type == "product"]{ _id, name, genericName, brandName, indications, dosageAdministration }`
  );
  console.log(`✅  Loaded ${sanityProducts.length} products from Sanity\n`);

  const results = { updated: 0, skipped: 0, notFound: 0, fdaFetched: 0, errors: 0 };

  for (const row of products) {
    const name = row.genericName || row.brandName || '';
    process.stdout.write(`⏳  ${name} ... `);

    // Match by genericName or brandName (case-insensitive)
    const match = sanityProducts.find(p =>
      p.genericName?.toLowerCase() === row.genericName?.toLowerCase() ||
      p.brandName?.toLowerCase() === row.brandName?.toLowerCase() ||
      p.name?.toLowerCase() === row.brandName?.toLowerCase()
    );

    if (!match) {
      console.log(`❌  Not found in Sanity`);
      results.notFound++;
      continue;
    }

    // Use spreadsheet data if provided, otherwise fetch from FDA
    let indications = row.indications?.trim() || null;
    let dosageAdministration = row.dosageAdministration?.trim() || null;

    if (!indications || !dosageAdministration) {
      const fda = await fetchFromFDA(row.genericName || row.brandName);
      if (fda) {
        if (!indications) indications = fda.indications;
        if (!dosageAdministration) dosageAdministration = fda.dosageAdministration;
        results.fdaFetched++;
      }
    }

    // Skip if nothing to update
    if (!indications && !dosageAdministration) {
      console.log(`⏭️   No data available`);
      results.skipped++;
      continue;
    }

    // Build patch — only update fields that have new data
    const patch = {};
    if (indications) patch.indications = indications;
    if (dosageAdministration) patch.dosageAdministration = dosageAdministration;

    try {
      await client.patch(match._id).set(patch).commit();
      console.log(`✅  Updated (${Object.keys(patch).join(', ')})`);
      results.updated++;
    } catch (err) {
      console.log(`❌  Sanity error: ${err.message}`);
      results.errors++;
    }

    // Be polite to the FDA API — small delay between requests
    await new Promise(r => setTimeout(r, 300));
  }

  console.log('\n─────────────────────────────────────');
  console.log(`✅  Updated:      ${results.updated}`);
  console.log(`🌐  FDA fetched:  ${results.fdaFetched}`);
  console.log(`⏭️   Skipped:      ${results.skipped}`);
  console.log(`❌  Not found:    ${results.notFound}`);
  console.log(`💥  Errors:       ${results.errors}`);
  console.log('─────────────────────────────────────\n');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
