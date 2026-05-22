import React from 'react';
import ReactDOM from 'react-dom/client';
import ProductRange from '../pages/product-range';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ProductRange />
    </React.StrictMode>
  );
}
