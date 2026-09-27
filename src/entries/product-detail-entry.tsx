import React from 'react';
import { mountPage } from '../lib/handoff';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import ProductDetail from '../pages/product-detail';

const rootElement = document.getElementById('root');
if (rootElement) {
  // mountPage, not createRoot: keeps the prerendered product on screen until the app is ready.
  mountPage(
    rootElement,
    <React.StrictMode>
      <ProductDetail />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
