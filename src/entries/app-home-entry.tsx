import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import AppHome from '../pages/app-home';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AppHome />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
