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
import { CycleCountDetailView } from './components/features/cycle-count/CycleCountDetailView';
import { LoanDetailView } from './components/features/loans/LoanDetailView';
import { OrderDetailView } from './components/features/orders/OrderDetailView';
import { CycleCountView } from './components/features/cycle-count/CycleCountView';
import { ThemeProvider } from "next-themes";
import { ReturnItemsPage } from './components/features/loans/ReturnItemsPage';
import { ManageRequestsPage } from './components/features/manage-requests/pages/ManageRequestsPage';
import { Toaster } from 'react-hot-toast';
import { Login, Register, ProtectedRoute } from './components/features/auth';
import { RoleGuard } from './auth/RoleGuard'
import { Unauthorized } from './pages/Unauthorized'
import { NotFound } from './pages/NotFound'

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
      // 1. Don't run if MSAL is still loading
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      // 2. Don't run logic on Login/Register pages
      if (location.pathname === '/login' || location.pathname === '/register') {
        dispatch(setLoading(false));
        return;
      }

      // 3. CASE A: Check for Local Token (Restoring session from refresh)
      const localToken = authService.getToken();

      if (localToken) {
        try {
          const backendUser = await authService.getCurrentUser(localToken);

          // Save fresh data to localStorage
          authService.saveUser(backendUser);

          // Update Redux
          dispatch(
            setAuth({
              user: {
                id: String(backendUser.id),
                name: backendUser.name,
                email: backendUser.email,

                // ✅ PASS THE NUMBER DIRECTLY
                role: backendUser.role,

                // ✅ PASS THE NAME DIRECTLY
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

          console.log('✅ User session restored:', backendUser.email);
          return; // Stop here if local token worked (don't check Azure)

        } catch (error) {
          console.warn('⚠️ Local token invalid, clearing session...');
          authService.removeUser();
        }
      }

      // 4. CASE B: Check for Azure Login (New login or SSO)
      if (isAuthenticated && accounts.length > 0) {
        try {
          // A. Get Access Token for Backend
          const apiTokenRequest = {
            ...loginRequest,
            account: accounts[0],
          };
          const apiTokenResponse = await instance.acquireTokenSilent(apiTokenRequest);

          // B. (Optional) Get Graph Data (Photo, Job Title)
          let graphProfile = null;
          let graphPhotoUrl = null;

          try {
            const graphTokenRequest = {
              scopes: ['User.Read'],
              account: accounts[0],
            };
            const graphTokenResponse = await instance.acquireTokenSilent(graphTokenRequest);
            const { profile, photoUrl } = await getUserProfileWithPhoto(graphTokenResponse.accessToken);
            graphProfile = profile;
            graphPhotoUrl = photoUrl;
          } catch (graphError) {
            console.warn('⚠️ Could not fetch Graph API data, continuing with basic info...');
          }

          const account = apiTokenResponse.account;

          // C. Call Backend Login
          const backendResponse = await authService.loginWithAzure({
            azureToken: apiTokenResponse.accessToken,
            userInfo: {
              objectId: account?.localAccountId || account?.homeAccountId || '',
              email: graphProfile?.mail || graphProfile?.userPrincipalName || account?.username || '',
              name: graphProfile?.displayName || account?.name || 'Unknown User',
            },
          });

          // D. Save Persistence
          authService.saveToken(backendResponse.token);
          authService.saveUser(backendResponse.user);

          // E. Update Redux
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
        }
      } else {
        // User not authenticated (and no local token)
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch, location.pathname]);

  return null;
}

// Wrapper components for route navigation
function CycleCountWrapper() {
  const navigate = useNavigate();
  
  const handleNavigate = (path: string, state?: any) => {
    if (state) {
      sessionStorage.setItem('cycleCountState', JSON.stringify(state));
    }
    navigate(path);
  };

  const handleCompleteCycleCount = (completedData: any) => {
    // Guardar el conteo completado en sessionStorage para agregarlo al historial
    const existingHistory = sessionStorage.getItem('cycleCountHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Agregar el nuevo registro con un ID único
    const newRecord = {
      id: Date.now(), // ID temporal basado en timestamp
      ...completedData
    };
    
    history.unshift(newRecord); // Agregar al inicio del array
    sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    
    // Regresar a la página principal de Cycle Count
    navigate('/cycle-count');
  };

  const handleContinueCycleCount = (record: any) => {
    // Navegar a la vista de conteo con los datos existentes
    handleNavigate('/cycle-count/active', { existingCountData: record });
  };
  
  return (
    <CycleCount
      onStartCycleCount={() => navigate('/cycle-count/active')}
      onViewCycleCount={(record) => {
        handleNavigate('/cycle-count/detail', { countData: record });
      }}
      onCompleteCycleCount={handleCompleteCycleCount}
      onContinueCycleCount={handleContinueCycleCount}
    />
  );
}

function CycleCountDetailPage() {
  const navigate = useNavigate();
  
  const stateData = sessionStorage.getItem('cycleCountState');
  const state = stateData ? JSON.parse(stateData) : null;
  
  const handleAdjustmentsApplied = (updatedData: any) => {
    // Update the sessionStorage with the updated data
    const currentHistory = sessionStorage.getItem('cycleCountHistory');
    const history = currentHistory ? JSON.parse(currentHistory) : [];
    
    // Check if the record already exists in the history
    const existingIndex = history.findIndex((record: any) => record.id === updatedData.id);
    
    if (existingIndex !== -1) {
      // Update existing record
      history[existingIndex] = updatedData;
    } else {
      // Add new record (coming from mock data)
      history.push(updatedData);
    }
    
    // Save updated history
    sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    
    // Update the current state
    sessionStorage.setItem('cycleCountState', JSON.stringify({ countData: updatedData }));
    
    // Navigate back to cycle count
    navigate('/cycle-count');
  };
  
  return (
    <CycleCountDetailView 
      countData={state?.countData}
      onBack={() => {
        sessionStorage.removeItem('cycleCountState');
        navigate('/cycle-count');
      }}
      onAdjustmentsApplied={handleAdjustmentsApplied}
    />
  );
}

function CycleCountActiveWrapper() {
  const navigate = useNavigate();

  // Obtener datos existentes si se está continuando un conteo
  const stateData = sessionStorage.getItem('cycleCountState');
  const state = stateData ? JSON.parse(stateData) : null;
  const existingCountData = state?.existingCountData;

  const handleCompleteCycleCount = (completedData: any) => {
    // Guardar el conteo completado en sessionStorage
    const existingHistory = sessionStorage.getItem('cycleCountHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Si estamos continuando un conteo existente, actualizar ese registro
    if (existingCountData?.id) {
      const index = history.findIndex((h: any) => h.id === existingCountData.id);
      if (index !== -1) {
        history[index] = {
          ...history[index],
          ...completedData,
          id: existingCountData.id // Mantener el mismo ID
        };
      }
    } else {
      // Agregar un nuevo registro con un ID único
      const newRecord = {
        id: Date.now(),
        ...completedData
      };
      history.unshift(newRecord);
    }
    
    sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    
    // Limpiar el estado y regresar a la página principal
    sessionStorage.removeItem('cycleCountState');
    navigate('/cycle-count');
  };

  const handleSaveProgress = (progressData: any) => {
    // Guardar el progreso en sessionStorage
    const existingHistory = sessionStorage.getItem('cycleCountHistory');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    
    // Si estamos continuando un conteo existente, actualizar ese registro
    if (existingCountData?.id) {
      const index = history.findIndex((h: any) => h.id === existingCountData.id);
      if (index !== -1) {
        history[index] = {
          ...history[index],
          ...progressData,
          id: existingCountData.id // Mantener el mismo ID
        };
      }
    } else {
      // Agregar un nuevo registro con un ID único
      const newRecord = {
        id: Date.now(),
        ...progressData
      };
      history.unshift(newRecord);
    }
    
    sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    
    // Limpiar el estado y regresar a la página principal
    sessionStorage.removeItem('cycleCountState');
    navigate('/cycle-count');
  };
  
  return (
    <CycleCountView 
      onBack={() => {
        sessionStorage.removeItem('cycleCountState');
        navigate('/cycle-count');
      }}
      onComplete={handleCompleteCycleCount}
      onSaveProgress={handleSaveProgress}
      existingCountData={existingCountData}
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
      <Route path="*" element={<NotFound />} /> {/* Your new 404 page */}

      {/* Protected Routes (Requires Login) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* --- COMMON ROUTES (Everyone) --- */}
        <Route index element={<Dashboard />} />

        {/* --- 1. ENGINEER ROUTES --- */}
        {/* Access: Engineer, Collaborator (and Admin) */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ENGINEER, ROLES.COLLABORATOR, ROLES.ADMIN]} />}>
          <Route path="engineer/catalog" element={<EngineerModuleWrapper><EngineerCatalog /></EngineerModuleWrapper>} />
          <Route path="engineer/requests" element={<EngineerModuleWrapper><EngineerRequestOrdersWrapper /></EngineerModuleWrapper>} />
          <Route path="engineer/my-inventory" element={<EngineerModuleWrapper><EngineerMyInventory /></EngineerModuleWrapper>} />
          <Route path="engineer/history" element={<EngineerModuleWrapper><EngineerCompleteHistory /></EngineerModuleWrapper>} />
        </Route>

        {/* --- 2. KEEPER ROUTES --- */}
        {/* Access: Keeper (and Admin) */}
        {/* Includes: Inventory, Orders, Cycle Counts, Quick Find, Manage Requests */}
        <Route element={<RoleGuard allowedRoles={[ROLES.KEEPER, ROLES.ADMIN]} />}>
          {/* Inventory & Finding */}
          <Route path="inventory" element={<InventoryManager />} />
          <Route path="quick-find" element={<QuickFind />} />

          {/* Orders (Purchasing) */}
          <Route path="orders" element={<PurchaseOrdersWrapper />} />
          <Route path="orders/detail" element={<OrderDetailWrapper />} />

          {/* Operations */}
          <Route path="cycle-count" element={<CycleCountWrapper />} />
          <Route path="cycle-count/active" element={<CycleCountActiveWrapper />} />
          <Route path="manage-requests" element={<ManageRequestsPage />} />

          {/* NOTE: If Keepers need to process Loans/Returns (handing out items), 
               you might need to add 'loans' routes here too. 
               If not, they are hidden based on your list. */}
        </Route>

        {/* --- 3. MANAGER & DIRECTOR ROUTES --- */}
        {/* Access: Manager, Director (and Admin) */}
        {/* Includes: Requests, Reports, Users */}
        <Route element={<RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.DIRECTOR, ROLES.ADMIN]} />}>
          <Route path="requests" element={<RequestManagement />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<UserManagement />} />
        </Route>

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

