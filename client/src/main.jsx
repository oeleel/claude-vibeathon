import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

// Removing StrictMode to prevent double-rendering issues in development
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);

