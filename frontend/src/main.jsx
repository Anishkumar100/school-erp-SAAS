import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// No need to import axios here anymore for the interceptor
import { AuthProvider } from './context/AuthContext.jsx';

// The interceptor code has been removed from this file.
// All authenticated API calls should use the 'apiClient.js' instance instead.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
);