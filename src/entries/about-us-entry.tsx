import React from 'react';
import ReactDOM from 'react-dom/client';
import AboutUs from '../pages/about-us';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <AboutUs />
    </React.StrictMode>
  );
}
