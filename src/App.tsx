import { Provider } from 'react-redux';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { store, useAppDispatch, useAppSelector } from './store';
import { setAuth, setLoading, setUserPhoto } from './store/slices/authSlice';
import { loginRequest } from './authConfig';
import { getUserProfile, getUserPhoto } from './services/graphService';
import { authService } from './services/authService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/features/dashboard/Dashboard';
import { InventoryManager } from './components/features/inventory/InventoryManager';
import { RequestOrders } from './components/features/loans/RequestOrders';
import { PurchaseOrders } from './components/features/orders/PurchaseOrders';
import { Main } from './components/features/orders/Main';
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
import { Login, Register, ProtectedRoute, LoadingScreen } from './components/features/auth';
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
  RequestOrders as EngineerRequestOrders
} from './components/features/enginner';
import { EngineerModuleWrapper } from './components/features/enginner/EngineerModuleWrapper';

// Auth Handler Component
function AuthHandler() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      // 1. Don't run if MSAL is still loading
      if (inProgress !== InteractionStatus.None) {
        return;
      }

      // 2. Don't run logic on Login/Register pages UNLESS user is authenticated with Azure
      // (user just came back from Microsoft login redirect)
      const isAuthenticatedWithAzure = isAuthenticated && accounts.length > 0;
      if ((location.pathname === '/login' || location.pathname === '/register') && !isAuthenticatedWithAzure) {
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

          // Determine if user originally authenticated with Azure
          const isAzureUser = backendUser.authType === 1 || backendUser.authType === 2; // 1=Azure, 2=Both

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
                backendAuthType: backendUser.authType, // 0=Local, 1=Azure, 2=Both
                photoUrl: undefined, // Will be loaded below if Azure user
              },
              accessToken: localToken,
              authType: isAzureUser ? 'azure' : 'local',
            })
          );

          console.log('✅ User session restored:', backendUser.email);

          // If user authenticated with Azure, try to load photo in background
          if (isAzureUser && isAuthenticated && accounts.length > 0) {
            console.log('🔵 [AuthHandler] Restoring Azure user, loading photo in background...');
            try {
              const graphTokenRequest = {
                scopes: ['User.Read'],
                account: accounts[0],
              };
              const graphTokenResponse = await instance.acquireTokenSilent(graphTokenRequest);

              // Load photo in background (non-blocking)
              getUserPhoto(graphTokenResponse.accessToken).then(photoUrl => {
                if (photoUrl) {
                  console.log('✅ [AuthHandler] User photo loaded after session restore');
                  dispatch(setUserPhoto(photoUrl));
                }
              }).catch(photoError => {
                console.warn('⚠️ Failed to load user photo after session restore:', photoError);
              });
            } catch (graphError) {
              console.warn('⚠️ Could not get Graph token for photo:', graphError);
            }
          }

          // Session restored successfully - hide loading screen
          // Note: We call setLoading(false) here directly instead of waiting for Layout
          // to avoid race conditions on F5 refresh
          console.log('✅ [AuthHandler] Session restored, hiding loading screen');
          dispatch(setLoading(false));
          return; // Stop here if local token worked (don't check Azure)

        } catch (error) {
          console.warn('⚠️ Local token invalid, clearing session...');
          authService.removeUser();
          authService.removeToken();
          // Clear the invalid session and let the flow continue to check Azure or redirect to login
          // Don't return here - allow flow to continue to check if Azure is authenticated
        }
      }

      // 4. CASE B: Check for Azure Login (New login or SSO)
      // BUT: Don't auto-login if user just logged out
      const justLoggedOut = localStorage.getItem('mro_just_logged_out') === 'true';

      if (justLoggedOut) {
        console.log('🔵 [AuthHandler] User just logged out, skipping auto-login');
        localStorage.removeItem('mro_just_logged_out');
        dispatch(setLoading(false));
        return;
      }

      if (isAuthenticated && accounts.length > 0) {
        console.log('🔵 [AuthHandler] Starting Azure authentication process...');

        // Create abort controller for timeout
        const abortController = new AbortController();
        const timeoutId = setTimeout(() => {
          console.error('❌ [AuthHandler] Azure authentication timeout after 10 seconds');
          abortController.abort();
        }, 10000); // 10 second timeout

        try {
          // A. Get Access Token for Backend
          console.log('🔵 [AuthHandler] Getting API token...');
          const apiTokenRequest = {
            ...loginRequest,
            account: accounts[0],
          };
          const apiTokenResponse = await instance.acquireTokenSilent(apiTokenRequest);
          console.log('✅ [AuthHandler] API token acquired');

          // B. (Optional) Get Graph Data (Profile and Photo)
          let graphProfile = null;

          try {
            console.log('🔵 [AuthHandler] Fetching Graph API profile...');
            const graphTokenRequest = {
              scopes: ['User.Read'],
              account: accounts[0],
            };
            const graphTokenResponse = await instance.acquireTokenSilent(graphTokenRequest);

            // Fetch profile (fast, required)
            graphProfile = await getUserProfile(graphTokenResponse.accessToken);
            console.log('✅ [AuthHandler] Graph API profile fetched');

            // Fetch photo (slow, optional) - don't block authentication
            // Load photo in background after auth completes
            getUserPhoto(graphTokenResponse.accessToken).then(photoUrl => {
              if (photoUrl) {
                console.log('✅ [AuthHandler] User photo loaded in background');
                dispatch(setUserPhoto(photoUrl));
              }
            }).catch(photoError => {
              console.warn('⚠️ Failed to load user photo in background:', photoError);
            });

          } catch (graphError) {
            console.warn('⚠️ Could not fetch Graph API data, continuing with basic info...', graphError);
          }

          const account = apiTokenResponse.account;

          // C. Call Backend Login with timeout
          console.log('🔵 [AuthHandler] Calling backend login API...');

          // Check if aborted
          if (abortController.signal.aborted) {
            throw new Error('Authentication timeout - backend did not respond');
          }

          const backendResponse = await authService.loginWithAzure({
            azureToken: apiTokenResponse.accessToken,
            userInfo: {
              objectId: account?.localAccountId || account?.homeAccountId || '',
              email: graphProfile?.mail || graphProfile?.userPrincipalName || account?.username || '',
              name: graphProfile?.displayName || account?.name || 'Unknown User',
            },
          });

          // Clear timeout on success
          clearTimeout(timeoutId);
          console.log('✅ [AuthHandler] Backend login successful');

          // D. Save Persistence
          authService.saveToken(backendResponse.token);
          authService.saveUser(backendResponse.user);
          console.log('✅ [AuthHandler] Token and user saved to localStorage');

          // E. Update Redux (photo will be added later when it loads)
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
            photoUrl: undefined, // Photo will be loaded in background
            warehouseId: backendResponse.user.warehouseId,
            backendAuthType: backendResponse.user.authType, // 0=Local, 1=Azure, 2=Both
          };

          dispatch(
            setAuth({
              user: userForRedux,
              accessToken: backendResponse.token,
              authType: 'azure',
            })
          );

          console.log('✅ [AuthHandler] User authenticated with Azure and synced to Redux:', userForRedux.email);
          console.log('✅ [AuthHandler] Redux state updated, now hiding loading screen...');

          // Simplified: Just hide loading immediately after Redux update
          dispatch(setLoading(false));
          console.log('✅ [AuthHandler] Loading screen hidden');

        } catch (error) {
          clearTimeout(timeoutId);
          console.error('❌ [AuthHandler] Error acquiring token or logging in:', error);

          // Show user-friendly error message
          if (error instanceof Error) {
            if (error.message.includes('timeout')) {
              alert('Authentication timeout. Please check your internet connection and try again.');
            } else {
              alert('Authentication failed. Please try logging in again.');
            }
          }

          // Clear any partial auth state
          authService.removeUser();
          authService.removeToken();

          // Always hide loading screen on error
          dispatch(setLoading(false));

          // Redirect to login if we're not already there
          if (location.pathname !== '/login') {
            navigate('/login');
          }
        }
      } else {
        console.log('🔵 [AuthHandler] User not authenticated, hiding loading screen');
        // User not authenticated (and no local token)
        dispatch(setLoading(false));
      }
    };

    initAuth();
  }, [isAuthenticated, accounts, inProgress, instance, dispatch, location.pathname, navigate]);

  return null;
}

