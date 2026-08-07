import React from 'react';
import ReactDOM from 'react-dom/client';
import CentralizedPolicyPage from '../pages/policy';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CentralizedPolicyPage />
    </React.StrictMode>
  );
}
