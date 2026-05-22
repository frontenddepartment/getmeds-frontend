import React from 'react';
import ReactDOM from 'react-dom/client';
import GetMedsHomepage from '../pages/home';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <GetMedsHomepage />
    </React.StrictMode>
  );
}
