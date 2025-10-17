# Inventory Redux - Ejemplos de Uso

## 🚀 Uso Rápido

### Acceder a los datos del inventario

```typescript
import { useAppSelector } from '../../../store/hooks';

function MyComponent() {
  // Obtener todos los artículos
  const articles = useAppSelector(state => state.inventory.articles);
  
  // Obtener todos los kits
  const kits = useAppSelector(state => state.inventory.kits);
  
  // Obtener estado de carga
  const loading = useAppSelector(state => state.inventory.loading);
  
  // Obtener errores
  const error = useAppSelector(state => state.inventory.error);
  
  return (
    <div>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <ul>
          {articles.map(article => (
            <li key={article.id}>{article.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### Usar selectores predefinidos

```typescript
import { 
  selectArticles, 
  selectLowStockArticles,
  selectOutOfStockArticles 
} from '../../../store/selectors';

function InventoryDashboard() {
  const articles = useAppSelector(selectArticles);
  const lowStock = useAppSelector(selectLowStockArticles);
  const outOfStock = useAppSelector(selectOutOfStockArticles);
  
  return (
    <div>
      <div>Total Articles: {articles.length}</div>
      <div>Low Stock: {lowStock.length}</div>
      <div>Out of Stock: {outOfStock.length}</div>
    </div>
  );
}
```

---

## 📥 Cargar Datos

### Cargar al montar el componente

```typescript
import { useEffect } from 'react';
import { useAppDispatch } from '../../../store/hooks';
import { fetchArticles, fetchKits } from '../../../store/slices/inventorySlice';

function InventoryPage() {
  const dispatch = useAppDispatch();
  
  useEffect(() => {
    // Cargar artículos y kits al montar
    dispatch(fetchArticles());
    dispatch(fetchKits());
  }, [dispatch]);
  
  // ... resto del componente
}
```

### Recargar datos manualmente

```typescript
function RefreshButton() {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(state => state.inventory.loading);
  
  const handleRefresh = () => {
    dispatch(fetchArticles());
    dispatch(fetchKits());
  };
  
  return (
    <button onClick={handleRefresh} disabled={loading}>
      {loading ? 'Cargando...' : 'Recargar'}
    </button>
  );
}
```

---

## ➕ Crear Artículos

### Crear un nuevo artículo

```typescript
import { useAppDispatch } from '../../../store/hooks';
import { createArticle } from '../../../store/slices/inventorySlice';

