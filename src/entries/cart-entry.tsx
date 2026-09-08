import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import Cart from '../pages/cart';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Cart />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
