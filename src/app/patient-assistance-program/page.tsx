import type { Metadata } from 'next';
import { DOMAIN } from '@/lib/seo-config';
import PatientAssistanceProgramClient from './PatientAssistanceProgramClient';

// Mirrors the <head> of patient-assistance-program.html.
// The social card mirrors what scripts/inject-social-meta.cjs completed at build time.
const TITLE = 'Patient Assistance Program - Getmeds';
const DESCRIPTION =
  'Getmeds Patient Assistance Program - access free cancer medicines and chemotherapy support through DSWD and PCSO accreditation in the Philippines.';
const URL = `${DOMAIN}/patient-assistance-program`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: `${DOMAIN}/assets/og-default.jpg`, width: 1200, height: 630, alt: 'Getmeds Philippines' }],
    type: 'website',
    siteName: 'Getmeds Philippines',
    url: URL,
  },
  twitter: { card: 'summary_large_image' },
};

export default function PatientAssistanceProgramPage() {
  return <PatientAssistanceProgramClient />;
}
