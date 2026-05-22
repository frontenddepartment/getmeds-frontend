import React from 'react';
import ReactDOM from 'react-dom/client';
import ArticleDetail from '../pages/article-detail';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ArticleDetail />
    </React.StrictMode>
  );
}
