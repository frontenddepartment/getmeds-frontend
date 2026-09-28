// Build-time render of the main marketing pages, whose content is written into the page
// components themselves rather than fetched. scripts/prerender-static-pages.cjs loads the
// server bundle of this file (vite.ssr.config.mjs) and writes each page's HTML into its #root,
// so crawlers that don't run JavaScript get the page's real text (audit item 07). In the
// browser the entry's createRoot() then replaces that HTML with the same first render.
import { renderToString } from 'react-dom/server';
import Home from '../pages/home';
import AboutUs from '../pages/about-us';
import Services from '../pages/services';
import PatientAssistanceProgram from '../pages/patient-assistance-program';
import Careers from '../pages/careers';
import Csr from '../pages/csr';
import GlobalPresence from '../pages/global-presence';
import Meditations from '../pages/meditations';
import Ungc from '../pages/ungc';
import ContactUs from '../pages/contact-us';
import OrderMedicines from '../pages/order-medicines';

// Page -> the built HTML file its markup goes into, relative to dist/.
export const PAGES: { file: string; render: () => string }[] = [
  { file: 'index.html', render: () => renderToString(<Home />) },
  { file: 'about-us.html', render: () => renderToString(<AboutUs />) },
  { file: 'services.html', render: () => renderToString(<Services />) },
  { file: 'patient-assistance-program.html', render: () => renderToString(<PatientAssistanceProgram />) },
  { file: 'careers.html', render: () => renderToString(<Careers />) },
  { file: 'csr.html', render: () => renderToString(<Csr />) },
  { file: 'global-presence.html', render: () => renderToString(<GlobalPresence />) },
  { file: 'meditations.html', render: () => renderToString(<Meditations />) },
  { file: 'ungc.html', render: () => renderToString(<Ungc />) },
  { file: 'contact-us.html', render: () => renderToString(<ContactUs />) },
  { file: 'order-medicines.html', render: () => renderToString(<OrderMedicines ssrPath="/order-medicines" />) },
  ...['patients', 'doctors', 'distributors', 'hospitals'].map((slug) => ({
    file: `order-medicines/${slug}.html`,
    render: () => renderToString(<OrderMedicines ssrPath={`/order-medicines/${slug}`} />),
  })),
];
