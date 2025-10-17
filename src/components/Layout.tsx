import React, { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { 
  useAppDispatch, 
  useAppSelector, 
  logout, 
  setSidebarOpen, 
  toggleDarkMode, 
  setNotificationsOpen,
  markAllAsRead 
} from '../store';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
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
  Search,
  Bell,
  Sun,
  Moon,
  Settings,
  Calculator,
  LogOut
} from 'lucide-react';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  
  // Get state from Redux
  const currentUser = useAppSelector((state) => state.auth.user);
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

  const handleLogout = () => {
    dispatch(logout());
    alert('Logging out...');
    navigate('/');
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
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/', disabled: false },
    { id: 'articles', label: 'Inventory Management', icon: Package, path: '/inventory', disabled: false },
    { id: 'loans', label: 'Request Orders', icon: UserCheck, path: '/loans', disabled: true },
    { id: 'orders', label: 'Purchase Request', icon: ShoppingCart, path: '/orders', disabled: true },
    { id: 'cyclecount', label: 'Cycle Count', icon: Calculator, path: '/cycle-count', disabled: true },
    { id: 'quickfind', label: 'Quick Find', icon: Search, path: '/quick-find', disabled: true },
    ...(['administrator', 'manager'].includes(currentUser.role) ? [{ id: 'requests', label: 'Request Approval', icon: ClipboardCheck, path: '/requests', disabled: true }] : []),
    { id: 'reports', label: 'Reports', icon: FileText, path: '/reports', disabled: true },
    ...(currentUser.role === 'administrator' ? [{ id: 'users', label: 'User Management', icon: Users, path: '/users', disabled: true }] : []),
  ] as const;

  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

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
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-4 border-b">
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
        
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
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
          <div className="p-4 border-t">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto hover:bg-muted/50">
                  <div className="flex items-center space-x-2 w-full p-2 rounded">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm truncate">{currentUser.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">{currentUser.role}</p>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-16 px-4 bg-card border-b">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => dispatch(setSidebarOpen(true))}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold lg:hidden">Inventory System</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <Popover open={notificationsOpen} onOpenChange={handleNotificationsOpen}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
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
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dispatch(toggleDarkMode())}
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
