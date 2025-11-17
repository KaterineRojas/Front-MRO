import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { Toaster } from './ui/sonner';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { updateCartItem, clearCart } from './store/slices/cartSlice';
import { markAsRead } from './store/slices/notificationsSlice';
import { logout } from './store/slices/userSlice';
import {
  selectCartItems
} from './store/selectors';
import { logoutUser } from './services/authService';
import { USE_AUTH_TOKENS } from './constants';
import type { Page } from './types';// Map URL paths to page types
const pathToPage: Record<string, Page> = {
  '/dashboard': 'dashboard',
  '/catalog': 'catalog',
  '/request-orders': 'borrow',
  '/request-orders/borrow': 'borrow',
  '/request-orders/purchase': 'borrow',
  '/request-orders/transfer': 'borrow',
  '/my-inventory': 'my-inventory',
  '/complete-history': 'complete-history'
};

// Map page types to URL paths
const pageToPath: Record<Page, string> = {
  'dashboard': '/dashboard',
  'catalog': '/catalog',
  'borrow': '/request-orders/borrow',
  'purchase': '/request-orders/purchase',
  'transfer': '/request-orders/transfer',
  'my-inventory': '/my-inventory',
  'complete-history': '/complete-history'
};

export function AppLayout() {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  
  const cartItems = useAppSelector(selectCartItems);
  const notifications = useAppSelector((state: any) => state.notifications?.items || []);

  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const currentPage = pathToPage[location.pathname] || 'dashboard';

  const handleMarkNotificationAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId));
  };

  const handleSetCurrentPage = (page: Page) => {
    navigate(pageToPath[page]);
  };

  const handleUpdateCartItem = (itemId: string, quantity: number) => {
    dispatch(updateCartItem({ itemId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleLogout = () => {
    if (USE_AUTH_TOKENS) {
      logoutUser();
      dispatch(logout());
      navigate('/login');
    } else {
      alert('Logout functionality is disabled (USE_AUTH_TOKENS = false)');
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Menu Button */}
      {isMobile && (
        <div className="fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="bg-background"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      )}

      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={handleSetCurrentPage}
        cartItems={cartItems}
        updateCartItem={handleUpdateCartItem}
        clearCart={handleClearCart}
        onCartProceedToForm={() => handleSetCurrentPage('borrow')}
        notifications={notifications}
        markNotificationAsRead={handleMarkNotificationAsRead}
        onNotificationClick={() => handleSetCurrentPage('dashboard')}
        onLogout={handleLogout}
        isMobile={isMobile}
        isOpen={sidebarOpen}
        onOpenChange={setSidebarOpen}
      />
      <main className={`flex-1 overflow-auto p-6 ${isMobile ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}