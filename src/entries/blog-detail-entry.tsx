import React from 'react';
import ReactDOM from 'react-dom/client';
import BlogDetail from '../pages/blog-detail';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BlogDetail />
    </React.StrictMode>
  );
}
