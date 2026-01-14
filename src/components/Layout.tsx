import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useMsal, useIsAuthenticated } from '@azure/msal-react';
import { authService } from '../services/authService';
import {
  useAppDispatch,
  useAppSelector,
  logout,
  setSidebarOpen,
  toggleDarkMode,
  setNotificationsOpen,
  setUser,
  setLoading,
} from '../store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markAllNotificationsAsRead
} from '../store/slices/notificationsSlice';
import { clearPackingRequests, clearReturns } from '../store/slices/requestsSlice';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from './ui/dropdown-menu';
import { ScrollArea } from './ui/scroll-area';
import {
  LayoutDashboard,
  Package,
  UserCheck,
  ShoppingCart,
  FileText,
  Users,
  ClipboardCheck,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  Calculator,
  LogOut,
  Search,
  PackageCheck,
  ScrollText,
  Lock,
  AlertCircle,
} from 'lucide-react';
import { SetPasswordModal } from './features/auth';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();

  // Get state from Redux
  const currentUser = useAppSelector((state) => state.auth.user);
  const authType = useAppSelector((state) => state.auth.authType);
  const isLoading = useAppSelector((state) => state.auth.isLoading);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const notificationsOpen = useAppSelector((state) => state.ui.notificationsOpen);
  const notifications = useAppSelector((state) => state.notifications.items);
  const unreadCount = useAppSelector((state) => state.notifications.unreadCount);

  // Local state for SetPassword modal
  const [setPasswordModalOpen, setSetPasswordModalOpen] = useState(false);

  // Check if user needs to set local password (backendAuthType === 1 means Azure only)
  const needsLocalPassword = currentUser?.backendAuthType === 1;

  // Track if we've already marked as loaded
  const hasMarkedLoaded = useRef(false);

  // Notify that Layout is fully mounted and ready
  useEffect(() => {
    console.log('🟢 [Layout] Mount check:', {
      hasCurrentUser: !!currentUser,
      currentUserEmail: currentUser?.email,
      isLoading,
      hasMarkedLoaded: hasMarkedLoaded.current
    });

    // Only run once when Layout first mounts with a user
    if (currentUser && isLoading && !hasMarkedLoaded.current) {
      console.log('🟢 [Layout] User detected, hiding loading screen...');
      hasMarkedLoaded.current = true;
      dispatch(setLoading(false));
      console.log('✅ [Layout] Loading screen hidden');
    }
  }, [currentUser, isLoading, dispatch]);

  // Fallback: If loading screen is still showing after 8 seconds, force hide it
  useEffect(() => {
    if (!isLoading) {
      console.log('🟢 [Layout] Loading is already false, no timeout needed');
      return;
    }

    console.log('🟢 [Layout] Setting 8 second timeout fallback...');
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ [Layout] Loading screen timeout - forcing hide after 8 seconds');
      dispatch(setLoading(false));
    }, 8000);

    return () => {
      console.log('🟢 [Layout] Clearing timeout');
      clearTimeout(timeoutId);
    };
  }, [isLoading, dispatch]);

  // Reset the flag when user logs out
  useEffect(() => {
    if (!currentUser) {
      hasMarkedLoaded.current = false;
    }
  }, [currentUser]);

  // Apply dark mode to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Fetch notifications when user is logged in
  useEffect(() => {
    if (!currentUser) return;

    // Initial fetch
    dispatch(fetchNotifications({ pageNumber: 1, pageSize: 50, unreadOnly: false }));
    dispatch(fetchUnreadCount());

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount());
    }, 30000); // 30 seconds

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [currentUser, dispatch]);

  const handleNotificationsOpen = async (open: boolean) => {
    dispatch(setNotificationsOpen(open));
    if (open) {
      // Fetch latest notifications when opening
      await dispatch(fetchNotifications({ pageNumber: 1, pageSize: 50, unreadOnly: false }));
    }
  };

  const handleMarkAllAsRead = async () => {
    await dispatch(markAllNotificationsAsRead());
    // Refresh unread count after marking all as read
    dispatch(fetchUnreadCount());
  };

  const handlePasswordSetSuccess = (newAuthType: number) => {
    // Update user's authType in Redux
    if (currentUser) {
      dispatch(setUser({
        ...currentUser,
        backendAuthType: newAuthType, // Should be 2 (Both) after setting password
      }));
    }
  };

  const handleLogout = async () => {
    try {
      console.log("🔴 [Logout] Starting logout for authType:", authType);

      // FIRST: Set the flag BEFORE clearing anything
      try {
        localStorage.setItem('mro_just_logged_out', 'true');
        console.log("🔴 [Logout] Flag set: mro_just_logged_out = true");
      } catch (e) {
        console.error("Failed to set logout flag:", e);
      }

      // SECOND: Clear Redux state
      dispatch(logout());
      dispatch(clearPackingRequests());
      dispatch(clearReturns());
      console.log("🔴 [Logout] Redux state cleared");

      // THIRD: Clear localStorage (both token and user data)
      authService.removeToken();
      authService.removeUser();
      console.log("🔴 [Logout] localStorage cleared");

      // FOURTH: Handle redirect based on auth type
      if (authType === 'azure') {
        console.log("🔴 [Logout] Redirecting to Azure logout...");
        // Use MSAL's logoutRedirect to properly clear the cache
        await instance.logoutRedirect({
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
        return;
      }

      // For local auth, just navigate to login
      console.log("🔴 [Logout] Navigating to /login");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("❌ [Logout] Error during logout:", error);
      // Ensure cleanup even on error
      try { localStorage.setItem('mro_just_logged_out', 'true'); } catch {}
      authService.removeToken();
      authService.removeUser();
      dispatch(logout());
      navigate("/login", { replace: true });
    }
  };


  const getNotificationIcon = (type: 'info' | 'warning' | 'success' | 'error') => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'error':
        return '🔴';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', disabled: false, roles: ['Engineer', 'Keeper', 'Manager', 'Director'] },
    { id: 'articles', label: 'Inventory Management', icon: Package, path: '/inventory', disabled: false, roles: ['Keeper'] },
    // { id: 'orders', label: 'Purchase Request', icon: ShoppingCart, path: '/orders', disabled: false, roles: ['Keeper','Director'] },
    { id: 'cyclecount', label: 'Cycle Count', icon: Calculator, path: '/cycle-count', disabled: false, roles: ['Keeper'] },
    { id: 'quickfind', label: 'Quick Find', icon: Search, path: '/quick-find', disabled: true, roles: ['Keeper'] },
    { id: 'managerequests', label: 'Manage Requests', icon: Package, path: '/manage-requests', disabled: false, roles: ['Keeper'] },
    { id: 'requests', label: 'Request Approval', icon: ClipboardCheck, path: '/requests', disabled: false, roles: ['Manager','Director'] },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', disabled: false, roles: ['Director', 'Manager'] },
    { id: 'users', label: 'User Management', icon: Users, path: '/users', disabled: false, roles: ['Director', 'Manager'] },
    // Engineer Modules
    { id: 'engineer-catalog', label: 'Digital Catalog', icon: Package, path: '/engineer/catalog', disabled: false, roles: ['Engineer'] },
    { id: 'engineer-requests', label: 'Request Orders', icon: FileText, path: '/engineer/requests', disabled: false, roles: ['Engineer'] },
    { id: 'engineer-inventory', label: 'My Inventory', icon: PackageCheck, path: '/engineer/my-inventory', disabled: false, roles: ['Engineer'] },
  ] as const;

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Check if user has access to a module
  const hasAccess = (roles: readonly string[]): boolean => {
    if (!currentUser) {
      console.log('❌ No currentUser');
      return false;
    }
    // console.log('🔍 Checking access - User roleName:', currentUser.roleName, 'Required roles:', roles);
    return roles.includes(currentUser.roleName);
  };

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    const access = hasAccess(item.roles);
    // console.log(`Module: ${item.label} - Access: ${access}`);
    return access;
  });

  // console.log(filteredNavigation);
  

  return (
    <div className="fixed inset-0 flex bg-background overflow-hidden">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-black/50" 
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r dark:border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b dark:border-border">
          <h1 className="text-lg font-semibold">Inventory System</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleDarkMode())}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => dispatch(setSidebarOpen(false))}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={isActivePath(item.path) ? 'secondary' : 'ghost'}
                className="w-full justify-start"
                 disabled={item.disabled}
                onClick={() => {
                  navigate(item.path);
                  dispatch(setSidebarOpen(false));
                }}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Notifications section */}
        <div className="px-4 py-2 border-t dark:border-border">
          <Button
            variant={notificationsOpen ? "secondary" : "ghost"}
            className="w-full justify-start relative"
            onClick={() => handleNotificationsOpen(!notificationsOpen)}
          >
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                {unreadCount}
              </Badge>
            )}
          </Button>
        </div>

        {currentUser && (
          <div className="p-4 border-t dark:border-border relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-muted/50">
                  <div className="flex items-center space-x-3 w-full p-2 rounded">
                    <div className="relative">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-base">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {needsLocalPassword && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center border-2 border-background">
                          <AlertCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentUser.jobTitle || currentUser.roleName}
                      </p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-72 mb-2">
                {/* User Info Section */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex items-start space-x-3 py-2">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-semibold truncate">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{currentUser.email}</p>
                      {currentUser.jobTitle && (
                        <p className="text-xs text-muted-foreground truncate">{currentUser.jobTitle}</p>
                      )}
                      {(currentUser.departmentName || currentUser.department) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser.departmentName || currentUser.department}
                        </p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                {needsLocalPassword && (
                  <>
                    <DropdownMenuItem onClick={() => setSetPasswordModalOpen(true)} className="text-amber-600 dark:text-amber-400 focus:text-amber-700 dark:focus:text-amber-300">
                      <Lock className="mr-2 h-4 w-4" />
                      <span>Set Local Password</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications Popover - Outside dropdown */}
            {notificationsOpen && (
              <div className="fixed inset-0 z-50" onClick={() => handleNotificationsOpen(false)}>
                <div
                  className="absolute left-64 top-4 w-80 bg-card border dark:border-border rounded-lg shadow-lg lg:left-64 max-lg:left-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b dark:border-border">
                    <h3 className="font-semibold">Notifications</h3>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleMarkAllAsRead}
                          className="text-xs h-7"
                        >
                          Mark all as read
                        </Button>
                      )}
                      <Badge variant="secondary">{notifications.length}</Badge>
                    </div>
                  </div>
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="divide-y">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 cursor-pointer transition-colors border-l-4 ${
                              !notification.read
                                ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-500 hover:bg-blue-100 dark:hover:bg-blue-950/50'
                                : 'bg-gray-100 dark:bg-gray-800 border-transparent hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center gap-2">
                                  {!notification.read && (
                                    <span className="h-2 w-2 bg-primary rounded-full flex-shrink-0"></span>
                                  )}
                                  <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'}`}>
                                    {notification.title}
                                  </p>
                                </div>
                                <p className="text-xs text-muted-foreground">{notification.message}</p>
                                <p className="text-xs text-muted-foreground">{notification.timestamp}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile menu button - floating */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden fixed top-4 right-4 z-30 bg-card border dark:border-border shadow-md"
          onClick={() => dispatch(setSidebarOpen(true))}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>

      {/* Set Password Modal */}
      <SetPasswordModal
        open={setPasswordModalOpen}
        onClose={() => setSetPasswordModalOpen(false)}
        onSuccess={handlePasswordSetSuccess}
      />
    </div>
  );
}