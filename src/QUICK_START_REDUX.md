# React Redux - Quick Start Guide

## ✅ Setup Complete

Your application now has React Redux with Redux Toolkit fully integrated!

## 📁 Redux File Structure

```
/store
├── store.ts                        # Main store configuration
├── hooks.ts                        # Typed Redux hooks
├── selectors.ts                    # Reusable selectors
└── slices/
    ├── authSlice.ts               # User authentication state
    ├── uiSlice.ts                 # UI state (sidebar, dark mode)
    └── notificationsSlice.ts      # Notifications state
```

## 🎯 Quick Reference

### Import Hooks
```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
```

### Read State
```tsx
const user = useAppSelector((state) => state.auth.user);
const darkMode = useAppSelector((state) => state.ui.darkMode);
const notifications = useAppSelector((state) => state.notifications.items);
```

### Dispatch Actions
```tsx
const dispatch = useAppDispatch();

// UI Actions
dispatch(toggleDarkMode());
dispatch(setSidebarOpen(true));
dispatch(setNotificationsOpen(false));

// Auth Actions
dispatch(logout());
dispatch(setUser(userData));

// Notification Actions
dispatch(markAllAsRead());
dispatch(addNotification({ title, message, type, timestamp, read: false }));
```

## 📋 Available State

### Auth State
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

### UI State
```typescript
{
  sidebarOpen: boolean;
  darkMode: boolean;
  notificationsOpen: boolean;
}
```

### Notifications State
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

## 🔧 Common Tasks

### 1. Get Current User
```tsx
const user = useAppSelector((state) => state.auth.user);
```

### 2. Toggle Dark Mode
```tsx
const dispatch = useAppDispatch();
dispatch(toggleDarkMode());
```

### 3. Add Notification
```tsx
dispatch(addNotification({
  title: 'Success',
  message: 'Item saved successfully',
  timestamp: new Date().toLocaleString(),
  read: false,
  type: 'success'
}));
```

### 4. Check User Role
```tsx
const user = useAppSelector((state) => state.auth.user);
const isAdmin = user?.role === 'administrator';
```

### 5. Get Unread Count
```tsx
const unreadCount = useAppSelector(
  (state) => state.notifications.items.filter(n => !n.read).length
);
```

## 🎨 Component Examples

### Example 1: User Profile
```tsx
import { useAppSelector } from '../store/hooks';

function UserProfile() {
  const user = useAppSelector((state) => state.auth.user);
  
  if (!user) return <div>Not logged in</div>;
  
  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <span>Role: {user.role}</span>
    </div>
  );
}
```

### Example 2: Theme Toggle
```tsx
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleDarkMode } from '../store/slices/uiSlice';

function ThemeToggle() {
  const dispatch = useAppDispatch();
  const darkMode = useAppSelector((state) => state.ui.darkMode);
  
  return (
    <button onClick={() => dispatch(toggleDarkMode())}>
      {darkMode ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
```

### Example 3: Notification Badge
```tsx
import { useAppSelector } from '../store/hooks';
import { selectUnreadCount } from '../store/selectors';

function NotificationBadge() {
  const count = useAppSelector(selectUnreadCount);
  
  if (count === 0) return null;
  
  return <span className="badge">{count}</span>;
}
```

### Example 4: Protected Content
```tsx
import { useAppSelector } from '../store/hooks';

function AdminPanel() {
  const user = useAppSelector((state) => state.auth.user);
  
  if (user?.role !== 'administrator') {
    return <div>Access Denied</div>;
  }
  
  return <div>Admin Content</div>;
}
```

## 🔐 Role-Based Access

### Using Selectors
```tsx
import { useAppSelector } from '../store/hooks';
import { 
  selectCanAccessAdminFeatures,
  selectCanAccessManagerFeatures 
} from '../store/selectors';

function Dashboard() {
  const canAccessAdmin = useAppSelector(selectCanAccessAdminFeatures);
  const canAccessManager = useAppSelector(selectCanAccessManagerFeatures);
  
  return (
    <div>
      {canAccessAdmin && <AdminSection />}
      {canAccessManager && <ManagerSection />}
      <UserSection />
    </div>
  );
}
```

## 📊 State Updates

### Synchronous Updates
```tsx
// Immediate state change
dispatch(setSidebarOpen(true));
```

### With Side Effects
```tsx
const handleSave = async () => {
  try {
    // Optimistic update
    dispatch(addItem(newItem));
    
    // API call
    await saveToServer(newItem);
    
    // Success notification
    dispatch(addNotification({
      title: 'Saved',
      message: 'Item saved successfully',
      type: 'success',
      timestamp: new Date().toLocaleString(),
      read: false
    }));
  } catch (error) {
    // Rollback on error
    dispatch(removeItem(newItem.id));
    
    // Error notification
    dispatch(addNotification({
      title: 'Error',
      message: 'Failed to save item',
      type: 'error',
      timestamp: new Date().toLocaleString(),
      read: false
    }));
  }
};
```

## 🐛 Debugging

### 1. Log State
```tsx
const state = useAppSelector((state) => state);
console.log('Current state:', state);
```

### 2. Log Specific Slice
```tsx
const authState = useAppSelector((state) => state.auth);
console.log('Auth state:', authState);
```

### 3. Use Redux DevTools
- Install Redux DevTools browser extension
- Open DevTools → Redux tab
- View actions, state, and time-travel

## ⚠️ Common Mistakes

### ❌ Don't mutate state directly
```tsx
// Wrong
state.items.push(newItem);

// Correct (Redux Toolkit uses Immer)
state.items.push(newItem); // Actually OK with Redux Toolkit!
```

### ❌ Don't use plain hooks
```tsx
// Wrong
import { useDispatch, useSelector } from 'react-redux';

// Correct
import { useAppDispatch, useAppSelector } from '../store/hooks';
```

### ❌ Don't keep state in useState if it's in Redux
```tsx
// Wrong
const [darkMode, setDarkMode] = useState(false); // Duplicate!
const reduxDarkMode = useAppSelector((state) => state.ui.darkMode);

// Correct
const darkMode = useAppSelector((state) => state.ui.darkMode);
```

## 🚀 Next Steps

### Add More Slices
Create slices for:
- Inventory items
- Purchase orders
- Loan requests
- Reports data

### Example New Slice
```tsx
// store/slices/inventorySlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Item {
  id: string;
  name: string;
  quantity: number;
}

interface InventoryState {
  items: Item[];
  loading: boolean;
}

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: { items: [], loading: false } as InventoryState,
  reducers: {
    setItems: (state, action: PayloadAction<Item[]>) => {
      state.items = action.payload;
    },
    addItem: (state, action: PayloadAction<Item>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setItems, addItem, removeItem, setLoading } = inventorySlice.actions;
export default inventorySlice.reducer;
```

Then add to store:
```tsx
// store/store.ts
import inventoryReducer from './slices/inventorySlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationsReducer,
    inventory: inventoryReducer, // ← Add here
  },
});
```

## 📚 Resources

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Full Documentation](/REDUX_DOCUMENTATION.md)
- [React Redux Hooks API](https://react-redux.js.org/api/hooks)

---

**Status:** ✅ All systems operational
**Current State:**
- ✅ Auth slice (user management)
- ✅ UI slice (sidebar, dark mode, notifications panel)
- ✅ Notifications slice (notification management)
- ✅ Typed hooks and selectors
- ✅ Full TypeScript support

**Ready to use!** Start accessing state with `useAppSelector` and updating it with `useAppDispatch`.
