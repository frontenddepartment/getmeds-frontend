import type { Metadata } from 'next';

// business-card.html's <head>. These pages carry named staff members' mobile
// numbers: reachable by whoever holds the printed card, by nobody running a
// search. (The client replaces the title with the person's name.)
export const businessCardMetadata: Metadata = {
  title: { absolute: 'Business card | Getmeds' },
  description: 'A Getmeds business card. Save the contact, or message them on WhatsApp or Viber.',
  robots: { index: false, follow: false },
};
