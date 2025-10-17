/**
 * Redux Usage Examples
 * 
 * This file demonstrates how to use Redux in your components.
 * Copy these patterns to use Redux throughout your application.
 */

import React from 'react';
import { 
  useAppDispatch, 
  useAppSelector,
  addNotification,
  setSidebarOpen,
  toggleDarkMode,
  selectCurrentUser,
  selectUnreadCount,
  selectCanAccessAdminFeatures
} from '../store';
import { Button } from './ui/button';

/**
 * Example 1: Basic State Access
 * Shows how to read state from Redux store
 */
export function UserGreeting() {
  const user = useAppSelector(selectCurrentUser);
  
  if (!user) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h2>Welcome, {user.name}!</h2>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

/**
 * Example 2: Dispatching Actions
 * Shows how to update state using dispatch
 */
export function ThemeControls() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  
  return (
    <div>
      <p>Current theme: {darkMode ? 'Dark' : 'Light'}</p>
      <Button onClick={() => dispatch(toggleDarkMode())}>
        Toggle Theme
      </Button>
    </div>
  );
}

/**
 * Example 3: Using Selectors
 * Shows how to use reusable selectors
 */
export function NotificationCounter() {
  const unreadCount = useAppSelector(selectUnreadCount);
  
  return (
    <div>
      {unreadCount > 0 ? (
        <span>You have {unreadCount} unread notifications</span>
      ) : (
        <span>No new notifications</span>
      )}
    </div>
  );
}

/**
 * Example 4: Creating Notifications
 * Shows how to add new notifications
 */
export function InventoryForm() {
  const dispatch = useAppDispatch();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Your form logic here...
    
    // Add success notification
    dispatch(addNotification({
      title: 'Item Added',
      message: 'New inventory item has been added successfully',
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'success'
    }));
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Your form fields */}
      <Button type="submit">Add Item</Button>
    </form>
  );
}

/**
 * Example 5: Role-Based Access Control
 * Shows how to check user permissions
 */
export function AdminPanel() {
  const canAccessAdmin = useAppSelector(selectCanAccessAdminFeatures);
  
  if (!canAccessAdmin) {
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You need administrator privileges to view this page.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h2>Admin Panel</h2>
      {/* Admin content here */}
    </div>
  );
}

/**
 * Example 6: Multiple State Slices
 * Shows how to access multiple parts of state
 */
export function DashboardHeader() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const unreadCount = useAppSelector(selectUnreadCount);
  
  return (
    <header>
      <Button onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}>
        Menu
      </Button>
      
      <div>
        <span>{user?.name}</span>
        {unreadCount > 0 && (
          <span className="badge">{unreadCount}</span>
        )}
      </div>
    </header>
  );
}

/**
 * Example 7: Conditional Actions
 * Shows how to dispatch actions conditionally
 */
export function ItemActions() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  
  const handleDelete = () => {
    if (!user) {
      dispatch(addNotification({
        title: 'Error',
        message: 'You must be logged in to delete items',
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'error'
      }));
      return;
    }
    
    if (user.role !== 'administrator') {
      dispatch(addNotification({
        title: 'Permission Denied',
        message: 'Only administrators can delete items',
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'warning'
      }));
      return;
    }
    
    // Proceed with delete...
    dispatch(addNotification({
      title: 'Deleted',
      message: 'Item has been deleted',
      timestamp: new Date().toLocaleString(),
      read: false,
      type: 'success'
    }));
  };
  
  return (
    <Button onClick={handleDelete}>Delete Item</Button>
  );
}

/**
 * Example 8: Async Operations with Notifications
 * Shows how to handle async operations
 */
export function SaveButton() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = React.useState(false);
  
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Success notification
      dispatch(addNotification({
        title: 'Saved',
        message: 'Changes have been saved successfully',
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'success'
      }));
    } catch (error) {
      // Error notification
      dispatch(addNotification({
        title: 'Error',
        message: 'Failed to save changes',
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Button onClick={handleSave} disabled={loading}>
      {loading ? 'Saving...' : 'Save'}
    </Button>
  );
}

/**
 * Example 9: Derived State
 * Shows how to compute values from state
 */
export function UserStats() {
  const user = useAppSelector(selectCurrentUser);
  const notifications = useAppSelector((state) => state.notifications.items);
  
  // Compute derived values
  const userNotifications = notifications.filter(n => 
    n.message.includes(user?.name || '')
  );
  const recentNotifications = notifications.slice(0, 5);
  
  return (
    <div>
      <p>Your notifications: {userNotifications.length}</p>
      <p>Recent: {recentNotifications.length}</p>
    </div>
  );
}

/**
 * Example 10: Custom Hook
 * Shows how to create a reusable hook with Redux
 */
export function useNotify() {
  const dispatch = useAppDispatch();
  
  return {
    success: (title: string, message: string) => {
      dispatch(addNotification({
        title,
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'success'
      }));
    },
    error: (title: string, message: string) => {
      dispatch(addNotification({
        title,
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'error'
      }));
    },
    warning: (title: string, message: string) => {
      dispatch(addNotification({
        title,
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'warning'
      }));
    },
    info: (title: string, message: string) => {
      dispatch(addNotification({
        title,
        message,
        timestamp: new Date().toLocaleString(),
        read: false,
        type: 'info'
      }));
    },
  };
}

// Usage of custom hook:
export function FormWithNotifications() {
  const notify = useNotify();
  
  const handleSubmit = () => {
    // Use the custom hook
    notify.success('Saved', 'Form submitted successfully');
  };
  
  const handleError = () => {
    notify.error('Error', 'Something went wrong');
  };
  
  return (
    <div>
      <Button onClick={handleSubmit}>Submit</Button>
      <Button onClick={handleError}>Test Error</Button>
    </div>
  );
}
