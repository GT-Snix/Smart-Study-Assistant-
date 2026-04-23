import React from 'react';
import { Navigate } from 'react-router-dom';
import useAppStore from '../../store/useAppStore';

/**
 * ProtectedRoute — wraps routes that require authentication + optional role check.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}> ... </Route>
 *   <Route element={<ProtectedRoute roles={['teacher']} />}> ... </Route>
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, currentUser } = useAppStore();

  // Not authenticated → redirect to login
  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Role check (if roles specified)
  if (roles && !roles.includes(currentUser.role)) {
    // Redirect to their correct dashboard
    const home = getHomeRoute(currentUser.role);
    return <Navigate to={home} replace />;
  }

  return children;
};

export const getHomeRoute = (role) => {
  switch (role) {
    case 'student':
      return '/student/setup';
    case 'teacher':
      return '/teacher/dashboard';
    case 'parent':
      return '/parent/overview';
    default:
      return '/student/setup';
  }
};

export default ProtectedRoute;
