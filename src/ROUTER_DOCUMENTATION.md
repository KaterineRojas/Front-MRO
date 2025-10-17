# React Router DOM Implementation

## Overview
This application now uses React Router DOM for client-side routing, replacing the previous state-based navigation system.

## Structure

### App Component: `/App.tsx`
- Main entry point of the application
- Wraps the entire app with `<BrowserRouter>`
- Defines all application routes in `AppRoutes` component
- Uses nested routing with Layout as parent
- Implements route guards for role-based access
- Contains wrapper components for legacy callback-based navigation

### Layout Component: `/components/Layout.tsx`
- Provides the main application shell (sidebar, header, notifications)
- Uses `<Outlet />` to render child routes
- Handles navigation state and user interface
- Manages dark mode, notifications, and user menu

## Route Structure

```
/                           → Dashboard
/inventory                  → Inventory Management
/quick-find                 → Quick Find
/reports                    → Reports

/cycle-count                → Cycle Count List
/cycle-count/active         → Active Cycle Count View

/loans                      → Request Orders (Loan Management)
/loans/detail               → Loan Detail View
/loans/return               → Return Items Page

/orders                     → Purchase Orders
/orders/detail              → Order Detail View

/requests                   → Request Management (Admin/Manager only)
/users                      → User Management (Admin only)
```

## Key Features

### 1. Nested Routing
All routes are nested under the Layout component:
```tsx
<Route path="/" element={<Layout />}>
  <Route index element={<Dashboard />} />
  <Route path="inventory" element={<InventoryManager />} />
  {/* ... more routes */}
</Route>
```

### 2. Navigation
Navigation is handled using the `useNavigate` hook:
```tsx
const navigate = useNavigate();
navigate('/inventory');
```

### 3. State Management Between Routes
For routes that need to pass data (e.g., viewing details):
- Uses `sessionStorage` to persist state during navigation
- State is stored as JSON before navigation
- Retrieved and cleared after use

Example:
```tsx
// Storing state
sessionStorage.setItem('navigationState', JSON.stringify(state));
navigate('/loans/detail');

// Retrieving state
const stateData = sessionStorage.getItem('navigationState');
const state = stateData ? JSON.parse(stateData) : null;

// Clearing state
sessionStorage.removeItem('navigationState');
```

### 4. Active Route Detection
Sidebar navigation highlights the current route:
```tsx
const isActivePath = (path: string) => {
  if (path === '/') {
    return location.pathname === '/';
  }
  return location.pathname.startsWith(path);
};
```

### 5. Role-Based Access Control
Routes are conditionally rendered based on user role:
```tsx
{['administrator', 'manager'].includes(mockUser.role) && (
  <Route path="requests" element={<RequestManagement />} />
)}

{mockUser.role === 'administrator' && (
  <Route path="users" element={<UserManagement />} />
)}
```

### 6. Wrapper Components
Components that previously used callback navigation now use wrapper components:
```tsx
function CycleCountWrapper() {
  const navigate = (path: string) => {
    window.location.hash = path;
  };
  
  return (
    <CycleCount 
      onStartCycleCount={() => navigate('/cycle-count/active')}
      onViewCycleCount={(record) => navigate('/cycle-count/active')}
    />
  );
}
```

## Migration Notes

### Before (State-based)
```tsx
const [activeTab, setActiveTab] = useState('dashboard');
const [detailView, setDetailView] = useState({ type: null });

// Navigation
setActiveTab('inventory');
setDetailView({ type: 'loan-detail', data: request });
```

### After (Route-based)
```tsx
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// Navigation
navigate('/inventory');
navigate('/loans/detail', { state: { request } });
```

## Benefits

1. **Browser History**: Users can use back/forward buttons
2. **Bookmarkable URLs**: Direct links to specific pages
3. **Better UX**: URL reflects current application state
4. **Code Organization**: Clear separation between routes and components
5. **SEO-Friendly**: Better for search engine indexing (if server-side rendering is added)

## Development Guidelines

### Adding a New Route

1. Create your component in `/components/`
2. Import it in `/App.tsx`
3. Add the route definition:
```tsx
<Route path="your-path" element={<YourComponent />} />
```
4. Add navigation item in `/components/Layout.tsx`:
```tsx
{ id: 'your-id', label: 'Your Label', icon: YourIcon, path: '/your-path' }
```

### Adding a Detail/Nested Route

1. Create wrapper component if needed
2. Add nested route under parent:
```tsx
<Route path="parent" element={<Parent />} />
<Route path="parent/detail" element={<DetailWrapper />} />
```
3. Use sessionStorage for passing complex data between routes

### Testing Navigation

Test all navigation paths:
- Direct URL access
- Sidebar navigation
- Back/forward buttons
- Deep linking
- Role-based access

## Troubleshooting

### Route Not Found
- Check route path matches navigation path
- Verify route is defined in App.tsx
- Check for typos in path strings

### State Not Persisting
- Verify sessionStorage key matches
- Check JSON serialization for complex objects
- Clear sessionStorage when navigation complete

### Role-Based Routes Not Showing
- Verify user role in mockUser
- Check conditional rendering logic
- Ensure route guard conditions match navigation items

## Future Enhancements

Potential improvements:
- Add route-based code splitting
- Implement protected route wrapper component
- Add loading states during navigation
- Use React Router's built-in state instead of sessionStorage
- Add route transitions/animations
- Implement breadcrumb navigation
