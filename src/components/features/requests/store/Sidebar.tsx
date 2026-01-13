import React, { useState, useEffect } from 'react';
import { cn } from '../../../ui/utils';
import { 
  LayoutDashboard, 
  Package, 
  FileText, 
  ShoppingCart, 
  ArrowLeftRight, 
  ScrollText,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  X,
  Menu,
  PackageCheck
} from 'lucide-react';
import { Badge } from '../../../ui/badge';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Button } from '../../../ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../../../ui/sheet';
import { ImageWithFallback } from '../../../figma/ImageWithFallback';
import type { Page } from '../../enginner/types';
import type { CartItem, Notification } from '../../enginner/types';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  cartItems: CartItem[];
  updateCartItem: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  onCartProceedToForm: () => void;
  notifications: Notification[];
  markNotificationAsRead: (id: string) => void;
  onNotificationClick: () => void;
  onLogout: () => void;
  isMobile?: boolean;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const menuItems = [
  { id: 'dashboard' as Page, icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'catalog' as Page, icon: Package, label: 'Inventory Catalog' },
  { id: 'borrow' as Page, icon: FileText, label: 'Request Orders' },
  { id: 'my-inventory' as Page, icon: PackageCheck, label: 'My Inventory' },
  { id: 'complete-history' as Page, icon: ScrollText, label: 'Complete History' },
];

export function Sidebar({ 
  currentPage, 
  setCurrentPage,
  cartItems,
  updateCartItem,
  clearCart,
  onCartProceedToForm,
  notifications,
  markNotificationAsRead,
  onNotificationClick,
  onLogout,
  isMobile = false,
  isOpen = false,
  onOpenChange
}: SidebarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
  }, []);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
    if (isMobile && onOpenChange) {
      onOpenChange(false); // Close mobile menu after navigation
    }
  };

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    onLogout();
  };

  const handleCartProceed = () => {
    setCartOpen(false);
    onCartProceedToForm();
  };

  const handleNotificationClick = (notificationId?: string) => {
    if (notificationId) {
      markNotificationAsRead(notificationId);
    } else {
      // Mark all as read when navigating to dashboard
      notifications.forEach(notification => {
        if (!notification.read) {
          markNotificationAsRead(notification.id);
        }
      });
      setNotificationsOpen(false);
      onNotificationClick();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const sidebarContent = (
    <>
      {/* Logo/Header */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Package className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1>AMAXST</h1>
        </div>
      </div>
      
      {/* Main Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handlePageChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-border">
        {/* Bottom Menu Items (collapsible) */}
        {userMenuOpen && (
          <div className="px-4 py-3 space-y-1 bg-muted/30">
            {/* Notifications */}
            <button
              onClick={() => setNotificationsOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-left text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Notifications</span>
              </div>
              {unreadCount > 0 && (
                <Badge className="bg-destructive text-destructive-foreground h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </button>

            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors text-left text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Cart</span>
              </div>
              {cartItemsCount > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {cartItemsCount}
                </Badge>
              )}
            </button>

            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span className="text-sm">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">Log Out</span>
            </button>
          </div>
        )}

        {/* User Profile Button */}
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="w-full p-4 flex items-center gap-3 hover:bg-accent/30 transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary text-primary-foreground">
              JS
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left">
            <p className="text-sm">John Smith</p>
            <p className="text-xs text-muted-foreground">Engineer</p>
          </div>
          {userMenuOpen ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </>
  );

  // If mobile, render as Sheet
  if (isMobile) {
    return (
      <>
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex flex-col h-full">
              {sidebarContent}
            </div>
          </SheetContent>
        </Sheet>

        {/* Cart and Notifications sheets are always available */}
        {renderSheets()}
      </>
    );
  }

  // Desktop - render normal sidebar
  return (
    <div className="w-64 bg-background border-r border-border flex flex-col h-screen">
      {sidebarContent}
      {renderSheets()}
    </div>
  );

  function renderSheets() {
    return (
      <>
        {/* Cart Sheet */}
      <Sheet open={cartOpen} onOpenChange={setCartOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Cart</SheetTitle>
            <SheetDescription>
              Review and manage items in your cart
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {cartItems.map((cartItem) => (
                    <div key={cartItem.item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <ImageWithFallback
                        src={cartItem.item.image}
                        alt={cartItem.item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="truncate">{cartItem.item.name}</h4>
                        <p className="text-sm text-muted-foreground">{cartItem.item.code}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateCartItem(cartItem.item.id, cartItem.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{cartItem.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => updateCartItem(cartItem.item.id, cartItem.quantity + 1)}
                            disabled={cartItem.quantity >= cartItem.item.availableQuantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 ml-auto"
                            onClick={() => updateCartItem(cartItem.item.id, 0)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t space-y-2">
                  <Button
                    className="w-full"
                    onClick={handleCartProceed}
                  >
                    Proceed to Form A
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={clearCart}
                  >
                    Clear Cart
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet open={notificationsOpen} onOpenChange={setNotificationsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Notifications</SheetTitle>
            <SheetDescription>
              View all your recent notifications
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                {unreadCount} unread
              </p>
            )}
            <div className="space-y-2 max-h-[70vh] overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer hover:bg-muted",
                      !notification.read && "bg-accent"
                    )}
                    onClick={() => handleNotificationClick()}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className={cn("text-sm", getNotificationColor(notification.type))}>
                          {notification.message}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                      {!notification.read && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification.id);
                          }}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleNotificationClick()}
              >
                View All in Dashboard
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
      </>
    );
  }
}