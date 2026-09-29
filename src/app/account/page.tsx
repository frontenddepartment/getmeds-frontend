import type { Metadata } from 'next';
import AccountClient from './AccountClient';
import { QueuedInquiryNotice } from '@/lib/QueuedInquiryNotice';

// The original site has no /account page: the account screen is /profile
// (profile.html). This route is kept because it already existed in this app,
// and renders the same screen.
export const metadata: Metadata = {
  title: { absolute: 'My Account | Getmeds' },
  description: 'Your Getmeds inquiries, saved details and documents, kept on this device.',
  alternates: { canonical: '/profile' },
  robots: { index: false, follow: false },
};

export default function AccountPage() {
  return (
    <div className="text-gray-800 antialiased" data-page="profile">
      <AccountClient />
      <QueuedInquiryNotice />
    </div>
  );
}
