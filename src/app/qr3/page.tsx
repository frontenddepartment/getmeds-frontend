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

export default async function PapQrPage() {
  const model = await getCatalogModel();

  // One option per brand + strength + form. A product filed under several conditions appears
  // once per condition in the catalogue; its conditions are merged so any of them finds it.
  const byKey = new Map<string, MedicineOption>();
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
    });
  }
  const medicines = [...byKey.values()].sort((a, b) => a.brand.localeCompare(b.brand));

  return <PapQrForm medicines={medicines} />;
}
