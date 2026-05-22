import React from 'react';
import ReactDOM from 'react-dom/client';
import Meditations from '../pages/meditations';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Meditations />
    </React.StrictMode>
  );
}
