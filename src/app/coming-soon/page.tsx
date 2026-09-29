import type { Metadata } from 'next';
import ComingSoonClient from './ComingSoonClient';
import './coming-soon.css';

// coming-soon.html + src/pages/coming-soon.tsx. The served <title> is generic;
// the client replaces it with the specific site's name.
export const metadata: Metadata = {
  title: { absolute: 'Coming Soon - Getmeds' },
  description: 'This Getmeds Global Network site is under construction.',
  // Nothing here is worth indexing until the real site exists.
  robots: { index: false, follow: true },
};

export default function ComingSoonPage() {
  return (
    <div className="gm-coming-soon">
      <ComingSoonClient />
    </div>
  );
}
