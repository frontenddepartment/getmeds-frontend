import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import Search from '../pages/search';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Search />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
