import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <div style={{ background: '#0f172a', minHeight: '100vh' }}>
    <App />
  </div>
);