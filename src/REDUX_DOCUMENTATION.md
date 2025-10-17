# React Redux Implementation

## Overview
This application uses React Redux with Redux Toolkit for state management, providing a centralized store for application-wide state.

## Structure

### Store Configuration: `/store/store.ts`
- Configures the Redux store with all reducers
- Exports TypeScript types for state and dispatch
- Uses Redux Toolkit's `configureStore` for simplified setup

### Custom Hooks: `/store/hooks.ts`
Type-safe hooks for using Redux in components:
- `useAppDispatch()` - Typed dispatch hook
- `useAppSelector()` - Typed selector hook

### Selectors: `/store/selectors.ts`
Reusable selector functions for accessing state:
- Auth selectors (user, role, authentication status)
- UI selectors (sidebar, dark mode, notifications)
- Notification selectors (items, unread count)
- Permission helpers (role-based access)

## Slices

### Auth Slice: `/store/slices/authSlice.ts`
Manages user authentication and profile:

**State:**
```typescript
{
  user: {
    id: number;
    name: string;
    role: 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';
    email: string;
  } | null;
  isAuthenticated: boolean;
}
```

**Actions:**
- `setUser(user)` - Set current user
- `logout()` - Clear user and authentication
- `updateUserRole(role)` - Update user role

### UI Slice: `/store/slices/uiSlice.ts`
Manages UI state like sidebar, dark mode, and notifications panel:

**State:**
```typescript
{
  sidebarOpen: boolean;
  darkMode: boolean;
  notificationsOpen: boolean;
}
```

**Actions:**
- `toggleSidebar()` - Toggle sidebar open/close
- `setSidebarOpen(boolean)` - Set sidebar state
- `toggleDarkMode()` - Toggle dark mode
- `setDarkMode(boolean)` - Set dark mode state
- `toggleNotifications()` - Toggle notifications panel
- `setNotificationsOpen(boolean)` - Set notifications panel state

### Notifications Slice: `/store/slices/notificationsSlice.ts`
Manages application notifications:

**State:**
```typescript
{
  items: Array<{
    id: number;
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
  }>
}
```

**Actions:**
- `addNotification(notification)` - Add new notification
- `markAsRead(id)` - Mark notification as read
- `markAllAsRead()` - Mark all notifications as read
- `removeNotification(id)` - Remove notification
- `clearAllNotifications()` - Clear all notifications

## Usage Examples

### 1. Using Redux in Components

```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { logout } from '../store/slices/authSlice';
import { toggleDarkMode } from '../store/slices/uiSlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => dispatch(toggleDarkMode())}>
        Toggle Dark Mode
      </button>
      <button onClick={() => dispatch(logout())}>
        Logout
      </button>
    </div>
  );
}
```

### 2. Using Selectors

```tsx
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectUnreadCount } from '../store/selectors';

function Header() {
  const user = useAppSelector(selectCurrentUser);
  const unreadCount = useAppSelector(selectUnreadCount);

  return (
    <div>
      <span>{user?.name}</span>
      <span>Notifications: {unreadCount}</span>
    </div>
  );
}
```

### 3. Dispatching Actions

```tsx
import { useAppDispatch } from '../store/hooks';
import { addNotification } from '../store/slices/notificationsSlice';

function InventoryForm() {
  const dispatch = useAppDispatch();

  const handleSubmit = () => {
    // ... form logic
    dispatch(addNotification({
      title: 'Item Added',
      message: 'New inventory item has been added successfully',
      timestamp: new Date().toISOString(),
      read: false,
      type: 'success'
    }));
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. Role-Based Access Control

```tsx
import { useAppSelector } from '../store/hooks';
import { selectCanAccessAdminFeatures } from '../store/selectors';

function AdminPanel() {
  const canAccess = useAppSelector(selectCanAccessAdminFeatures);

  if (!canAccess) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Content</div>;
}
```

## Integration with React Router

Redux is integrated with React Router in `/App.tsx`:

```tsx
export default function App() {
  return (
    <Provider store={store}>      {/* Redux Provider */}
      <BrowserRouter>             {/* Router */}
        <AppRoutes />
      </BrowserRouter>
    </Provider>
  );
}
```

The order is important:
1. `Provider` wraps everything (outermost)
2. `BrowserRouter` wraps routes
3. Routes can access Redux state

## State Flow

### 1. Component → Dispatch → Reducer → Store
```
Component calls dispatch(action)
  ↓
