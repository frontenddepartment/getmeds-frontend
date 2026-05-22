import React from 'react';
import ReactDOM from 'react-dom/client';
import GlobalPresence from '../pages/global-presence';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GlobalPresence />
    </React.StrictMode>
  );
}
