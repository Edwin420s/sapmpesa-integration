import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Import error tracking (optional)
if (process.env.NODE_ENV === 'production') {
  // Initialize error tracking service here
  console.log('Error tracking initialized');
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Register service worker for PWA (optional)
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}