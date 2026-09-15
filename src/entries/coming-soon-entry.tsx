import React from 'react';
import ReactDOM from 'react-dom/client';
import ComingSoon from '../pages/coming-soon';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ComingSoon />
    </React.StrictMode>
  );
}
