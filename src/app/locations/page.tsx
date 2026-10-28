import type { Metadata } from 'next';
import LocationsGlobe from './LocationsGlobe';
import BackButton from './BackButton';
import './locations.css';

export const metadata: Metadata = {
  title: 'Our Locations',
  description:
    'Getmeds branches around the world, all connected to our headquarters in Manila, Philippines.',
  icons: {
    icon: [
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png' }, { url: '/icons/apple-touch-icon.png' }],
  },
};

export default function Page() {
  return (
    <main className="locations-page">
      <header className="locations-topbar">
        <BackButton />
        <a href="/">
          <img src="/assets/getmeds-logo-sm.png" alt="Getmeds" />
        </a>
      </header>
      <LocationsGlobe />
    </main>
  );
}
