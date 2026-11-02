import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Clarity from '@microsoft/clarity';
import App from './App.tsx';

import './index.css';
import 'leaflet/dist/leaflet.css';

Clarity.init('z79fg7t344');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
