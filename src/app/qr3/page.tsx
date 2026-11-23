import type { Metadata } from 'next';
import { getCatalogModel } from '@/lib/catalogServer';
import { cleanGeneric, type MedicineOption } from '@/lib/medicineSearch';
import PapQrForm from './PapQrForm';
import './qr3.css';

// Same cadence as the catalogue, so a product added in the Studio shows up in the search within the hour.
export const revalidate = 3600;

/* /qr3 is the landing page of a printed QR code: a patient (usually on a phone, often in a
   hospital) asks for help getting a medicine under the Patient Assistance Program. It collects
   personal and health information, so it stays out of search results. */
export const metadata: Metadata = {
  title: { absolute: 'Patient Assistance Request | Getmeds' },
  description: 'Request help getting your medicine through the Getmeds Patient Assistance Program.',
  alternates: { canonical: '/qr3' },
  robots: { index: false, follow: false },
};

/** The catalogue's 800px product photo, resized by the Sanity CDN for a 48px thumbnail (2x for sharp screens). */
function thumbnail(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    if (u.hostname !== 'cdn.sanity.io') return url;
    u.searchParams.set('w', '120');
    u.searchParams.set('h', '120');
    u.searchParams.set('fit', 'max');
    u.searchParams.set('auto', 'format');
    return u.toString();
  } catch {
    return undefined;
  }
}

export default async function PapQrPage() {
  const model = await getCatalogModel();

  // One option per brand + strength + form. A product filed under several conditions appears
  // once per condition in the catalogue; its conditions are merged so any of them finds it.
  const byKey = new Map<string, MedicineOption>();
  const brandImage = new Map<string, string>();
  for (const p of model.products) {
    const brand = p.brandName || p.name || '';
    const genericFull = p.genericName || '';
    if (!brand && !genericFull) continue;
    const key = [brand, p.strength, p.form].join('|').toLowerCase();
    const conditions = [...p.conditions, p.conditionFilipinoName].filter((c): c is string => Boolean(c));
    const existing = byKey.get(key);
    if (existing) {
      existing.conditions = [...new Set([...existing.conditions, ...conditions])];
      continue;
    }
    byKey.set(key, {
      id: p.id || key,
      brand,
      generic: cleanGeneric(genericFull),
      genericFull,
      strength: p.strength || '',
      form: p.form || '',
      category: p.category || '',
      conditions: [...new Set(conditions)],
      rx: (p.prescription || '').toUpperCase() === 'RX',
      image: thumbnail(p.imageUrl),
    });
    if (!existing && p.imageUrl) {
      const brandKey = brand.toLowerCase();
      if (!brandImage.has(brandKey)) brandImage.set(brandKey, thumbnail(p.imageUrl)!);
      if (p.productGroup && !brandImage.has(`group:${p.productGroup}`)) brandImage.set(`group:${p.productGroup}`, thumbnail(p.imageUrl)!);
    }
  }
  // A strength without its own photo borrows its brand's (or product group's), as the product range does.
  for (const p of model.products) {
    const key = [p.brandName || p.name || '', p.strength, p.form].join('|').toLowerCase();
    const o = byKey.get(key);
    if (o && !o.image) o.image = brandImage.get(o.brand.toLowerCase()) || (p.productGroup ? brandImage.get(`group:${p.productGroup}`) : undefined);
  }
  const medicines = [...byKey.values()].sort((a, b) => a.brand.localeCompare(b.brand));

  return <PapQrForm medicines={medicines} />;
}
