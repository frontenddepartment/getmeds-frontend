import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import CareersClient from './CareersClient';
import './careers.css';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Same <title>, description and canonical careers.html served.
const baseMetadata: Metadata = pageMetadata({
  title: 'Careers - Getmeds',
  rawTitle: true,
  description:
    "Join the Getmeds team. We're looking for passionate individuals to innovate and grow with us in the global healthcare space.",
  path: '/careers',
});

export default function CareersPage() {
  return <CareersClient />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/careers', baseMetadata);
}
