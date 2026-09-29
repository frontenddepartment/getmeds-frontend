import type { Metadata } from 'next';
import AppHomeClient from './AppHomeClient';
import { QueuedInquiryNotice } from '@/lib/QueuedInquiryNotice';
import { PwaModeScript } from '@/lib/pwaMode';
import './app-home.css';

// app-home.html + src/entries/app-home-entry.tsx: the installed app's home
// screen (the manifest's start_url).
export const metadata: Metadata = {
  title: { absolute: 'Getmeds' },
  description: 'Browse the Getmeds catalogue and send an inquiry.',
  // This is the installed app's home screen, not a page for the open web:
  // getmeds.ph/ is the page search engines should rank.
  robots: { index: false, follow: false },
};

export default function AppHomePage() {
  return (
    <div className="gm-page-app-home text-gray-800 antialiased" data-page="app-home">
      <PwaModeScript />
      <AppHomeClient />
      <QueuedInquiryNotice />
    </div>
  );
}
