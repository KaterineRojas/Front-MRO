import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { store, useAppDispatch } from './store';
import { setAuth, setLoading, setUserPhoto } from './store/slices/authSlice';
import { loginRequest } from './authConfig';
import { getUserProfileWithPhoto } from './services/graphService';
import { authService } from './services/authService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { InventoryManager } from './components/features/inventory/InventoryManager';
import { RequestOrders } from './components/features/loans/RequestOrders';
import { PurchaseOrders } from './components/features/orders/PurchaseOrders';
import { RequestManagement } from './components/features/requests/RequestManagement';
import { Reports } from './components/features/reports/Reports';
import { UserManagement } from './components/features/users/UserManagement';
import { QuickFind } from './components/features/quick-find/QuickFind';
import { CycleCount } from './components/features/cycle-count/CycleCount';
import { LoanDetailView } from './components/features/loans/LoanDetailView';
import { OrderDetailView } from './components/features/orders/OrderDetailView';
import { CycleCountView } from './components/features/cycle-count/CycleCountView';
import { ThemeProvider } from "next-themes";
import { ReturnItemsPage } from './components/features/loans/ReturnItemsPage';
import { ManageRequestsPage } from './components/features/manage-requests/pages/ManageRequestsPage';
import { Toaster } from 'react-hot-toast';
import { Login, Register, ProtectedRoute } from './components/features/auth';

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
  const location = useLocation();

  useEffect(() => {
    const initAuth = async () => {
      // Wait for MSAL to finish initialization
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      // No intentar autenticar si estamos en la página de login o registro
      if (location.pathname === '/login' || location.pathname === '/register') {
        dispatch(setLoading(false));
        return;
      }

      // Check for local token first
      const localToken = authService.getToken();
      if (localToken) {
        try {
          const backendUser = await authService.getCurrentUser(localToken);

          // Mapear roles del backend a roles del frontend
          const roleMap: Record<string, 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager'> = {
            'Engineer': 'user',
            'Keeper': 'user',
            'Manager': 'manager',
            'Director': 'administrator',
          };

          const frontendRole = roleMap[backendUser.roleName] || 'user';

          // Actualizar Redux con el usuario
          dispatch(
            setAuth({
              user: {
                id: String(backendUser.id),
                name: backendUser.name,
                email: backendUser.email,
                employeeId: backendUser.employeeId,
                role: backendUser.role,
                roleName: backendUser.roleName,
                department: backendUser.departmentId ? String(backendUser.departmentId) : 'Engineering',
              },
              accessToken: localToken,
              authType: 'local',
            })
          );
          console.log('✅ Usuario autenticado con token local:', backendUser.email);
          return; // Don't check Azure if local token is valid
        } catch (error) {
          // Token inválido, eliminarlo
          console.warn('⚠️ Token local inválido, removiendo...');
          authService.removeToken();
        }
      }

      // If user is authenticated with Azure, get token and update Redux store
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

          // 3. Call backend to get JWT token
          const account = apiTokenResponse.account;
          const backendResponse = await authService.loginWithAzure({
            azureToken: apiTokenResponse.accessToken,
            userInfo: {
              objectId: account.localAccountId || '',
              email: graphProfile?.mail || graphProfile?.userPrincipalName || account.username || '',
              name: graphProfile?.displayName || account.name || 'Unknown User',
            },
          });

          // 4. Save backend JWT token to localStorage
          authService.saveToken(backendResponse.token);

          // 5. Map backend role to frontend role
          const roleMap: Record<string, 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager'> = {
            'Engineer': 'user',
            'Keeper': 'user',
            'Manager': 'manager',
            'Director': 'administrator',
          };

          const frontendRole = roleMap[backendResponse.user.roleName] || 'user';

          const user = {
            id: String(backendResponse.user.id),
            name: backendResponse.user.name,
            email: backendResponse.user.email,
            employeeId: backendResponse.user.employeeId,
            role: frontendRole,
            department: backendResponse.user.departmentId ? String(backendResponse.user.departmentId) : graphProfile?.department || 'Engineering',
            jobTitle: graphProfile?.jobTitle,
            mobilePhone: graphProfile?.mobilePhone,
            officeLocation: graphProfile?.officeLocation,
            photoUrl: graphPhotoUrl || undefined,
          };

          // 6. Update Redux store with backend JWT token
          dispatch(
            setAuth({
              user,
              accessToken: backendResponse.token,
              authType: 'azure',
            })
          );

          console.log('✅ User authenticated with Azure:', user.email);
          console.log('✅ Backend JWT token saved to localStorage');
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
  }, [isAuthenticated, accounts, inProgress, instance, dispatch, location.pathname]);

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

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

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
        <Route path="manage-requests" element={<ManageRequestsPage />} />
        
        {/* Request Management (temporarily open) */}
        <Route path="requests" element={<RequestManagement />} />
        
        {/* User Management (temporarily open) */}
        <Route path="users" element={<UserManagement />} />
        
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
    <Provider store={store}>
      <BrowserRouter>
          <AuthHandler />
        <AppRoutes />
      </BrowserRouter>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          error: {
            style: {
              color: '#C62828',          // Texto rojo oscuro
              border: '2px solid #C62828', // Borde rojo fuerte
              fontWeight: 'bold',
            },
            iconTheme: {
              primary: '#C62828', // Color del ícono de error (la X)
              secondary: '#FFFAEE',
            },
            duration: 5000,
          },
        }}
      />
    </Provider>
  );
}

