import React from 'react';
import ReactDOM from 'react-dom/client';
import { FarmProvider } from './context/FarmContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FarmProvider>
      <App />
    </FarmProvider>
  </React.StrictMode>
);
