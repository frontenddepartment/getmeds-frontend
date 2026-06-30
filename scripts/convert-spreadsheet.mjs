/**
 * Convert your Excel spreadsheet CSV export to products-data.json
 *
 * HOW TO USE:
 *  1. Open your Excel spreadsheet
 *  2. File → Save As → CSV (comma-separated values)
 *  3. Save it as: scripts/products-raw.csv
 *  4. Run: node scripts/convert-spreadsheet.mjs
 *  5. This creates scripts/products-data.json ready for bulk-update-indications.mjs
 *
 * Expected CSV columns (header row):
 *   GENERIC NAME, PROPOSED BRAND NAME, STRENGTH, FORM, INDICATIONS, DOSAGE & ADMINISTRATION
 *   (column names are flexible — the script maps common variations)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const csvFile = path.join(__dirname, 'products-raw.csv');
if (!fs.existsSync(csvFile)) {
  console.error('\n❌  File not found: scripts/products-raw.csv');
  console.error('   Export your spreadsheet as CSV and save it there.\n');
  process.exit(1);
}

const raw = fs.readFileSync(csvFile, 'utf-8');
const lines = raw.split('\n').filter(l => l.trim());

// Parse CSV (handles quoted fields with commas inside)
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

// Map flexible column names to standard keys
function findCol(headers, ...candidates) {
  for (const c of candidates) {
    const idx = headers.findIndex(h => h.includes(c));
    if (idx !== -1) return idx;
  }
  return -1;
}

const colGeneric   = findCol(headers, 'generic', 'genericname');
const colBrand     = findCol(headers, 'brand', 'brandname', 'proposedbrands');
const colStrength  = findCol(headers, 'strength');
const colForm      = findCol(headers, 'form');
const colIndic     = findCol(headers, 'indication');
const colDosage    = findCol(headers, 'dosage', 'administration');

console.log('\n📋  Column mapping:');
console.log(`   Generic Name:          col ${colGeneric}`);
console.log(`   Brand Name:            col ${colBrand}`);
console.log(`   Strength:              col ${colStrength}`);
console.log(`   Form:                  col ${colForm}`);
console.log(`   Indications:           col ${colIndic}`);
console.log(`   Dosage/Admin:          col ${colDosage}`);

const products = [];

for (let i = 1; i < lines.length; i++) {
  const cols = parseCSVLine(lines[i]);
  if (!cols.some(c => c.trim())) continue; // skip empty rows

  const entry = {
    genericName:          colGeneric  >= 0 ? cols[colGeneric]  || '' : '',
    brandName:            colBrand    >= 0 ? cols[colBrand]    || '' : '',
    strength:             colStrength >= 0 ? cols[colStrength] || '' : '',
    form:                 colForm     >= 0 ? cols[colForm]     || '' : '',
    indications:          colIndic    >= 0 ? cols[colIndic]    || '' : '',
    dosageAdministration: colDosage   >= 0 ? cols[colDosage]   || '' : '',
  };

  if (entry.genericName || entry.brandName) {
    products.push(entry);
  }
}

const outFile = path.join(__dirname, 'products-data.json');
fs.writeFileSync(outFile, JSON.stringify(products, null, 2));

console.log(`\n✅  Converted ${products.length} rows → scripts/products-data.json`);
console.log('   Now run: node scripts/bulk-update-indications.mjs\n');
