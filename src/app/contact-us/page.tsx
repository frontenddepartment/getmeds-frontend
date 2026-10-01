import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import ContactUsClient from './ContactUsClient';
import './contact-us.css';
import { withVidrysSeo } from '@/lib/vidrys/seoOverrides';

// Same <title>, description and canonical contact-us.html served.
const baseMetadata: Metadata = pageMetadata({
  title: 'Contact Us - Getmeds',
  rawTitle: true,
  description:
    'For inquiries about our pharmaceutical portfolio, partnership opportunities, careers, or patient access programs — our team is ready to help.',
  path: '/contact-us',
});

export default function ContactUsPage() {
  return <ContactUsClient />;
}

// The page's own metadata, with any Vidrys SEO fix for this path on top.
export function generateMetadata(): Promise<Metadata> {
  return withVidrysSeo('/contact-us', baseMetadata);
}
