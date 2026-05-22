import React from 'react';
import ReactDOM from 'react-dom/client';
import Articles from '../pages/articles';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Articles />
    </React.StrictMode>
  );
}
