import type { Metadata } from 'next';
import AccountClient from '../account/AccountClient';
import { QueuedInquiryNotice } from '@/lib/QueuedInquiryNotice';

// profile.html + src/entries/profile-entry.tsx in the original.
export const metadata: Metadata = {
  title: { absolute: 'My Account | Getmeds' },
  description: 'Your Getmeds inquiries, saved details and documents, kept on this device.',
  // Everything on this page is read from the visitor's own device and is
  // different for every visitor, so there is nothing here to index.
  robots: { index: false, follow: false },
};

export default function ProfilePage() {
  return (
    <div className="text-gray-800 antialiased" data-page="profile">
      <AccountClient />
      <QueuedInquiryNotice />
    </div>
  );
}
