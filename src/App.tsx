import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { store, useAppSelector, useAppDispatch } from './store';
import { setAuth, setLoading, setUserPhoto } from './store/slices/authSlice';
import { loginRequest } from './authConfig';
import { getUserProfileWithPhoto } from './services/graphService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { InventoryManager } from './components/features/inventory/InventoryManager';
import { RequestOrders } from './components/features/loans/RequestOrders';
import { PurchaseOrders } from './components/features/orders/PurchaseOrders';
import { RequestOrders as RequestManagement } from './components/features/requests/RequestOrders';
import { Reports } from './components/features/reports/Reports';
import { UserManagement } from './components/features/users/UserManagement';
import { QuickFind } from './components/features/quick-find/QuickFind';
import { CycleCount } from './components/features/cycle-count/CycleCount';
import { LoanDetailView } from './components/features/loans/LoanDetailView';
import { OrderDetailView } from './components/features/orders/OrderDetailView';
import { CycleCountView } from './components/features/cycle-count/CycleCountView';
import { ReturnItemsPage } from './components/features/loans/ReturnItemsPage';
import { ThemeProvider } from "next-themes";
import { ManageRequests } from './components/features/manage-requests/ManageRequests';
import { Login, ProtectedRoute } from './components/features/auth';

// Engineer Module Imports
import { 
  Catalog as EngineerCatalog,
  MyInventoryTransfer as EngineerMyInventory,
  CompleteHistory as EngineerCompleteHistory,
  RequestOrders as EngineerRequestOrders
} from './components/features/enginner';
import { EngineerModuleWrapper } from './components/features/enginner/EngineerModuleWrapper';

// Auth Handler Component
function AuthHandler() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const initAuth = async () => {
      // Wait for MSAL to finish initialization
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      // If user is authenticated, get token and update Redux store
      if (isAuthenticated && accounts.length > 0) {
        try {
          // 1. Get token for backend API
          const apiTokenRequest = {
            ...loginRequest,
            account: accounts[0],
          };
          const apiTokenResponse = await instance.acquireTokenSilent(apiTokenRequest);

          // 2. Get separate token for Microsoft Graph API
          let graphProfile = null;
          let graphPhotoUrl = null;

          try {
            const graphTokenRequest = {
              scopes: ['User.Read'],
              account: accounts[0],
            };
            const graphTokenResponse = await instance.acquireTokenSilent(graphTokenRequest);

            // Fetch user profile and photo from Microsoft Graph using Graph token
            const { profile, photoUrl } = await getUserProfileWithPhoto(graphTokenResponse.accessToken);
            graphProfile = profile;
            graphPhotoUrl = photoUrl;
          } catch (graphError) {
            console.warn('⚠️ Could not fetch Graph API data:', graphError);
            // Continue without Graph data - will use basic info from token
          }

          // Extract user info from token claims and Graph API
          const account = apiTokenResponse.account;
          const user = {
            id: account.localAccountId || graphProfile?.id || '1',
            name: graphProfile?.displayName || account.name || 'Unknown User',
            email: graphProfile?.mail || graphProfile?.userPrincipalName || account.username || '',
            role: 'user' as const, // Default role, can be updated from backend
            department: graphProfile?.department || 'Engineering',
            jobTitle: graphProfile?.jobTitle,
            mobilePhone: graphProfile?.mobilePhone,
            officeLocation: graphProfile?.officeLocation,
            photoUrl: graphPhotoUrl || undefined,
          };

          // Update Redux store with API token (not Graph token)
          dispatch(
            setAuth({
              user,
              accessToken: apiTokenResponse.accessToken,
            })
          );

          console.log('✅ User authenticated:', user.email);
          console.log('✅ User profile loaded:', {
            name: user.name,
            department: user.department,
            jobTitle: user.jobTitle,
            hasPhoto: !!user.photoUrl,
          });
        } catch (error) {
          console.error('Error acquiring token:', error);
          dispatch(setLoading(false));
        }
      } else {
        // User not authenticated
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch]);

  return null; // This component doesn't render anything
}

// Wrapper components for route navigation
function CycleCountWrapper() {
  const navigate = useNavigate();
  
  return (
    <CycleCount 
      onStartCycleCount={() => navigate('/cycle-count/active')}
      onViewCycleCount={(_record) => navigate('/cycle-count/active')}
    />
  );
}

function RequestOrdersWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string, state?: any) => {
    if (state) {
      sessionStorage.setItem('navigationState', JSON.stringify(state));
    }
    navigate(path);
  };
  
  return (
    <RequestOrders 
      onViewDetail={(request, previousTab) => {
        handleNavigate('/loans/detail', { request, previousTab });
      }}
      onReturnItems={(request, previousTab) => {
        handleNavigate('/loans/return', { request, previousTab });
      }}
    />
  );
}

function PurchaseOrdersWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string, state?: any) => {
    if (state) {
      sessionStorage.setItem('navigationState', JSON.stringify(state));
    }
    navigate(path);
  };
  
  return (
    <PurchaseOrders 
      onViewDetail={(order) => {
        handleNavigate('/orders/detail', { order });
      }} 
    />
  );
}

function LoanDetailWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <LoanDetailView 
      request={state?.request} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }} 
    />
  );
}

function ReturnItemsWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <ReturnItemsPage 
      request={state?.request} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }}
      onReturnConfirmed={(request, returnItems) => {
        console.log('Return confirmed:', { request, returnItems });
        alert('Items returned successfully!');
        sessionStorage.removeItem('navigationState');
        navigate('/loans');
      }}
    />
  );
}

function OrderDetailWrapper() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('navigationState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  return (
    <OrderDetailView 
      order={state?.order} 
      onBack={() => {
        sessionStorage.removeItem('navigationState');
        navigate('/orders');
      }} 
    />
  );
}

function CycleCountActiveWrapper() {
  const navigate = useNavigate();
  
  return (
    <CycleCountView 
      onBack={() => navigate('/cycle-count')} 
    />
  );
}

function EngineerRequestOrdersWrapper() {
  return <EngineerRequestOrders />;
}

function AppRoutes() {
  // Get user from Redux store
  const user = useAppSelector((state) => state.auth.user);

  return (
    <Routes>
      {/* Public Login Route */}
      <Route path="/login" element={<Login />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Main Routes */}
        <Route index element={<Dashboard />} />
        <Route path="inventory" element={<InventoryManager />} />
        <Route path="quick-find" element={<QuickFind />} />
        <Route path="reports" element={<Reports />} />
        
        {/* Cycle Count Routes */}
        <Route path="cycle-count" element={<CycleCountWrapper />} />
        <Route path="cycle-count/active" element={<CycleCountActiveWrapper />} />
        
        {/* Loan/Request Orders Routes */}
        <Route path="loans" element={<RequestOrdersWrapper />} />
        <Route path="loans/detail" element={<LoanDetailWrapper />} />
        <Route path="loans/return" element={<ReturnItemsWrapper />} />
        
        {/* Purchase Orders Routes */}
        <Route path="orders" element={<PurchaseOrdersWrapper />} />
        <Route path="orders/detail" element={<OrderDetailWrapper />} />

        {/* Manage Requests Route */}
        <Route path="manage-requests" element={<ManageRequests />} />
        
        {/* Request Management (Admin/Manager only) */}
        {user && ['administrator', 'manager'].includes(user.role) && (
          <Route path="requests" element={<RequestManagement />} />
        )}
        
        {/* User Management (Admin only) */}
        {user && user.role === 'administrator' && (
          <Route path="users" element={<UserManagement />} />
        )}
        
        {/* Engineer Modules - Nuevos módulos integrados */}
        <Route path="engineer/catalog" element={<EngineerModuleWrapper><EngineerCatalog /></EngineerModuleWrapper>} />
        <Route path="engineer/requests" element={<EngineerModuleWrapper><EngineerRequestOrdersWrapper /></EngineerModuleWrapper>} />
        <Route path="engineer/my-inventory" element={<EngineerModuleWrapper><EngineerMyInventory /></EngineerModuleWrapper>} />
        <Route path="engineer/history" element={<EngineerModuleWrapper><EngineerCompleteHistory /></EngineerModuleWrapper>} />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    // <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Provider store={store}>
        <BrowserRouter>
          <AuthHandler />
          <AppRoutes />
        </BrowserRouter>
      </Provider>
    // </ThemeProvider>
  );
}
