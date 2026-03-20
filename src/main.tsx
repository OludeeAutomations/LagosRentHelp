import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import './index.css';


import { GoogleOAuthProvider } from "@react-oauth/google";

const googleOAuthClientId = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID;

if (!googleOAuthClientId) {
  console.warn(
    "VITE_GOOGLE_OAUTH_CLIENT_ID is not set. Google OAuth features will be disabled locally."
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {googleOAuthClientId ? (
      <GoogleOAuthProvider clientId={googleOAuthClientId}>
        <App />
      </GoogleOAuthProvider>
    ) : (
      <App />
    )}
  </StrictMode>
);