// Wrapper components for route navigation
function CycleCountWrapper() {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const keeperName = user?.name || 'Unknown';
  
  const handleStartCycleCount = async (data: { countName: string; zone: string; countType: 'Annual' | 'Biannual' | 'Spot Check'; auditor: string }) => {
    try {
      const { createCycleCount, getCycleCountEntries, mapZoneToZoneId } = await import('./components/features/cycle-count/services/cycleCountService');
      const warehouseId = user?.warehouseId || 1;
      const userId = Number(user?.id) || 5; // Use logged in user's ID, fallback to 5
      
      console.log('📄 Creating cycle count with:', { 
        countName: data.countName, 
        warehouseId, 
        zone: data.zone,
        countType: data.countType,
        zoneId: mapZoneToZoneId(data.zone), 
        userId 
      });
      
      // Create cycle count via API
      // Include countType in the countName so it's preserved when retrieved from API
      const countNameWithType = `${data.countName} (${data.countType})`;
      const cycleCountResponse = await createCycleCount({
        countName: countNameWithType,
        warehouseId: warehouseId,
        zoneId: mapZoneToZoneId(data.zone),
        createdByUserId: userId,
        showSystemQuantity: true,
        notes: ''
      });

      console.log('✅ Cycle count created:', cycleCountResponse);

      // Fetch entries for the created cycle count
      const entriesResponse = await getCycleCountEntries(cycleCountResponse.id);
      console.log('✅ Cycle count entries fetched:', {
        entriesCount: entriesResponse.data.length,
        totalCount: entriesResponse.totalCount,
        cycleCountZoneName: cycleCountResponse.zoneName,
        cycleCountZoneId: cycleCountResponse.zoneId,
        firstEntry: entriesResponse.data[0]
      });

      // Navigate to active count view with the created cycle count data
      // Use logged in user's name as auditor instead of the one from modal
      // Store entries.data array (the paginated response contains a data array)
      sessionStorage.setItem('cycleCountActiveData', JSON.stringify({
        cycleCount: cycleCountResponse,
        entries: entriesResponse.data, // Extract data array from paginated response
        initialConfig: {
          ...data,
          auditor: keeperName // Use logged in user's name
        }
      }));
      
      navigate('/cycle-count/active');
    } catch (error) {
      console.error('❌ Error creating cycle count:', error);
      alert('Failed to start cycle count. Please try again.');
    }
  };
  
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

  const handleContinueCycleCount = async (record: any) => {
    try {
      const { getCycleCountDetail, resumeCycleCount } = await import('./components/features/cycle-count/services/cycleCountService');
      
      console.log('🔧 [handleContinueCycleCount] Loading cycle count ID:', record.id);
      console.log('🔧 [handleContinueCycleCount] Record:', record);
      
      // Fetch the latest data from API
      const cycleCountDetail = await getCycleCountDetail(record.id);
      
      console.log('✅ [handleContinueCycleCount] Loaded cycle count:', {
        id: cycleCountDetail.id,
        statusName: cycleCountDetail.statusName,
        zoneName: cycleCountDetail.zoneName,
        zoneId: cycleCountDetail.zoneId,
        entriesCount: cycleCountDetail.entries.length,
        countedEntries: cycleCountDetail.countedEntries
      });
      
      // If the cycle count is paused, resume it first
      if (cycleCountDetail.statusName === 'Paused' || cycleCountDetail.status === 1) {
        console.log('🔧 [handleContinueCycleCount] Cycle count is paused, resuming...');
        await resumeCycleCount(record.id);
        console.log('✅ [handleContinueCycleCount] Cycle count resumed successfully');
      }
      
      // Normalize zone name for the UI
      // API returns: null/'All Zones' -> 'all', 'Good Condition' -> 'Good Condition', etc.
      let normalizedZone: string;
      
      if (!cycleCountDetail.zoneName) {
        // Null means All Zones
        normalizedZone = 'all';
      } else if (cycleCountDetail.zoneName.toLowerCase().includes('all')) {
        // 'All Zones' string means all zones
        normalizedZone = 'all';
      } else {
        // Specific zone names: 'Good Condition', 'Damaged', 'Quarantine'
        normalizedZone = cycleCountDetail.zoneName;
      }
      
      console.log('🔧 [handleContinueCycleCount] Original zoneName:', cycleCountDetail.zoneName, '-> Normalized:', normalizedZone);
      
      // Store in sessionStorage for CycleCountActiveWrapper to use
      sessionStorage.setItem('cycleCountActiveData', JSON.stringify({
        cycleCount: cycleCountDetail,
        entries: cycleCountDetail.entries,
        initialConfig: {
          zone: normalizedZone,
          countType: record.countType || 'Annual',
          auditor: keeperName
        }
      }));
      
      console.log('🔧 [handleContinueCycleCount] Stored in sessionStorage, navigating to /cycle-count/active');
      
      navigate('/cycle-count/active');
    } catch (error) {
      console.error('❌ Error loading cycle count for continuation:', error);
      alert('Failed to load cycle count. Please try again.');
    }
  };

  return (
    <CycleCount
      onStartCycleCount={handleStartCycleCount}
      onViewCycleCount={(record) => {
        // Pass the record with ID and countType so CycleCountDetailView can load from API
        handleNavigate('/cycle-count/detail', { countData: { id: record.id, countType: record.countType } });
      }}
      onCompleteCycleCount={handleCompleteCycleCount}
      onContinueCycleCount={handleContinueCycleCount}
      keeperName={keeperName}
    />
  );
}

