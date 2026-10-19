import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, user, openModal } = useAuthModal();
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      openModal('login');
    }
  }, [isAuthenticated, openModal, location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  const isAdmin = user?.role === 'admin';
  const isAdminPath = location.pathname.startsWith('/admin');
  const isUserOnlyPath = [
    '/dashboard',
    '/diet',
    '/workout',
    '/health-assessment',
    '/settings',
  ].some((route) => location.pathname.startsWith(route));

  // Admin cannot access user fitness tracker pages
  if (isAdmin && isUserOnlyPath) {
    return <Navigate to="/admin" replace />;
  }

  // Regular users cannot access admin portal pages
  if (!isAdmin && isAdminPath) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
