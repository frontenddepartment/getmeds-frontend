import React from 'react';
import ReactDOM from 'react-dom/client';
import ContactUs from '../pages/contact-us';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ContactUs />
    </React.StrictMode>
  );
}
