import React from 'react';
import { mountPage } from '../lib/handoff';
import Blog from '../pages/blog';

const rootElement = document.getElementById('root');
if (rootElement) {
  // mountPage, not createRoot: keeps the prerendered post list on screen until the app is ready.
  mountPage(
    rootElement,
    <React.StrictMode>
      <Blog />
    </React.StrictMode>
  );
}
