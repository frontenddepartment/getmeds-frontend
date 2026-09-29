import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/pageMeta';
import ContactUsClient from './ContactUsClient';
import './contact-us.css';

// Same <title>, description and canonical contact-us.html served.
export const metadata: Metadata = pageMetadata({
  title: 'Contact Us - Getmeds',
  rawTitle: true,
  description:
    'For inquiries about our pharmaceutical portfolio, partnership opportunities, careers, or patient access programs — our team is ready to help.',
  path: '/contact-us',
});

export default function ContactUsPage() {
  return <ContactUsClient />;
}
