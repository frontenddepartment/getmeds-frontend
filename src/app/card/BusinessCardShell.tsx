import BusinessCardClient from './[slug]/BusinessCardClient';
import './business-card.css';

// <body data-page="business-card" class="text-gray-800 antialiased"> in
// business-card.html. No QueuedInquiryNotice, as in business-card-entry.tsx:
// whoever scanned the card has never started an inquiry.
export default function BusinessCardShell({ slug }: { slug?: string }) {
  return (
    <div className="gm-page-business-card text-gray-800 antialiased" data-page="business-card">
      <BusinessCardClient initialSlug={slug} />
    </div>
  );
}
