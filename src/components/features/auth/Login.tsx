import { useEffect, useState } from 'react';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { useNavigate, Link } from 'react-router-dom';
import { loginRequest } from '../../../authConfig';
import { authService } from '../../../services/authService';
import { useAppDispatch, useAppSelector } from '../../../store';
import { setAuth, setLoading } from '../../../store/slices/authSlice';

export function Login() {
  const { instance, accounts, inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const reduxUser = useAppSelector((state) => state.auth.user);
  const isAppLoading = useAppSelector((state) => state.auth.isLoading);

  // Estado para login local
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const [azureLoading, setAzureLoading] = useState(false);
  const [waitingForSync, setWaitingForSync] = useState(false);

  // Redirect to dashboard if already authenticated with Azure
  useEffect(() => {
    console.log('🟡 [Login] useEffect triggered:', {
      isAuthenticated,
      inProgress,
      accountsLength: accounts?.length,
      hasReduxUser: !!reduxUser,
      reduxUserEmail: reduxUser?.email
    });

    // Solo redirigir si está autenticado Y no está en proceso de login Y tiene cuentas
    const justLoggedOut = (() => { try { return localStorage.getItem('mro_just_logged_out') === 'true'; } catch { return false; } })();

    if (justLoggedOut) {
      console.log('🟡 [Login] User just logged out, clearing flag');
      try { localStorage.removeItem('mro_just_logged_out'); } catch {}
      setWaitingForSync(false);
      return;
    }

    if (isAuthenticated && inProgress === 'none' && accounts && accounts.length > 0 && !justLoggedOut) {
      console.log('🟡 [Login] User authenticated with Azure');

      // Establecer la cuenta activa para que el logout no pida selección
      try {
        if (!instance.getActiveAccount()) {
          instance.setActiveAccount(accounts[0]);
          console.log('🟡 [Login] Active account set');
        }
      } catch (err) {
        console.warn('⚠️ [Login] Error setting active account:', err);
      }

      // WAIT for AuthHandler to finish processing and populate Redux user
      // Only redirect when we have a user in Redux
      if (reduxUser) {
        console.log('✅ [Login] User is in Redux, redirecting to dashboard...');
        console.log('✅ [Login] Redux user:', reduxUser);
        navigate('/', { replace: true });
      } else {
        console.log('⏳ [Login] User authenticated with Azure, waiting for Redux to sync...');
        setWaitingForSync(true);

        // Timeout: If Redux doesn't sync within 10 seconds, force navigation
        const syncTimeout = setTimeout(() => {
          console.warn('⚠️ [Login] Redux sync timeout after 10 seconds, forcing navigation...');
          navigate('/', { replace: true });
        }, 10000);

        return () => clearTimeout(syncTimeout);
      }
    } else {
      console.log('🟡 [Login] Not authenticated or in progress, hiding waiting screen');
      setWaitingForSync(false);
    }
  }, [isAuthenticated, inProgress, accounts, navigate, instance, reduxUser]);

  const handleAzureLogin = () => {
    setAzureLoading(true);
    // Note: We don't need to dispatch(setLoading(true)) here because
    // loginRedirect will reload the page completely. When the user comes back
    // from Microsoft, Redux will initialize with isLoading: true by default
    // and AuthHandler will manage the loading state
    instance.loginRedirect(loginRequest).catch((e) => {
      console.error('Login error:', e);
      setAzureLoading(false);
    });
  };

  const handleLocalLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLocalLoading(true);

    try {
      // Set global loading state for the app
      dispatch(setLoading(true));

      const response = await authService.loginLocal({ email, password });
      authService.saveToken(response.token);

      // Mapear roles del backend a roles del frontend
      const roleMap: Record<string, 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager'> = {
        'Engineer': 'user',
        'Keeper': 'user',
        'Manager': 'manager',
        'Director': 'administrator',
      };

      const frontendRole = roleMap[response.user.roleName] || 'user';

      const departmentId = response.user.departmentId ? String(response.user.departmentId) : response.user.department || '';
      const departmentName = response.user.departmentName || response.user.department || 'Engineering';

      // Guardar token y usuario en localStorage
      authService.saveToken(response.token);
      authService.saveUser(response.user);

      // Actualizar Redux con el usuario y token del backend
      dispatch(
        setAuth({
          user: {
            id: String(response.user.id),
            name: response.user.name,
            email: response.user.email,
            employeeId: response.user.employeeId,
            role: frontendRole,
            department: departmentId,
            departmentId,
            departmentName,
            warehouse: response.user.warehouseId ?? undefined,
            warehouseId: response.user.warehouseId, // ej: 1
            roleName: response.user.roleName, // ej: "Keeper"
            backendAuthType: response.user.authType, // 0=Local, 1=Azure, 2=Both
          },
          accessToken: response.token,
          authType: 'local',
        })
      );
      console.log('✅ Login local exitoso:', response.user);
      console.log('🎫 Token guardado en localStorage');

      // Navigate to dashboard - Layout will handle setLoading(false) when mounted
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
      console.error('❌ Login error:', err);
      dispatch(setLoading(false));
    } finally {
      setLocalLoading(false);
    }
  };

  // Show loading screen while waiting for Azure auth to sync with Redux
  if (waitingForSync) {
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
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          overflow: 'hidden',
        }}
      >
        {/* Logo */}
        <img
          src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/d6e90988-9b25-45db-967a-f110ffa9cfd3/amaxst+logo+side-07.png?format=750w"
          alt="AMAXST Logo"
          style={{
            height: '80px',
            width: 'auto',
            objectFit: 'contain',
            marginBottom: '40px',
          }}
        />

        {/* Spinner */}
        <div
          style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(96, 165, 250, 0.2)',
            borderTop: '4px solid rgb(96, 165, 250)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />

        {/* Text */}
        <h2
          style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: '600',
            marginTop: '30px',
            marginBottom: '10px',
          }}
        >
          Completing Microsoft Login
        </h2>

        <p
          style={{
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
          }}
        >
          Syncing your account information...
        </p>

        {/* Animation styles */}
        <style>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 p-12 flex-col justify-between relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <img
              src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/d6e90988-9b25-45db-967a-f110ffa9cfd3/amaxst+logo+side-07.png?format=750w"
              alt="AMAXST Logo"
              className="h-15 w-auto object-contain"
            />
          </div>

          {/* Main heading */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Welcome to Your Inventory Hub
            </h1>
            {/* <p className="text-xl text-blue-100/80 leading-relaxed">
              Streamline your maintenance, repair, and operations with our enterprise-grade management platform.
            </p> */}
          </div>
        </div>

        {/* Features */}
        <div className="relative z-10 grid grid-cols-2 gap-6">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Real-time Tracking</h3>
              <p className="text-sm text-green-100/60">Monitor inventory levels instantly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-medium mb-1">Team Collaboration</h3>
              <p className="text-sm text-green-100/60">Work together seamlessly</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-green-100/50 text-sm">
          © 2025 MRO Inventory System. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <img
              src="https://images.squarespace-cdn.com/content/v1/6449f0be1aea3b0d974f5af0/6cdb1a2e-b659-4239-86a6-8c625f29a16f/amaxst+logo+side-04.png"
              alt="AMAXST Logo"
              className="h-10 w-auto object-contain"
            />
          </div>

          {/* Welcome Text */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
              Sign in
            </h2>
            <p className="text-gray-500 dark:text-muted-foreground">
              Access your inventory management dashboard
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-card rounded-2xl shadow-sm border border-gray-200 dark:border-border p-8">
            {/* Local Login Form */}
            <form onSubmit={handleLocalLogin} className="space-y-5">
              {error && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                  placeholder="your_email@amaxst.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-input bg-white dark:bg-background text-gray-900 dark:text-foreground rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-primary focus:border-transparent transition-all placeholder:text-gray-400 dark:placeholder:text-muted-foreground"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={localLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {localLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-card text-gray-500 dark:text-muted-foreground">Or continue with</span>
                </div>
              </div>

              {/* Azure Login Button */}
              <button
                type="button"
                onClick={handleAzureLogin}
                disabled={azureLoading || localLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border-2 border-gray-300 dark:border-input rounded-xl font-medium text-gray-700 dark:text-foreground bg-white dark:bg-background hover:bg-gray-50 dark:hover:bg-accent hover:border-gray-400 dark:hover:border-border focus:outline-none focus:ring-4 focus:ring-gray-500/10 dark:focus:ring-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {azureLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-gray-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span className="text-base">Signing in...</span>
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" viewBox="0 0 21 21">
                      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
                    </svg>
                    <span className="text-base">Continue with Microsoft</span>
                  </>
                )}
              </button>

              <div className="text-center pt-4 border-t border-gray-100 dark:border-border">
                <p className="text-sm text-gray-600 dark:text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
