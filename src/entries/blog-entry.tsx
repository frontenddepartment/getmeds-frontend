import React from 'react';
import ReactDOM from 'react-dom/client';
import Blog from '../pages/blog';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Blog />
    </React.StrictMode>
  );
}
