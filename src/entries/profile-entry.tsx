import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import Account from '../pages/account';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Account />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
