import { useIsAuthenticated } from '@azure/msal-react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAuthenticatedWithAzure = useIsAuthenticated();
  const isAuthenticatedInRedux = useAppSelector((state) => state.auth.isAuthenticated);
  const isLoading = useAppSelector((state) => state.auth.isLoading);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated (check both Azure and Redux)
  if (!isAuthenticatedWithAzure && !isAuthenticatedInRedux) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
