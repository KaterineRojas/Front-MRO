# Redux Usage Examples

## Example 1: Using Cart Actions

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCartItems, selectCartItemsCount } from '../store/selectors';
import { addToCart, removeFromCart } from '../store/actions';

function ProductCard({ item }) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const totalItems = useAppSelector(selectCartItemsCount);
  
  const handleAddToCart = () => {
    dispatch(addToCart({ item, quantity: 1 }));
  };
  
  const handleRemove = () => {
    dispatch(removeFromCart(item.id));
  };
  
  return (
    <div>
      <h3>{item.name}</h3>
      <p>Total items in cart: {totalItems}</p>
      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleRemove}>Remove</button>
    </div>
  );
}
```

## Example 2: Filtering Inventory

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectFilteredInventory, selectCategories } from '../store/selectors';
import { setSearchQuery, setSelectedCategory } from '../store/actions';

function InventoryFilter() {
  const dispatch = useAppDispatch();
  const filteredItems = useAppSelector(selectFilteredInventory);
  const categories = useAppSelector(selectCategories);
  
  return (
    <div>
      <input
        type="text"
        placeholder="Search..."
        onChange={(e) => dispatch(setSearchQuery(e.target.value))}
      />
      
      <select onChange={(e) => dispatch(setSelectedCategory(e.target.value || null))}>
        <option value="">All Categories</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>
      
      <div>
        {filteredItems.map(item => (
          <div key={item.id}>{item.name}</div>
        ))}
      </div>
    </div>
  );
}
```

## Example 3: Notifications

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectUnreadNotificationsCount, selectNotifications } from '../store/selectors';
import { markAsRead } from '../store/actions';

function NotificationBell() {
  const dispatch = useAppDispatch();
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);
  const notifications = useAppSelector(selectNotifications);
  
  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id));
  };
  
  return (
    <div>
      <button>
        Notifications {unreadCount > 0 && `(${unreadCount})`}
      </button>
      
      <div>
        {notifications.map(notif => (
          <div 
            key={notif.id} 
            onClick={() => handleMarkAsRead(notif.id)}
            style={{ fontWeight: notif.read ? 'normal' : 'bold' }}
          >
            {notif.message}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Example 4: Page Navigation

```typescript
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectCurrentPage } from '../store/selectors';
import { setCurrentPage } from '../store/actions';

function Navigation() {
  const dispatch = useAppDispatch();
  const currentPage = useAppSelector(selectCurrentPage);
  
  const navigate = (page: Page) => {
    dispatch(setCurrentPage(page));
  };
  
  return (
    <nav>
      <button 
        onClick={() => navigate('dashboard')}
        className={currentPage === 'dashboard' ? 'active' : ''}
      >
        Dashboard
      </button>
      <button 
        onClick={() => navigate('catalog')}
        className={currentPage === 'catalog' ? 'active' : ''}
      >
        Catalog
      </button>
    </nav>
  );
}
```

## Example 5: Using Helper Utilities

```typescript
import { useAppSelector } from '../store/hooks';
import { canAddToCart, getCartItemQuantity } from '../store/utils';

function AddToCartButton({ itemId, quantity }: { itemId: string; quantity: number }) {
  const state = useAppSelector(state => state);
  const currentQuantity = getCartItemQuantity(state, itemId);
  const canAdd = canAddToCart(state, itemId, quantity);
  
  return (
    <div>
      <p>Currently in cart: {currentQuantity}</p>
      <button disabled={!canAdd}>
        {canAdd ? 'Add to Cart' : 'Out of Stock'}
      </button>
    </div>
  );
}
```

## Example 6: Custom Selector in Component

```typescript
import { useAppSelector } from '../store/hooks';
import { createSelector } from '@reduxjs/toolkit';
import { selectCartItems } from '../store/selectors';

// Create a custom selector for this component
const selectCartItemIds = createSelector(
  [selectCartItems],
  (items) => items.map(item => item.item.id)
);

function QuickCheckout() {
  const cartItemIds = useAppSelector(selectCartItemIds);
  
  return (
    <div>
      <p>Items in cart: {cartItemIds.join(', ')}</p>
    </div>
  );
}
```

## Example 7: Dispatching Multiple Actions

```typescript
import { useAppDispatch } from '../store/hooks';
import { clearCart, setCurrentPage, addNotification } from '../store/actions';

function CheckoutButton() {
  const dispatch = useAppDispatch();
  
  const handleCheckout = () => {
    // Dispatch multiple actions
    dispatch(addNotification({
      id: Date.now().toString(),
      message: 'Order placed successfully!',
      type: 'success',
      timestamp: new Date().toISOString(),
      read: false
    }));
    
    dispatch(clearCart());
    dispatch(setCurrentPage('dashboard'));
  };
  
  return <button onClick={handleCheckout}>Checkout</button>;
}
```

## Example 8: Conditional Rendering Based on State

```typescript
import { useAppSelector } from '../store/hooks';
import { selectCurrentUser, selectCartItems } from '../store/selectors';

function UserDashboard() {
  const currentUser = useAppSelector(selectCurrentUser);
  const cartItems = useAppSelector(selectCartItems);
  
  if (!currentUser) {
    return <div>Please log in</div>;
  }
  
  return (
    <div>
      <h1>Welcome, {currentUser.name}</h1>
      <p>Department: {currentUser.department}</p>
      <p>Items in cart: {cartItems.length}</p>
    </div>
  );
}
```

## Tips

1. **Memoize selectors** - Use `createSelector` for computed values
2. **Avoid selecting entire state** - Only select what you need
3. **Use typed hooks** - Always use `useAppSelector` and `useAppDispatch`
4. **Batch updates** - Dispatch multiple actions in sequence if needed
5. **Handle errors** - Wrap dispatches in try-catch for async operations
6. **Use utilities** - Leverage helper functions in `store/utils.ts`