function CycleCountDetailPage() {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const keeperName = user?.name || 'Unknown';
  
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
      keeperName={keeperName}
    />
  );
}

function CycleCountActiveWrapper() {
  const navigate = useNavigate();
  const user = useAppSelector(state => state.auth.user);
  const keeperName = user?.name || 'Unknown';

  // Get data from newly created cycle count (from POST /api/cycle-counts)
  const activeDataString = sessionStorage.getItem('cycleCountActiveData');
  const activeData = activeDataString ? JSON.parse(activeDataString) : null;
  
  console.log('🔧 [CycleCountActiveWrapper] activeData:', activeData ? {
    hasCycleCount: !!activeData.cycleCount,
    cycleCountId: activeData.cycleCount?.id,
    hasEntries: !!activeData.entries,
    entriesCount: activeData.entries?.length,
    hasInitialConfig: !!activeData.initialConfig
  } : null);
  
  // Obtener datos existentes si se está continuando un conteo (from history)
  const stateData = sessionStorage.getItem('cycleCountState');
  const state = stateData ? JSON.parse(stateData) : null;
  const existingCountData = state?.existingCountData;
  
  // Get initial configuration from activeData (new count) or from state (existing count)
  // Always use logged in user's name as auditor
  const initialConfig = activeData?.initialConfig 
    ? { ...activeData.initialConfig, auditor: keeperName }
    : undefined;
  
  console.log('🔧 [CycleCountActiveWrapper] initialConfig:', initialConfig);
  
  // Convert API entries to Article format if we have activeData
  let countDataWithArticles = existingCountData;
  
  if (activeData?.entries && activeData?.cycleCount) {
    // Check if there are no entries for this zone
    if (activeData.entries.length === 0) {
      console.warn('⚠️ [CycleCountActiveWrapper] No entries found for this cycle count');
      console.warn('⚠️ This usually means there are no items in the selected zone');
      
      // Still pass the cycleCountId so the system knows it's a real cycle count
      countDataWithArticles = {
        id: activeData.cycleCount.id,
        articles: [],
        countType: initialConfig?.countType || 'Annual',
        auditor: keeperName,
        zone: initialConfig?.zone || 'all'
      };
    } else {
      // Normalize zone name for the UI
      const cycleZoneName = activeData.cycleCount.zoneName;
    let normalizedZone: string;
    
    if (!cycleZoneName) {
      normalizedZone = 'all';
    } else if (cycleZoneName.toLowerCase().includes('all')) {
      normalizedZone = 'all';
    } else {
      // Preserve specific zone names: 'Good Condition', 'Damaged', 'Quarantine'
      normalizedZone = cycleZoneName;
    }
    
    // Map zone name for articles
    let zone: 'Good Condition' | 'Damaged' | 'Quarantine' = 'Good Condition';
    if (cycleZoneName) {
      const zoneNameLower = cycleZoneName.toLowerCase();
      if (!zoneNameLower.includes('all')) {
        if (cycleZoneName === 'Damaged' || cycleZoneName === 'damaged') {
          zone = 'Damaged';
        } else if (cycleZoneName === 'Quarantine' || cycleZoneName === 'quarantine') {
          zone = 'Quarantine';
        } else {
          zone = 'Good Condition';
        }
      }
    }
    
    console.log('🔧 [CycleCountActiveWrapper] Zone mapping:', {
      originalZoneName: cycleZoneName,
      normalizedZone,
      articleZone: zone
    });
    
    const mappedArticles = activeData.entries.map((entry: any) => {
      // Determine if entry has been counted
      const hasBeenCounted = entry.countedAt !== null || entry.countedByUserId !== null;
      
      let status: 'match' | 'discrepancy' | undefined = undefined;
      const statusNameLower = entry.statusName?.toLowerCase() || '';
      if (statusNameLower === 'match' || statusNameLower === 'matched') {
        status = 'match';
      } else if (statusNameLower === 'discrepancy' || statusNameLower === 'variance') {
        status = 'discrepancy';
      } else if (hasBeenCounted && entry.variance === 0) {
        status = 'match';
      } else if (hasBeenCounted && entry.variance !== 0) {
        status = 'discrepancy';
      }
      
      // Include physicalCount if the entry has been counted (even if it's 0)
      const physicalCount = hasBeenCounted ? entry.physicalCount : undefined;
      
      return {
        id: entry.itemSku || entry.id.toString(),
        code: entry.itemSku,
        description: entry.itemName,
        type: 'non-consumable' as const,
        zone,
        totalRegistered: entry.systemQuantity,
        physicalCount,
        status,
        observations: entry.notes || undefined
      };
    });
    
    console.log('🔧 [CycleCountActiveWrapper] Mapped articles:', {
      count: mappedArticles.length,
      countedArticles: mappedArticles.filter(a => a.physicalCount !== undefined).length,
      zones: [...new Set(mappedArticles.map(a => a.zone))],
      selectedZone: normalizedZone,
      sampleCountedArticle: mappedArticles.find(a => a.physicalCount !== undefined)
    });
    
      countDataWithArticles = {
        id: activeData.cycleCount.id,
        articles: mappedArticles,
        countType: initialConfig?.countType || 'Annual',
        auditor: keeperName,
        zone: normalizedZone
      };
    } // Cierre del else que tiene entries
  }
  
  // Don't clear config immediately - let it be used by the hook first
  // It will be cleared when completing or saving progress

  const handleCompleteCycleCount = (completedData: any) => {
    // Only add to history when Complete Count is pressed
    const cycleCountId = activeData?.cycleCount?.id || existingCountData?.id;
    
    if (cycleCountId) {
      // Store in history with the cycle count ID from API
      const existingHistory = sessionStorage.getItem('cycleCountHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const index = history.findIndex((h: any) => h.id === cycleCountId);
      if (index !== -1) {
        // Update existing record
        history[index] = {
          ...history[index],
          ...completedData,
          id: cycleCountId
        };
      } else {
        // Add new record with API ID
        const newRecord = {
          id: cycleCountId,
          ...completedData
        };
        history.unshift(newRecord);
      }
      
      sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    }
    
    // Limpiar el estado y regresar a la página principal
    sessionStorage.removeItem('cycleCountState');
    sessionStorage.removeItem('cycleCountInitialConfig');
    sessionStorage.removeItem('cycleCountActiveData');
    navigate('/cycle-count');
  };

  const handleSaveProgress = (progressData: any) => {
    // Only add to history when Save Progress is pressed
    const cycleCountId = activeData?.cycleCount?.id || existingCountData?.id;
    
    if (cycleCountId) {
      // Store in history with the cycle count ID from API
      const existingHistory = sessionStorage.getItem('cycleCountHistory');
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      const index = history.findIndex((h: any) => h.id === cycleCountId);
      if (index !== -1) {
        // Update existing record
        history[index] = {
          ...history[index],
          ...progressData,
          id: cycleCountId
        };
      } else {
        // Add new record with API ID
        const newRecord = {
          id: cycleCountId,
          ...progressData
        };
        history.unshift(newRecord);
      }
      
      sessionStorage.setItem('cycleCountHistory', JSON.stringify(history));
    }
    
    // Limpiar el estado y regresar a la página principal
    sessionStorage.removeItem('cycleCountState');
    sessionStorage.removeItem('cycleCountInitialConfig');
    sessionStorage.removeItem('cycleCountActiveData');
    navigate('/cycle-count');
  };

  return (
    <CycleCountView
      onBack={() => {
        sessionStorage.removeItem('cycleCountState');
        sessionStorage.removeItem('cycleCountInitialConfig');
        sessionStorage.removeItem('cycleCountActiveData');
        navigate('/cycle-count');
      }}
      onComplete={handleCompleteCycleCount}
      onSaveProgress={handleSaveProgress}
      existingCountData={countDataWithArticles}
      initialConfig={initialConfig}
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
    <Main
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
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const location = useLocation();

  // Show loading screen during authentication, but not on login/register pages
  const shouldShowLoading = isLoading && location.pathname !== '/login' && location.pathname !== '/register';

  if (shouldShowLoading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* 1. PUBLIC ROUTES                                          */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Catch-all for 404 */}
      <Route path="*" element={<NotFound />} />

      {/* 2. PROTECTED ROUTES (Require Login)*/}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard - Accessible by all logged in users */}
        <Route index element={<Dashboard />} />

        {/* Backend Rule: [Authorize(Roles = "Keeper,Engineer,Manager,Director")] */}
        <Route element={<RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.DIRECTOR, ROLES.ADMIN]} />}>
          {/* <Route path="orders" element={<PurchaseOrdersWrapper />} />
          <Route path="orders/detail" element={<OrderDetailWrapper />} /> */}
          <Route path="requests" element={<RequestManagement />} />
        </Route>

        {/* 3. ENGINEER SPECIFIC ROUTES                               */}
        <Route element={<RoleGuard allowedRoles={[ROLES.ENGINEER, ROLES.COLLABORATOR, ROLES.ADMIN]} />}>
          <Route path="engineer/catalog" element={<EngineerModuleWrapper><EngineerCatalog /></EngineerModuleWrapper>} />
          <Route path="engineer/requests" element={<EngineerModuleWrapper><EngineerRequestOrdersWrapper /></EngineerModuleWrapper>} />
          <Route path="engineer/my-inventory" element={<EngineerModuleWrapper><EngineerMyInventory /></EngineerModuleWrapper>} />
        </Route>

        {/* 4. KEEPER SPECIFIC ROUTES                                 */}
        <Route element={<RoleGuard allowedRoles={[ROLES.KEEPER, ROLES.ADMIN]} />}>
          <Route path="inventory" element={<InventoryManager />} />
          <Route path="quick-find" element={<QuickFind />} />
          <Route path="cycle-count" element={<CycleCountWrapper />} />
          <Route path="cycle-count/active" element={<CycleCountActiveWrapper />} />
          <Route path="cycle-count/detail" element={<CycleCountDetailPage />} />
          <Route path="manage-requests" element={<ManageRequestsPage />} />
          {/* <Route path="orders" element={<PurchaseOrdersWrapper />} /> */}

        </Route>

        <Route element={<RoleGuard allowedRoles={[ROLES.MANAGER]} />}>
          <Route path="orders" element={<PurchaseOrdersWrapper />} />

        </Route>


        {/* 5. MANAGER & DIRECTOR SPECIFIC ROUTES                     */}
        <Route element={<RoleGuard allowedRoles={[ROLES.MANAGER, ROLES.DIRECTOR, ROLES.ADMIN]} />}>

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
        <Toaster
          position="top-center"
          reverseOrder={false}
          containerStyle={{
            zIndex: 50,
          }}
          toastOptions={{
            error: {
              style: {
                color: '#C62828',
                border: '2px solid #C62828',
                fontWeight: 'bold',
              },
              iconTheme: {
                primary: '#C62828',
                secondary: '#FFFAEE',
              },
              duration: 5000,
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