Action sent to reducer
  ↓
Reducer updates state
  ↓
Store notifies subscribers
  ↓
Component re-renders with new state
```

### 2. Example: Toggle Dark Mode
```
User clicks button
  ↓
dispatch(toggleDarkMode())
  ↓
uiSlice reducer toggles darkMode
  ↓
Layout component re-renders
  ↓
useEffect applies dark class to document
```

## Best Practices

### 1. Always Use Typed Hooks
```tsx
// ✅ Good - typed
import { useAppDispatch, useAppSelector } from '../store/hooks';

// ❌ Bad - untyped
import { useDispatch, useSelector } from 'react-redux';
```

### 2. Use Selectors for Complex Logic
```tsx
// ✅ Good - reusable selector
const unreadCount = useAppSelector(selectUnreadCount);

// ❌ Bad - logic in component
const unreadCount = useAppSelector(
  (state) => state.notifications.items.filter(n => !n.read).length
);
```

### 3. Keep Actions Simple
```tsx
// ✅ Good - simple action
dispatch(markAsRead(notificationId));

// ❌ Bad - complex logic in component
const notification = notifications.find(n => n.id === id);
if (notification && !notification.read) {
  dispatch(updateNotification({ ...notification, read: true }));
}
```

### 4. One Source of Truth
```tsx
// ✅ Good - state in Redux
const darkMode = useAppSelector((state) => state.ui.darkMode);

// ❌ Bad - duplicate state
const [darkMode, setDarkMode] = useState(false);
```

## Migration from useState to Redux

### Before (Local State)
```tsx
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <button onClick={() => setSidebarOpen(true)}>
      Open Sidebar
    </button>
  );
}
```

### After (Redux)
```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSidebarOpen } from '../store/slices/uiSlice';

function Layout() {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);
  const darkMode = useAppSelector((state) => state.ui.darkMode);

  return (
    <button onClick={() => dispatch(setSidebarOpen(true))}>
      Open Sidebar
    </button>
  );
}
```

## Benefits

1. **Centralized State**: All application state in one place
2. **Predictable Updates**: State changes through actions only
3. **DevTools**: Redux DevTools for debugging
4. **Type Safety**: Full TypeScript support
5. **Testability**: Easy to test reducers and actions
6. **Performance**: Optimized re-rendering with selectors
7. **Scalability**: Easy to add new state slices

## Adding New State

### 1. Create a New Slice
```tsx
// store/slices/inventorySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface InventoryState {
  items: Item[];
  loading: boolean;
}

const initialState: InventoryState = {
  items: [],
  loading: false,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setItems, setLoading } = inventorySlice.actions;
export default inventorySlice.reducer;
```

### 2. Add to Store
```tsx
// store/store.ts
import inventoryReducer from './slices/inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    inventory: inventoryReducer, // Add here
  },
});
```

### 3. Use in Components
```tsx
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setItems } from '../store/slices/inventorySlice';

function InventoryList() {
  const items = useAppSelector((state) => state.inventory.items);
  const dispatch = useAppDispatch();

  // Use items and dispatch actions
}
```

## Debugging

### Redux DevTools
1. Install Redux DevTools extension
2. Open browser DevTools
3. Go to Redux tab
4. Inspect state, actions, and time-travel debug

### Console Logging
```tsx
// In a slice reducer
reducers: {
  setUser: (state, action) => {
    console.log('Setting user:', action.payload);
    state.user = action.payload;
  }
}
```

## Common Patterns

### Loading States
```tsx
interface State {
  data: any[];
  loading: boolean;
  error: string | null;
}

const slice = createSlice({
  name: 'example',
  initialState: { data: [], loading: false, error: null },
  reducers: {
    fetchStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchSuccess: (state, action) => {
      state.loading = false;
      state.data = action.payload;
    },
    fetchError: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
  },
});
```

### Optimistic Updates
```tsx
const addItem = (item) => {
  // Add immediately
  dispatch(addItemToState(item));
  
  // Save to server
  saveItem(item)
    .catch(() => {
      // Rollback on error
      dispatch(removeItemFromState(item.id));
    });
};
```

## Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [React Redux Hooks](https://react-redux.js.org/api/hooks)

---

**Status:** ✅ Redux fully integrated
**Version:** Redux Toolkit (Latest)
**Last Updated:** Current session
