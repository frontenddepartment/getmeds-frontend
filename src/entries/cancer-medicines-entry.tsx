import React from 'react';
import { mountPage } from '../lib/handoff';
import CancerMedicines from '../pages/cancer-medicines';

const rootElement = document.getElementById('root');
if (rootElement) {
  // mountPage, not createRoot: keeps the prerendered listing on screen until the app is ready.
  mountPage(
    rootElement,
    <React.StrictMode>
      <CancerMedicines />
    </React.StrictMode>
  );
}
