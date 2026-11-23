// Builds the Philippine address data behind the /qr3 address helper, from the PSA's
// Philippine Standard Geographic Code (PSGC) as published at https://psgc.gitlab.io/api.
//
//   node scripts/build-ph-address.mjs
//
// Writes public/data/ph-address/:
//   places.json        every city and municipality: [code, name, province]
//   brgy/<group>.json  barangays per city, one file per province-sized group (the first five
//                      digits of the PSGC code), so a phone downloads one small file, not 42,000 names.
//
// Run again when the PSA publishes new codes (new barangays, cityhood conversions).
import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const API = 'https://psgc.gitlab.io/api';
const OUT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'ph-address');

async function get(resource) {
  const res = await fetch(`${API}/${resource}/`);
  if (!res.ok) throw new Error(`${resource}: HTTP ${res.status}`);
  return res.json();
}

const [regions, provinces, places, subMunicipalities, barangays] = await Promise.all(
  ['regions', 'provinces', 'cities-municipalities', 'sub-municipalities', 'barangays'].map(get)
);

const regionName = new Map(regions.map((r) => [r.code, r.regionName || r.name]));
const provinceName = new Map(provinces.map((p) => [p.code, p.name]));
// PSGC writes some district numerals in lower case ("Tondo I/ii"); show them as "Tondo I/II".
const romanUpper = (name) => name.replace(/(^|[\s/])([ivx]+)(?=$|[\s/])/gi, (_, lead, numeral) => lead + numeral.toUpperCase());
const subMunName = new Map(subMunicipalities.map((s) => [s.code, romanUpper(s.name)]));
const NCR = '130000000';

/** Province shown after the city: Metro Manila for NCR, the region for independent cities without one. */
function provinceOf(place) {
  if (place.provinceCode) return provinceName.get(place.provinceCode) || '';
  if (place.regionCode === NCR) return 'Metro Manila';
  return regionName.get(place.regionCode) || '';
}

const group = (code) => code.slice(0, 5);

const placeRows = places
  .map((p) => [p.code, p.name, provinceOf(p)])
  .sort((a, b) => a[1].localeCompare(b[1]) || a[2].localeCompare(b[2]));

const groups = new Map();
for (const b of barangays) {
  const city = b.cityCode || b.municipalityCode;
  if (!city) continue;
  // Manila's barangays are numbered per district ("Barangay 1" exists in several); name the district.
  const name = b.subMunicipalityCode ? `${b.name} (${subMunName.get(b.subMunicipalityCode) || ''})`.replace(' ()', '') : b.name;
  const g = groups.get(group(city)) || {};
  (g[city] ||= []).push(name);
  groups.set(group(city), g);
}

await rm(OUT, { recursive: true, force: true });
await mkdir(path.join(OUT, 'brgy'), { recursive: true });
await writeFile(path.join(OUT, 'places.json'), JSON.stringify(placeRows));
for (const [key, cities] of groups) {
  for (const list of Object.values(cities)) list.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  await writeFile(path.join(OUT, 'brgy', `${key}.json`), JSON.stringify(cities));
}
console.log(`places: ${placeRows.length}, barangays: ${barangays.length} in ${groups.size} files -> ${path.relative(process.cwd(), OUT)}`);
