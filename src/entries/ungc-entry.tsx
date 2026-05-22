import React from 'react';
import ReactDOM from 'react-dom/client';
import Ungc from '../pages/ungc';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Ungc />
    </React.StrictMode>
  );
}
