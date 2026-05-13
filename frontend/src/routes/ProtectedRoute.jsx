import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/index.js';

export function ProtectedRoute({ children, roles }) {
  const location = useLocation();
  const { isAuthenticated, status, user } = useAuth();

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-body-md text-on-surface-variant">
        Cargando sesión...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (roles?.length && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}
