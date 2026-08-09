import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

/**
 * ProtectedRoute — guards all /admin/* routes.
 *
 * Reads persisted auth state synchronously from Zustand (localStorage-backed).
 * If the user is not authenticated, redirect to login immediately — before any
 * child component renders. This prevents admin content from flashing briefly
 * while AdminLayout's useEffect fires.
 *
 * AdminLayout still calls checkAuth() on mount to validate the token server-side
 * and handle the case where the token has expired since the last visit.
 */
export default function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s: { isAuthenticated: boolean }) => s.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
