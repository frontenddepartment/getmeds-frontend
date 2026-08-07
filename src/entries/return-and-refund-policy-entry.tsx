import React from 'react';
import ReactDOM from 'react-dom/client';
import ReturnAndRefundPolicy from '../pages/return-and-refund-policy';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ReturnAndRefundPolicy />
    </React.StrictMode>
  );
}
