import React from 'react';
import ReactDOM from 'react-dom/client';
import CancerMedicines from '../pages/cancer-medicines';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <CancerMedicines />
    </React.StrictMode>
  );
}
