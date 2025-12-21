import { useEffect } from 'react';
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
  markAllAsRead
} from '../store';
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
  ScrollText
} from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { instance } = useMsal();

  // Get state from Redux
  const currentUser = useAppSelector((state) => state.auth.user);
  const authType = useAppSelector((state) => state.auth.authType);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  const notificationsOpen = useAppSelector((state) => state.ui.notificationsOpen);
  const notifications = useAppSelector((state) => state.notifications.items);

  // Apply dark mode to document root
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationsOpen = (open: boolean) => {
    dispatch(setNotificationsOpen(open));
    if (open) {
      // Mark all notifications as read when opening
      dispatch(markAllAsRead());
    }
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out user with authType:", authType);

      dispatch(logout());
      dispatch(clearPackingRequests());
      dispatch(clearReturns());
      authService.removeToken();

      // Only redirect to Azure logout if user authenticated with Azure
      if (authType === 'azure') {
        try { localStorage.setItem('mro_just_logged_out', 'true'); } catch {}

        // Use MSAL's logoutRedirect to properly clear the cache
        await instance.logoutRedirect({
          postLogoutRedirectUri: `${window.location.origin}/login`,
        });
        return;
      }

      // For local auth, just navigate to login
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Error during logout:", error);
      authService.removeToken();
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
    { id: 'orders', label: 'Purchase Request', icon: ShoppingCart, path: '/orders', disabled: true, roles: ['Keeper'] },
    { id: 'cyclecount', label: 'Cycle Count', icon: Calculator, path: '/cycle-count', disabled: false, roles: ['Keeper'] },
    { id: 'quickfind', label: 'Quick Find', icon: Search, path: '/quick-find', disabled: true, roles: ['Keeper'] },
    { id: 'managerequests', label: 'Manage Requests', icon: Package, path: '/manage-requests', disabled: false, roles: ['Keeper'] },
    { id: 'requests', label: 'Request Approval', icon: ClipboardCheck, path: '/requests', disabled: false, roles: ['Director', 'Manager'] },
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', disabled: false, roles: ['Director', 'Manager'] },
    { id: 'users', label: 'User Management', icon: Users, path: '/users', disabled: false, roles: ['Director', 'Manager'] },
    // Engineer Modules
    { id: 'engineer-catalog', label: 'Engineer Catalog', icon: Package, path: '/engineer/catalog', disabled: false, roles: ['Engineer'] },
    { id: 'engineer-requests', label: 'Request Orders', icon: FileText, path: '/engineer/requests', disabled: false, roles: ['Engineer'] },
    { id: 'engineer-inventory', label: 'My Engineer Inventory', icon: PackageCheck, path: '/engineer/my-inventory', disabled: false, roles: ['Engineer'] },
    { id: 'engineer-history', label: 'Engineer Complete History', icon: ScrollText, path: '/engineer/history', disabled: false, roles: ['Engineer'] },
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

  return (
    <div className="flex h-screen bg-background">
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
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          >
            <X className="h-4 w-4" />
          </Button>
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

        {currentUser && (
          <div className="p-4 border-t dark:border-border mt-auto relative">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-muted/50">
                  <div className="flex items-center space-x-2 w-full p-2 rounded">
                    <div className="relative">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={currentUser.photoUrl} alt={currentUser.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                          {currentUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {unreadCount > 0 && (
                        <Badge
                          variant="destructive"
                          className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]"
                        >
                          {unreadCount}
                        </Badge>
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

                <DropdownMenuItem
                  onClick={(e: { preventDefault: () => void; }) => {
                    e.preventDefault();
                    handleNotificationsOpen(!notificationsOpen);
                  }}
                >
                  <Bell className="mr-2 h-4 w-4" />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem onClick={() => dispatch(toggleDarkMode())}>
                  {darkMode ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

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
                  className="absolute bottom-20 left-4 w-80 bg-card border dark:border-border rounded-lg shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between p-4 border-b dark:border-border">
                    <h3 className="font-semibold">Notifications</h3>
                    <Badge variant="secondary">{notifications.length}</Badge>
                  </div>
                  <ScrollArea className="h-[400px]">
                    <div className="divide-y">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                              !notification.read ? 'bg-muted/30' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">{notification.title}</p>
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
      <div className="flex-1 flex flex-col min-h-0">
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
    </div>
  );
}