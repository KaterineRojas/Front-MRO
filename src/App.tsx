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
import { RoleGuard } from './auth/RoleGuard'
import { Unauthorized } from './auth/Unauthorized'

const ROLES = {
  ENGINEER: 0,
  KEEPER: 1,
  MANAGER: 2,
  DIRECTOR: 3,
  COLLABORATOR: 10,
  ADMIN: 100
};

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
          authService.saveUser(backendResponse.user);

          // 5. Create User Object for Redux (MATCHING YOUR INTERFACE)
          const user = {
            id: String(backendResponse.user.id),
            name: backendResponse.user.name,
            email: backendResponse.user.email,
            employeeId: backendResponse.user.employeeId,

            role: backendResponse.user.role,

            roleName: backendResponse.user.roleName,

            department: backendResponse.user.departmentId
              ? String(backendResponse.user.departmentId)
              : graphProfile?.department || 'Engineering',

            jobTitle: graphProfile?.jobTitle,
            mobilePhone: graphProfile?.mobilePhone,
            officeLocation: graphProfile?.officeLocation,
            photoUrl: graphPhotoUrl || undefined,
            warehouseId: backendResponse.user.warehouseId,
          };

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


      if (localToken) {
        try {
          const backendUser = await authService.getCurrentUser(localToken);

          authService.saveUser(backendUser);

          dispatch(
            setAuth({
              user: {
                id: String(backendUser.id),
                name: backendUser.name,
                email: backendUser.email,

                // ✅ PASS THE NUMBER DIRECTLY (0, 1, 100, etc.)
                role: backendUser.role,

                // ✅ PASS THE NAME DIRECTLY ("Engineer", "Admin", etc.)
                roleName: backendUser.roleName,

                department: backendUser.departmentId ? String(backendUser.departmentId) : 'Engineering',
                employeeId: backendUser.employeeId,
                warehouseId: backendUser.warehouseId,
                // photoUrl: backendUser.photoUrl,
              },
              accessToken: localToken,
              authType: 'local',
            })
          );

        } catch (error) {
          authService.removeUser();
        }
      }

      // CASE 2: Azure Login Success
      if (isAuthenticated && accounts.length > 0) {
        try {
          // 1. Get Access Token for your Backend API
          const apiTokenRequest = {
            ...loginRequest,
            account: accounts[0],
          };
          const apiTokenResponse = await instance.acquireTokenSilent(apiTokenRequest);

          // 2. (Optional) Get Graph Data for extra details like photo/job title
          let graphProfile = null;
          let graphPhotoUrl = null;

          try {
            const graphTokenRequest = {
              scopes: ['User.Read'],
              account: accounts[0],
            };
            const graphTokenResponse = await instance.acquireTokenSilent(graphTokenRequest);

            // Assuming this service exists in your project
            const { profile, photoUrl } = await getUserProfileWithPhoto(graphTokenResponse.accessToken);
            graphProfile = profile;
            graphPhotoUrl = photoUrl;
          } catch (graphError) {
            console.warn('⚠️ Could not fetch Graph API data, continuing with basic info...');
          }

          const account = apiTokenResponse.account;

          // 3. Call Backend to Login/Register the user
          // ✅ HERE IS THE MISSING PART YOU ASKED FOR
          const backendResponse = await authService.loginWithAzure({
            azureToken: apiTokenResponse.accessToken,
            userInfo: {
              // We prefer Graph data, but fallback to Account data if Graph failed
              objectId: account?.localAccountId || account?.homeAccountId || '',
              email: graphProfile?.mail || graphProfile?.userPrincipalName || account?.username || '',
              name: graphProfile?.displayName || account?.name || 'Unknown User',
              // employeeId: graphProfile?.employeeId // If available in your Graph scopes
            },
          });

          // 4. Save to LocalStorage (Persistence)
          authService.saveToken(backendResponse.token);
          authService.saveUser(backendResponse.user);

          // 5. Update Redux State (UI)
          const userForRedux = {
            id: String(backendResponse.user.id),
            name: backendResponse.user.name,
            email: backendResponse.user.email,
            employeeId: backendResponse.user.employeeId,

            role: backendResponse.user.role,

            roleName: backendResponse.user.roleName,

            department: backendResponse.user.departmentId
              ? String(backendResponse.user.departmentId)
              : graphProfile?.department || 'Engineering',

            // Extra fields from Graph (Optional)
            jobTitle: graphProfile?.jobTitle,
            mobilePhone: graphProfile?.mobilePhone,
            officeLocation: graphProfile?.officeLocation,
            photoUrl: graphPhotoUrl || undefined,
            warehouseId: backendResponse.user.warehouseId,
          };

          dispatch(
            setAuth({
              user: userForRedux,
              accessToken: backendResponse.token,
              authType: 'azure',
            })
          );

          console.log('✅ User authenticated with Azure:', userForRedux.email);

        } catch (error) {
          console.error('Error acquiring token or logging in:', error);
          dispatch(setLoading(false));
          // Optional: redirect to error page or show toast
        }
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
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* --- COMMON ROUTES (Accessible by everyone logged in) --- */}
        <Route index element={<Dashboard />} />
        <Route path="quick-find" element={<QuickFind />} />
        <Route path="reports" element={<Reports />} />

        {/* --- ROLE PROTECTED ROUTES --- */}

        {/* 1. INVENTORY & PURCHASING */}
        {/* Who: Admin, Director, Manager, Keeper (Keeper needs to see inventory to work) */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER, ROLES.KEEPER]} />}>
          <Route path="inventory" element={<InventoryManager />} />
          <Route path="orders" element={<PurchaseOrdersWrapper />} />
          <Route path="orders/detail" element={<OrderDetailWrapper />} />
        </Route>

        {/* 2. LOANS & WAREHOUSE OPERATIONS */}
        {/* Who: Admin, Director, Manager, Keeper */}
        {/* Engineers (0) should NOT see this; they use the Engineer Portal instead */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER, ROLES.KEEPER]} />}>
          <Route path="loans" element={<RequestOrdersWrapper />} />
          <Route path="loans/detail" element={<LoanDetailWrapper />} />
          <Route path="loans/return" element={<ReturnItemsWrapper />} />
          <Route path="requests" element={<RequestManagement />} />
        </Route>

        {/* 3. ADMIN ONLY */}
        {/* Who: Admin only */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN]} />}>
          <Route path="users" element={<UserManagement />} />
        </Route>

        {/* 4. MANAGEMENT (Cycle Counts & Approvals) */}
        {/* Who: Admin, Director, Manager */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.DIRECTOR, ROLES.MANAGER]} />}>
          <Route path="cycle-count" element={<CycleCountWrapper />} />
          <Route path="cycle-count/active" element={<CycleCountActiveWrapper />} />
          <Route path="manage-requests" element={<ManageRequestsPage />} />
        </Route>

        {/* 5. ENGINEER MODULES (The Requester Portal) */}
        {/* Who: Admin, Engineer, Collaborator */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ADMIN, ROLES.ENGINEER, ROLES.COLLABORATOR]} />}>
          <Route path="engineer/catalog" element={<EngineerModuleWrapper><EngineerCatalog /></EngineerModuleWrapper>} />
          <Route path="engineer/requests" element={<EngineerModuleWrapper><EngineerRequestOrdersWrapper /></EngineerModuleWrapper>} />
          <Route path="engineer/my-inventory" element={<EngineerModuleWrapper><EngineerMyInventory /></EngineerModuleWrapper>} />
          <Route path="engineer/history" element={<EngineerModuleWrapper><EngineerCompleteHistory /></EngineerModuleWrapper>} />
        </Route>

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

