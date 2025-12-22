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
import { CycleCount } from './components/features/cycle-count/pages/CycleCount';
import { CycleCountDetailView } from './components/features/cycle-count/pages/CycleCountDetailView';
import { LoanDetailView } from './components/features/loans/LoanDetailView';
import { OrderDetailView } from './components/features/orders/OrderDetailView';
import { CycleCountView } from './components/features/cycle-count/pages/CycleCountView';
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

          const departmentId = backendUser.departmentId ? String(backendUser.departmentId) : backendUser.department || '';
          const departmentName = backendUser.departmentName || backendUser.department || 'Engineering';
          const resolvedWarehouseId = backendUser.warehouseId ?? backendUser.warehouse ?? null;

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
                department: departmentId,
                departmentId,
                departmentName,
                warehouse: resolvedWarehouseId ?? undefined,
                warehouseId: resolvedWarehouseId ?? undefined,
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

          const departmentId = backendResponse.user.departmentId
            ? String(backendResponse.user.departmentId)
            : backendResponse.user.department || '';
          const departmentName = backendResponse.user.departmentName
            || backendResponse.user.department
            || graphProfile?.department
            || 'Engineering';
          const resolvedWarehouseId = backendResponse.user.warehouseId ?? backendResponse.user.warehouse ?? null;

          const user = {
            id: String(backendResponse.user.id),
            name: backendResponse.user.name,
            email: backendResponse.user.email,
            employeeId: backendResponse.user.employeeId,
            role: frontendRole,
            department: departmentId,
            departmentId,
            departmentName,
            warehouse: resolvedWarehouseId ?? undefined,
            warehouseId: resolvedWarehouseId ?? undefined,
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
        <Route path="cycle-count/detail" element={<CycleCountDetailPage />} />
        
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

