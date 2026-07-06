import React from 'react';
import ReactDOM from 'react-dom/client';
import EmployeeVerification from '../pages/employee-verification';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <EmployeeVerification />
    </React.StrictMode>
  );
}
