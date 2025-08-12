import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { testManagerLogin } from './utils/testManagerLogin';

// Disponibilizar função de teste globalmente para debug
(window as any).testManagerLogin = testManagerLogin;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
