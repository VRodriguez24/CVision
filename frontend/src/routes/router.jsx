import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout.jsx';
import { AuthLayout } from '../layouts/AuthLayout.jsx';
import { DashboardLayout } from '../layouts/DashboardLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { LoginPage } from '../pages/auth/LoginPage.jsx';
import { RecoverPasswordPage } from '../pages/auth/RecoverPasswordPage.jsx';
import { RegisterPage } from '../pages/auth/RegisterPage.jsx';
import { AdminDashboardPage } from '../pages/dashboard/AdminDashboardPage.jsx';
import { ComingSoonPage } from '../pages/dashboard/ComingSoonPage.jsx';
import { DashboardPage } from '../pages/dashboard/DashboardPage.jsx';
import { LandingFooterLogos, LandingPage } from '../pages/LandingPage.jsx';
import { ProtectedRoute } from './ProtectedRoute.jsx';

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        element: (
          <PublicLayout
            footerProps={{
              text: '© 2026 CVision - BNE & SENCE Chile. All rights reserved. Potenciando la empleabilidad en todo el territorio nacional.',
              logos: <LandingFooterLogos />,
            }}
          />
        ),
        children: [
          {
            index: true,
            element: <LandingPage />,
          },
        ],
      },
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            index: true,
            element: <LoginPage />,
          },
          {
            path: 'register',
            element: <RegisterPage />,
          },
          {
            path: 'recover',
            element: <RecoverPasswordPage />,
          },
        ],
      },
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'cvs',
            element: <ComingSoonPage />,
          },
          {
            path: 'cvs/new',
            element: <ComingSoonPage />,
          },
          {
            path: 'optimizer',
            element: <ComingSoonPage />,
          },
          {
            path: 'jobs',
            element: <ComingSoonPage />,
          },
          {
            path: 'settings',
            element: <ComingSoonPage />,
          },
          {
            path: 'admin',
            element: (
              <ProtectedRoute roles={['ADMIN', 'MODERATOR']}>
                <AdminDashboardPage />
              </ProtectedRoute>
            ),
          },
          {
            path: 'help',
            element: <ComingSoonPage />,
          },
        ],
      },
    ],
  },
]);
