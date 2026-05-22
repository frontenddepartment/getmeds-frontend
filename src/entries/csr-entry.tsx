import React from 'react';
import ReactDOM from 'react-dom/client';
import Csr from '../pages/csr';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Csr />
    </React.StrictMode>
  );
}
