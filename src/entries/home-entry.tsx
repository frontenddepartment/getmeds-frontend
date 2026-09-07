import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueuedInquiryNotice } from '../lib/QueuedInquiryNotice';
import GetMedsHomepage from '../pages/home';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GetMedsHomepage />
      <QueuedInquiryNotice />
    </React.StrictMode>
  );
}
