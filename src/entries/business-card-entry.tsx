import React from 'react';
import ReactDOM from 'react-dom/client';
import BusinessCard from '../pages/business-card';

// No QueuedInquiryNotice here, unlike the catalogue entries: this page is
// reached by someone who was handed a business card, usually with no Getmeds
// session behind them at all, and a queued-inquiry banner would be about an
// errand they have never started.
const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BusinessCard />
    </React.StrictMode>
  );
}
