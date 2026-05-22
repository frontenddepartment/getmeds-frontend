import React from 'react';
import ReactDOM from 'react-dom/client';
import Services from '../pages/services';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Services />
    </React.StrictMode>
  );
}
