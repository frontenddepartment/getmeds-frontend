import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import CareersClient from './CareersClient';
import './careers.css';

// Same <title>, description and canonical careers.html served.
export const metadata: Metadata = pageMetadata({
  title: 'Careers - Getmeds',
  rawTitle: true,
  description:
    "Join the Getmeds team. We're looking for passionate individuals to innovate and grow with us in the global healthcare space.",
  path: '/careers',
});

export default function CareersPage() {
  return <CareersClient />;
}
