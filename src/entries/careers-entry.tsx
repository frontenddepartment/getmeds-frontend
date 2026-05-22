import React from 'react';
import ReactDOM from 'react-dom/client';
import Careers from '../pages/careers';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Careers />
    </React.StrictMode>
  );
}
