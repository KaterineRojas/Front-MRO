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
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          margin: 0,
          padding: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              border: '3px solid rgba(96, 165, 250, 0.3)',
              borderTop: '3px solid rgb(96, 165, 250)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto',
            }}
          />
          <p style={{ marginTop: '16px', color: 'rgba(255, 255, 255, 0.7)' }}>Loading...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Check if user just logged out
  const justLoggedOut = (() => {
    try {
      return localStorage.getItem('mro_just_logged_out') === 'true';
    } catch {
      return false;
    }
  })();

  // If user just logged out, always redirect to login (even if Azure session exists)
  if (justLoggedOut) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to login if not authenticated (check both Azure and Redux)
  if (!isAuthenticatedWithAzure && !isAuthenticatedInRedux) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
