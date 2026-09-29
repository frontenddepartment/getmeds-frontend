import type { Metadata } from 'next';
import AboutUsClient from '@/components/AboutUsClient';
import './about-us.css';

// Title, description, canonical and og:url copied from getmeds_frontend/about-us.html.
export const metadata: Metadata = {
  title: { absolute: 'About Us - Getmeds' },
  description:
    'Learn more about Getmeds, your trusted companion in health and wellness. Discover our mission, vision, and the team behind our platform.',
  alternates: { canonical: 'https://getmeds.ph/about-us' },
  openGraph: { url: 'https://getmeds.ph/about-us' },
};

export default function AboutUsPage() {
  return <AboutUsClient />;
}
