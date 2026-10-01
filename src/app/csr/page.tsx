import type { Metadata } from 'next';
import CsrClient from './CsrClient';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Title, description, canonical and og:url copied from getmeds_frontend/csr.html.
const baseMetadata: Metadata = {
  title: { absolute: 'Corporate Social Responsibility - Getmeds' },
  description:
    'Corporate Social Responsibility at Getmeds. Our mission to make healthcare accessible through partnerships and patient advocacy.',
  alternates: { canonical: 'https://getmeds.ph/csr' },
  openGraph: { url: 'https://getmeds.ph/csr' },
};

export default function CSRPage() {
  return <CsrClient />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/csr', baseMetadata);
}
