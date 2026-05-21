import React from 'react';
import ReactDOM from 'react-dom/client';
import PatientAssistanceProgram from './pap';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <PatientAssistanceProgram />
    </React.StrictMode>
  );
}
