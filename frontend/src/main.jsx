import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/index.js';
import { router } from './routes/router.jsx';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        gutter={10}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '14px',
            border: '1px solid rgba(157, 175, 189, 0.55)',
            background: '#f8fafc',
            color: '#0f172a',
            boxShadow: '0 14px 30px -18px rgba(15, 23, 42, 0.45)',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#15803d',
              secondary: '#f0fdf4',
            },
          },
          error: {
            duration: 5000,
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fef2f2',
            },
          },
          loading: {
            duration: Infinity,
            iconTheme: {
              primary: '#1d4ed8',
              secondary: '#eff6ff',
            },
          },
        }}
      />
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>,
);
