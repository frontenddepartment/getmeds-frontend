import React from 'react';
import { mountPage } from '../lib/handoff';
import CentralizedPolicyPage from '../pages/policy';

const rootElement = document.getElementById('root');
if (rootElement) {
  // mountPage, not createRoot: keeps the prerendered policy on screen until the app is ready.
  mountPage(
    rootElement,
    <React.StrictMode>
      <CentralizedPolicyPage />
    </React.StrictMode>
  );
}
