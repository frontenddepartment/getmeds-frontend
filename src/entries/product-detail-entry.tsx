import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductDetail from '../pages/product-detail';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ProductDetail />
    </React.StrictMode>
  );
}
