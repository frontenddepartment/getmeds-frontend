import BusinessCardClient from './[slug]/BusinessCardClient';
import './business-card.css';

// <body data-page="business-card" class="text-gray-800 antialiased"> in
// business-card.html. No QueuedInquiryNotice, as in business-card-entry.tsx:
// whoever scanned the card has never started an inquiry.
export default function BusinessCardShell({ slug }: { slug?: string }) {
  return (
    <div className="gm-page-business-card text-gray-800 antialiased" data-page="business-card">
      {/* The button and detail icons are Font Awesome classes. Only the homepage loaded the
          stylesheet, so opened directly (as from a QR scan) every icon was blank. React hoists
          this into <head>. */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" precedence="default" />
      <BusinessCardClient initialSlug={slug} />
    </div>
  );
}
