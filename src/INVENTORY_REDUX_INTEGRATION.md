# Inventory Redux Integration

## Overview

This document describes the integration of Redux Thunk for managing inventory data in the Inventory Management module. The refactoring moves static mock data to a simulated API service and implements asynchronous data fetching using Redux Toolkit.

## Changes Made

### 1. New Files Created

#### `/components/features/inventory/services/inventoryApi.ts`
- **Purpose**: Simulates API calls for fetching inventory data
- **Functions**:
  - `fetchArticlesFromApi()`: Simulates fetching articles with a 500ms delay
  - `fetchKitsFromApi()`: Simulates fetching kits with a 500ms delay
- **Data**: Contains the mock data previously stored in `constants.ts`

#### `/store/slices/inventorySlice.ts`
- **Purpose**: Redux slice for inventory state management
- **State**:
  - `articles`: Array of Article objects
  - `kits`: Array of Kit objects
  - `loading`: Boolean for loading state
  - `error`: String for error messages
- **Async Thunks**:
  - `fetchArticles`: Loads articles from the API service
  - `fetchKits`: Loads kits from the API service
- **Reducers**:
  - `createArticle`: Adds a new article
  - `updateArticle`: Updates an existing article
  - `deleteArticle`: Removes an article
  - `createKit`: Adds a new kit
  - `updateKit`: Updates an existing kit
  - `deleteKit`: Removes a kit
  - `recordMovement`: Records inventory movements (entries, exits, relocations)

### 2. Modified Files

#### `/store/store.ts`
- Added `inventoryReducer` to the store configuration

#### `/components/features/inventory/constants.ts`
- Removed `MOCK_ARTICLES` and `MOCK_KITS` (moved to service layer)
- Kept `CATEGORIES` constant for UI purposes

#### `/components/features/inventory/InventoryManager.tsx`
- Replaced local state with Redux state using `useAppSelector` and `useAppDispatch`
- Added `useEffect` to load data on component mount
- Updated all handlers to dispatch Redux actions instead of updating local state
- Added loading and error states with appropriate UI feedback

#### `/store/selectors.ts`
- Added inventory-specific selectors:
  - `selectArticles`: Get all articles
  - `selectKits`: Get all kits
  - `selectInventoryLoading`: Get loading state
  - `selectInventoryError`: Get error state
  - `selectLowStockArticles`: Get articles below minimum stock
  - `selectOutOfStockArticles`: Get articles with zero stock
  - `selectArticleById`: Get specific article by ID
  - `selectKitById`: Get specific kit by ID

#### `/components/features/inventory/index.ts`
- Added export for inventory API service

## Architecture

### Data Flow

```
Component Mount
    ↓
dispatch(fetchArticles())
dispatch(fetchKits())
    ↓
Redux Thunk Middleware
    ↓
inventoryApi.fetchArticlesFromApi()
inventoryApi.fetchKitsFromApi()
    ↓
Simulated API Delay (500ms)
    ↓
Return Mock Data
    ↓
Redux Store Updated
    ↓
Component Re-renders with Data
```

### State Management Flow

```
User Action (Create/Update/Delete)
    ↓
Event Handler in Component
    ↓
dispatch(action)
    ↓
Redux Reducer
    ↓
State Updated
    ↓
Component Re-renders
```

## Benefits

1. **Centralized State**: All inventory data is now managed in Redux store
2. **Async Ready**: Infrastructure in place for real API integration
3. **Better Testing**: Service layer can be easily mocked for tests
4. **Loading States**: Proper handling of loading and error states
5. **Scalability**: Easy to add more async operations
6. **Type Safety**: Full TypeScript support throughout the data flow

## Usage Examples

### Accessing Data in Components

```typescript
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchArticles } from '../../../store/slices/inventorySlice';

function MyComponent() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(state => state.inventory.articles);
  const loading = useAppSelector(state => state.inventory.loading);
  
  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);
  
  // ... rest of component
}
```

### Creating an Article

```typescript
import { createArticle } from '../../../store/slices/inventorySlice';

const newArticle = {
  id: Date.now(),
  name: 'New Item',
  // ... other properties
};

dispatch(createArticle(newArticle));
```

### Recording a Movement

```typescript
import { recordMovement } from '../../../store/slices/inventorySlice';

const movementData = {
  itemType: 'item',
  movementType: 'entry',
  articleSKU: 'SKU-001',
  quantity: '10',
  // ... other properties
};

dispatch(recordMovement(movementData));
```

## Migration from Old System

### Before (Local State)
```typescript
const [articles, setArticles] = useState(MOCK_ARTICLES);
```

### After (Redux)
```typescript
const articles = useAppSelector(state => state.inventory.articles);
const dispatch = useAppDispatch();

useEffect(() => {
  dispatch(fetchArticles());
}, [dispatch]);
```

## Future Enhancements

1. **Real API Integration**: Replace `inventoryApi.ts` service with actual API calls
2. **Optimistic Updates**: Implement optimistic UI updates for better UX
3. **Caching**: Add caching layer to reduce unnecessary API calls
4. **Pagination**: Implement pagination for large datasets
5. **Real-time Updates**: Add WebSocket support for real-time inventory updates
6. **Offline Support**: Implement offline-first architecture with sync

## Testing

The new architecture makes testing easier:

```typescript
// Mock the service
jest.mock('./services/inventoryApi');

// Test the thunk
test('fetchArticles should load articles', async () => {
  const mockArticles = [/* ... */];
  fetchArticlesFromApi.mockResolvedValue(mockArticles);
  
  const result = await store.dispatch(fetchArticles());
  expect(result.payload).toEqual(mockArticles);
});
```

## Performance Considerations

- **Initial Load**: Data is loaded asynchronously on component mount (500ms simulated delay)
- **Subsequent Operations**: All CRUD operations are synchronous (instant updates)
- **Memory**: All inventory data is kept in Redux store (consider pagination for large datasets)
- **Re-renders**: Components only re-render when their selected state changes

## Conclusion

This refactoring establishes a solid foundation for scalable inventory management with proper separation of concerns, type safety, and async data handling. The simulated API layer makes it easy to transition to real backend integration when ready.
