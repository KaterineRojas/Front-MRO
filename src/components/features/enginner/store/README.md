# Redux Store Structure

This application uses Redux Toolkit for state management with persistence, selectors, and middleware.

## Store Slices

### 1. Cart Slice (`cartSlice.ts`)
Manages the shopping cart state for inventory items with automatic localStorage persistence.

**State:**
- `items`: Array of cart items with item details and quantities

**Actions:**
- `addToCart({ item, quantity })`: Add item to cart with stock validation
- `updateCartItem({ itemId, quantity })`: Update quantity with stock validation
- `removeFromCart(itemId)`: Remove specific item from cart
- `clearCart()`: Clear all items from cart

**Features:**
- Automatic validation of stock availability
- Prevents adding more items than available
- Cart persists across page refreshes via localStorage

### 2. Notifications Slice (`notificationsSlice.ts`)
Manages system notifications.

**State:**
- `items`: Array of notification objects

**Actions:**
- `markAsRead(notificationId)`: Mark a notification as read
- `addNotification(notification)`: Add a new notification
- `removeNotification(notificationId)`: Remove a notification

### 3. User Slice (`userSlice.ts`)
Manages current user information.

**State:**
- `currentUser`: User object with id, name, email, and department

**Actions:**
- `setUser(user)`: Set the current user
- `updateUser(partialUser)`: Update user properties

### 4. UI Slice (`uiSlice.ts`)
Manages UI state like current page and theme.

**State:**
- `currentPage`: Current active page
- `darkMode`: Dark mode toggle state

**Actions:**
- `setCurrentPage(page)`: Navigate to a different page
- `toggleDarkMode()`: Toggle dark mode on/off
- `setDarkMode(enabled)`: Set dark mode state

### 5. Inventory Slice (`inventorySlice.ts`)
Manages inventory catalog and filtering.

**State:**
- `items`: Array of all inventory items
- `searchQuery`: Current search text
- `selectedCategory`: Current category filter

**Actions:**
- `setSearchQuery(query)`: Update search filter
- `setSelectedCategory(category)`: Update category filter
- `updateItemQuantity({ itemId, availableQuantity })`: Update item stock

## Selectors (`selectors.ts`)

Optimized selectors using `createSelector` for performance:

### Cart Selectors
- `selectCartItems`: Get all cart items
- `selectCartItemsCount`: Get total quantity of items in cart
- `selectCartTotal`: Get number of different items
- `selectIsItemInCart(itemId)`: Check if item is in cart

### Notification Selectors
- `selectNotifications`: Get all notifications
- `selectUnreadNotifications`: Get only unread notifications
- `selectUnreadNotificationsCount`: Get count of unread notifications

### Inventory Selectors
- `selectInventoryItems`: Get all inventory items
- `selectFilteredInventory`: Get filtered items based on search/category
- `selectCategories`: Get list of all categories
- `selectSearchQuery`: Get current search query
- `selectSelectedCategory`: Get current category filter

### UI Selectors
- `selectCurrentPage`: Get current page
- `selectDarkMode`: Get dark mode state

### User Selectors
- `selectCurrentUser`: Get current user

## Usage

### Using Selectors (Recommended)

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { addToCart } from '../store/slices/cartSlice';
import { selectCartItems, selectCartItemsCount } from '../store/selectors';

function MyComponent() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const itemCount = useAppSelector(selectCartItemsCount);
  
  const handleAddItem = (item, quantity) => {
    dispatch(addToCart({ item, quantity }));
  };
  
  return (
    <div>
      <p>Items in cart: {itemCount}</p>
      {/* component JSX */}
    </div>
  );
}
```

### Direct State Access

```typescript
import { useAppSelector } from '../store/hooks';

function MyComponent() {
  const currentPage = useAppSelector(state => state.ui.currentPage);
  
  return (
    // component JSX
  );
}
```

## Middleware

### localStorage Middleware
Automatically persists cart items to browser localStorage on any cart action. The cart is restored when the application loads.

## Features

- **Centralized State**: All application state in one place
- **Type Safety**: Full TypeScript support with typed hooks
- **Immutable Updates**: Redux Toolkit uses Immer for safe state mutations
- **DevTools**: Redux DevTools support for debugging
- **Predictable**: Clear action flow and state updates
- **Optimized**: Memoized selectors prevent unnecessary re-renders
- **Persistent**: Cart data persists across page refreshes
- **Validated**: Stock validation prevents over-ordering

## Helper Utilities (`utils.ts`)

Utility functions for common Redux operations:

- `isItemInCart(state, itemId)`: Check if item exists in cart
- `getCartItemQuantity(state, itemId)`: Get quantity of specific item in cart
- `getTotalCartItems(state)`: Get total number of items in cart
- `getUnreadNotificationsCount(state)`: Get count of unread notifications
- `canAddToCart(state, itemId, quantity)`: Validate if items can be added to cart

## Centralized Exports

### Actions (`actions.ts`)
All actions are re-exported from a single file for convenience:

```typescript
import { addToCart, clearCart, setCurrentPage } from '../store/actions';
```

### Types (`types.ts`)
Common types re-exported for easier imports.

## File Structure

```
/store
├── index.ts                    # Store configuration & middleware
├── hooks.ts                    # Typed Redux hooks
├── actions.ts                  # All actions exported
├── selectors.ts                # Memoized selectors
├── types.ts                    # TypeScript types
├── utils.ts                    # Helper utilities
├── README.md                   # This file
└── slices/
    ├── cartSlice.ts           # Cart state & actions
    ├── notificationsSlice.ts  # Notifications state
    ├── userSlice.ts           # User state
    ├── uiSlice.ts             # UI state
    └── inventorySlice.ts      # Inventory state
```

## Best Practices

1. **Use selectors** for derived state and filtering to optimize re-renders
2. **Use typed hooks** (`useAppDispatch`, `useAppSelector`) instead of plain Redux hooks
3. **Import from centralized files** - use `store/actions` and `store/selectors`
4. **Keep actions simple** - complex logic should be in reducers or middleware
5. **Use PayloadAction** for type-safe action creators
6. **Memoize expensive computations** in selectors with `createSelector`
7. **Validate before dispatch** - use helper utilities to check state before actions
8. **Handle side effects** in middleware, not in components

## Migration from Props to Redux

Components can now access state directly instead of prop drilling:

**Before:**
```typescript
function MyComponent({ cartItems, addToCart }) {
  // ...
}
```

**After:**
```typescript
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { selectCartItems } from '../store/selectors';
import { addToCart } from '../store/actions';

function MyComponent() {
  const cartItems = useAppSelector(selectCartItems);
  const dispatch = useAppDispatch();
  
  const handleAdd = (item, quantity) => {
    dispatch(addToCart({ item, quantity }));
  };
}
```
