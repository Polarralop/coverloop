// ============================================================================
// main.tsx — React bootstrap. Nothing app-specific lives here.
// Mounts <App /> (App.tsx) into the #root div from index.html.
// ============================================================================
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
