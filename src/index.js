// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 🔧 Suppress ResizeObserver loop error in console
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('ResizeObserver loop completed')) {
    return;
  }
  originalConsoleError(...args);
};

// 🔧 Suppress React red error overlay completely
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('ResizeObserver')) {
    e.stopImmediatePropagation();
  }
});

window.onerror = function (message) {
  if (message.includes('ResizeObserver')) return true;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();