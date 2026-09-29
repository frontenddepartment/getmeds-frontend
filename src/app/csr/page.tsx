import type { Metadata } from 'next';
import CsrClient from './CsrClient';

// Title, description, canonical and og:url copied from getmeds_frontend/csr.html.
export const metadata: Metadata = {
  title: { absolute: 'Corporate Social Responsibility - Getmeds' },
  description:
    'Corporate Social Responsibility at Getmeds. Our mission to make healthcare accessible through partnerships and patient advocacy.',
  alternates: { canonical: 'https://getmeds.ph/csr' },
  openGraph: { url: 'https://getmeds.ph/csr' },
};

export default function CSRPage() {
  return <CsrClient />;
}