function CreateArticleForm() {
  const dispatch = useAppDispatch();
  
  const handleSubmit = (formData) => {
    const newArticle = {
      id: Date.now(),
      sku: formData.sku,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      type: formData.type,
      currentStock: 0,
      cost: parseFloat(formData.cost),
      binCode: formData.binCode,
      unit: formData.unit,
      supplier: formData.supplier,
      minStock: parseInt(formData.minStock),
      location: 'Warehouse',
      status: 'good-condition',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    dispatch(createArticle(newArticle));
    alert('Article created successfully!');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

---

## ✏️ Actualizar Artículos

### Actualizar un artículo existente

```typescript
import { updateArticle } from '../../../store/slices/inventorySlice';

function EditArticleForm({ articleId }) {
  const dispatch = useAppDispatch();
  
  const handleUpdate = (formData) => {
    dispatch(updateArticle({
      id: articleId,
      data: {
        name: formData.name,
        description: formData.description,
        cost: parseFloat(formData.cost),
        minStock: parseInt(formData.minStock),
        // ... otros campos
      }
    }));
    
    alert('Article updated successfully!');
  };
  
  return (
    <form onSubmit={handleUpdate}>
      {/* Form fields */}
    </form>
  );
}
```

### Actualizar solo algunos campos

```typescript
// Solo actualizar el precio
dispatch(updateArticle({
  id: 1,
  data: { cost: 25.99 }
}));

// Solo actualizar stock mínimo
dispatch(updateArticle({
  id: 1,
  data: { minStock: 100 }
}));
```

---

## 🗑️ Eliminar Artículos

### Eliminar un artículo

```typescript
import { deleteArticle } from '../../../store/slices/inventorySlice';

function DeleteButton({ articleId }) {
  const dispatch = useAppDispatch();
  
  const handleDelete = () => {
    if (confirm('¿Está seguro de eliminar este artículo?')) {
      dispatch(deleteArticle(articleId));
      alert('Article deleted successfully!');
    }
  };
  
  return (
    <button onClick={handleDelete}>Delete</button>
  );
}
```

---

## 📦 Operaciones con Kits

### Crear un kit

```typescript
import { createKit } from '../../../store/slices/inventorySlice';

function CreateKitForm() {
  const dispatch = useAppDispatch();
  
  const handleCreateKit = (formData) => {
    const newKit = {
      id: Date.now(),
      binCode: formData.binCode,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      items: formData.items, // Array of KitItem
      imageUrl: 'https://example.com/image.jpg',
      status: 'good-condition',
      createdAt: new Date().toISOString().split('T')[0]
    };
    
    dispatch(createKit(newKit));
    alert('Kit created successfully!');
  };
  
  return (
    <form onSubmit={handleCreateKit}>
      {/* Form fields */}
    </form>
  );
}
```

### Actualizar un kit

```typescript
import { updateKit } from '../../../store/slices/inventorySlice';

dispatch(updateKit({
  id: kitId,
  data: {
    name: 'Updated Kit Name',
    items: updatedItems
  }
}));
```

### Eliminar un kit

```typescript
import { deleteKit } from '../../../store/slices/inventorySlice';

dispatch(deleteKit(kitId));
```

---

## 📊 Registrar Movimientos

### Movimiento de entrada (Entry)

```typescript
import { recordMovement } from '../../../store/slices/inventorySlice';

function RecordEntryMovement() {
  const dispatch = useAppDispatch();
  
  const handleEntry = () => {
    const movementData = {
      itemType: 'item',
      movementType: 'entry',
      articleSKU: 'SKU-001',
      articleBinCode: '',
      kitBinCode: '',
      quantity: '100',
      unitPrice: '0.50',
      status: 'good-condition',
      newLocation: 'Storage Room A',
      notes: 'New stock arrival'
    };
    
    dispatch(recordMovement(movementData));
    alert('Entry recorded successfully!');
  };
  
  return (
    <button onClick={handleEntry}>Record Entry</button>
  );
}
```

### Movimiento de salida (Exit)

```typescript
const exitMovement = {
  itemType: 'item',
  movementType: 'exit',
  articleSKU: '',
  articleBinCode: 'BIN-OFF-001',
  kitBinCode: '',
  quantity: '50',
  unitPrice: '0',
  status: 'good-condition',
  newLocation: '',
  notes: 'Issued to department'
};

dispatch(recordMovement(exitMovement));
```

### Movimiento de reubicación (Relocation)

```typescript
const relocationMovement = {
  itemType: 'item',
  movementType: 'relocation',
  articleSKU: '',
  articleBinCode: 'BIN-OFF-001',
  kitBinCode: '',
  quantity: '25',
  unitPrice: '0',
  status: 'good-condition',
  newLocation: 'Storage Room B',
  notes: 'Moved to new location'
};

dispatch(recordMovement(relocationMovement));
```

---

## 🔍 Buscar y Filtrar

### Buscar artículo por ID

```typescript
import { selectArticleById } from '../../../store/selectors';

function ArticleDetails({ articleId }) {
  const article = useAppSelector(state => 
    selectArticleById(state, articleId)
  );
  
  if (!article) {
    return <div>Article not found</div>;
  }
  
  return (
    <div>
      <h2>{article.name}</h2>
      <p>{article.description}</p>
      <p>Stock: {article.currentStock}</p>
    </div>
  );
}
```

### Filtrar por categoría

```typescript
function FilterByCategory({ category }) {
  const articles = useAppSelector(state => 
    state.inventory.articles.filter(a => a.category === category)
  );
  
  return (
    <ul>
      {articles.map(article => (
        <li key={article.id}>{article.name}</li>
      ))}
    </ul>
  );
}
```

### Filtrar por tipo

```typescript
// Obtener solo consumibles
const consumables = useAppSelector(state =>
  state.inventory.articles.filter(a => a.type === 'consumable')
);

// Obtener solo no-consumibles
const nonConsumables = useAppSelector(state =>
  state.inventory.articles.filter(a => a.type === 'non-consumable')
);

// Obtener pendientes de compra
const pendingPurchase = useAppSelector(state =>
  state.inventory.articles.filter(a => a.type === 'pending-purchase')
);
```

### Buscar por nombre

```typescript
function SearchArticles({ searchTerm }) {
  const results = useAppSelector(state =>
    state.inventory.articles.filter(article =>
      article.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  
  return (
    <ul>
      {results.map(article => (
        <li key={article.id}>{article.name}</li>
      ))}
    </ul>
  );
}
```

---

## 📈 Estadísticas y Reportes

### Calcular valor total del inventario

```typescript
function TotalInventoryValue() {
  const totalValue = useAppSelector(state =>
    state.inventory.articles.reduce((total, article) => 
      total + (article.currentStock * article.cost), 0
    )
  );
  
  return (
    <div>Total Inventory Value: ${totalValue.toFixed(2)}</div>
  );
}
```

### Artículos que necesitan reabastecimiento

```typescript
import { selectLowStockArticles } from '../../../store/selectors';

function LowStockAlert() {
  const lowStockItems = useAppSelector(selectLowStockArticles);
  
  return (
    <div>
      <h3>Items Need Restocking: {lowStockItems.length}</h3>
      <ul>
        {lowStockItems.map(article => (
          <li key={article.id}>
            {article.name} - Stock: {article.currentStock} / Min: {article.minStock}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

### Artículos sin stock

```typescript
import { selectOutOfStockArticles } from '../../../store/selectors';

function OutOfStockAlert() {
  const outOfStockItems = useAppSelector(selectOutOfStockArticles);
  
  if (outOfStockItems.length === 0) {
    return <div>All items in stock ✓</div>;
  }
  
  return (
    <div className="alert alert-danger">
      <h3>Out of Stock: {outOfStockItems.length}</h3>
      <ul>
        {outOfStockItems.map(article => (
          <li key={article.id}>{article.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔄 Manejo de Estados de Carga

### Mostrar loading spinner

```typescript
function InventoryList() {
  const articles = useAppSelector(state => state.inventory.articles);
  const loading = useAppSelector(state => state.inventory.loading);
  
  if (loading && articles.length === 0) {
    return (
      <div className="loading-spinner">
        <p>Loading inventory data...</p>
      </div>
    );
  }
  
  return (
    <ul>
      {articles.map(article => (
        <li key={article.id}>{article.name}</li>
      ))}
    </ul>
  );
}
```

### Mostrar errores con retry

```typescript
function InventoryWithErrorHandling() {
  const dispatch = useAppDispatch();
  const error = useAppSelector(state => state.inventory.error);
  
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={() => {
          dispatch(fetchArticles());
          dispatch(fetchKits());
        }}>
          Retry
        </button>
      </div>
    );
  }
  
  return <InventoryList />;
}
```

---

## 🎯 Patrones Avanzados

### Custom Hook para inventario

```typescript
function useInventory() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(state => state.inventory.articles);
  const kits = useAppSelector(state => state.inventory.kits);
  const loading = useAppSelector(state => state.inventory.loading);
  const error = useAppSelector(state => state.inventory.error);
  
  useEffect(() => {
    dispatch(fetchArticles());
    dispatch(fetchKits());
  }, [dispatch]);
  
  return { articles, kits, loading, error };
}

// Uso
function MyComponent() {
  const { articles, kits, loading, error } = useInventory();
  
  // ... usar los datos
}
```

### Selector con memoización

```typescript
import { createSelector } from '@reduxjs/toolkit';

const selectInventoryState = (state: RootState) => state.inventory;

export const selectArticlesByCategory = createSelector(
  [selectInventoryState, (state, category) => category],
  (inventory, category) => 
    inventory.articles.filter(a => a.category === category)
);

// Uso
const techArticles = useAppSelector(state => 
  selectArticlesByCategory(state, 'technology')
);
```

---

## 💡 Tips y Best Practices

### 1. Siempre verificar loading state
```typescript
// ✅ BUENO
if (loading && articles.length === 0) {
  return <LoadingSpinner />;
}

// ❌ MALO
if (loading) {
  return <LoadingSpinner />; // Esto ocultará datos existentes
}
```

### 2. Manejar errores apropiadamente
```typescript
// ✅ BUENO
if (error) {
  return <ErrorDisplay error={error} onRetry={handleRetry} />;
}

// ❌ MALO
// No manejar errores - la UI se queda en loading forever
```

### 3. Usar selectores para datos derivados
```typescript
// ✅ BUENO - Usar selector
const lowStock = useAppSelector(selectLowStockArticles);

// ❌ MALO - Calcular en componente (re-calcula en cada render)
const lowStock = articles.filter(a => a.currentStock <= a.minStock);
```

### 4. Validar datos antes de dispatch
```typescript
// ✅ BUENO
const handleRecordMovement = (movementData) => {
  const article = articles.find(a => a.binCode === movementData.articleBinCode);
  
  if (!article) {
    alert('Article not found');
    return;
  }
  
  if (movementData.movementType === 'exit' && 
      parseInt(movementData.quantity) > article.currentStock) {
    alert('Insufficient stock');
    return;
  }
  
  dispatch(recordMovement(movementData));
};

// ❌ MALO - No validar, permitir estado inválido
```

---

## 🚨 Errores Comunes

### ❌ No cargar datos
```typescript
// MALO - Olvidar cargar datos
function MyComponent() {
  const articles = useAppSelector(state => state.inventory.articles);
  // articles estará vacío porque nunca se cargaron
  
  return <div>{articles.length}</div>;
}

// ✅ BUENO
function MyComponent() {
  const dispatch = useAppDispatch();
  const articles = useAppSelector(state => state.inventory.articles);
  
  useEffect(() => {
    dispatch(fetchArticles());
  }, [dispatch]);
  
  return <div>{articles.length}</div>;
}
```

### ❌ Mutar el estado directamente
```typescript
// MALO - Mutar directamente
articles[0].name = 'New Name'; // ¡No hacer esto!

// ✅ BUENO - Usar acción Redux
dispatch(updateArticle({ id: articles[0].id, data: { name: 'New Name' } }));
```

### ❌ Usar hooks incorrectos
```typescript
// MALO
import { useDispatch, useSelector } from 'react-redux';

// ✅ BUENO
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
```

---

¡Feliz coding! 🚀
