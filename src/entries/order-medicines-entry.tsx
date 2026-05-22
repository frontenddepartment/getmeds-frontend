import React from 'react';
import ReactDOM from 'react-dom/client';
import OrderMedicines from '../pages/order-medicines';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <OrderMedicines />
    </React.StrictMode>
  );
}
