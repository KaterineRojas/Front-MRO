# Inventory Redux - Quick Start Guide

## Introduction

El módulo de Inventory Manager ahora utiliza Redux Toolkit con Redux Thunk para gestionar los datos de manera centralizada y asíncrona. Esta guía te ayudará a entender cómo funciona el nuevo sistema.

## ¿Qué cambió?

### Antes
```typescript
// Los datos estaban en constants.ts y se usaban directamente
import { MOCK_ARTICLES, MOCK_KITS } from './constants';

const [articles, setArticles] = useState(MOCK_ARTICLES);
const [kits, setKits] = useState(MOCK_KITS);
```

### Ahora
```typescript
// Los datos se cargan desde un servicio simulado y se almacenan en Redux
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { fetchArticles, fetchKits } from '../../../store/slices/inventorySlice';

const articles = useAppSelector(state => state.inventory.articles);
const kits = useAppSelector(state => state.inventory.kits);
const loading = useAppSelector(state => state.inventory.loading);

useEffect(() => {
  dispatch(fetchArticles());
  dispatch(fetchKits());
}, [dispatch]);
```

## Estructura del Proyecto

```
/components/features/inventory/
├── services/
│   └── inventoryApi.ts          # Servicio que simula llamadas API
├── InventoryManager.tsx          # Componente principal (usa Redux)
├── types.ts                      # Tipos TypeScript
└── constants.ts                  # Constantes (solo CATEGORIES)

/store/slices/
└── inventorySlice.ts             # Redux slice con thunks y reducers
```

## Cómo Funciona

### 1. Carga Inicial de Datos

Cuando el componente `InventoryManager` se monta:

```typescript
useEffect(() => {
  dispatch(fetchArticles());  // Carga artículos (simula API con delay de 500ms)
  dispatch(fetchKits());      // Carga kits (simula API con delay de 500ms)
}, [dispatch]);
```

### 2. Estados de Carga

El componente muestra diferentes vistas según el estado:

```typescript
// Mientras carga (solo la primera vez)
if (loading && articles.length === 0) {
  return <div>Loading inventory data...</div>;
}

// Si hay error
if (error) {
  return <div>Error: {error}</div>;
}

// Cuando los datos están listos
return <div>{/* Contenido normal */}</div>;
```

### 3. Operaciones CRUD

Todas las operaciones usan Redux actions:

#### Crear Artículo
```typescript
const newArticle = {
  id: Date.now(),
  name: 'New Item',
  sku: 'SKU-009',
  // ... otros campos
};

dispatch(createArticle(newArticle));
```

#### Actualizar Artículo
```typescript
dispatch(updateArticle({ 
  id: 1, 
  data: { name: 'Updated Name' } 
}));
```

#### Eliminar Artículo
```typescript
dispatch(deleteArticle(1));
```

#### Registrar Movimiento
```typescript
const movementData = {
  itemType: 'item',
  movementType: 'entry',
  articleSKU: 'SKU-001',
  quantity: '10',
  // ... otros campos
};

dispatch(recordMovement(movementData));
```

## Servicio de API Simulado

El archivo `/components/features/inventory/services/inventoryApi.ts` contiene:

```typescript
// Simula un delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Funciones que simulan llamadas API
export async function fetchArticlesFromApi(): Promise<Article[]> {
  await delay(500); // Simula 500ms de latencia
  return [...MOCK_ARTICLES_DATA];
}

export async function fetchKitsFromApi(): Promise<Kit[]> {
  await delay(500);
  return [...MOCK_KITS_DATA];
}
```

**Para integrar con una API real**, simplemente reemplaza estas funciones:

```typescript
export async function fetchArticlesFromApi(): Promise<Article[]> {
  const response = await fetch('/api/articles');
  return response.json();
}
```

## Redux Slice

El archivo `/store/slices/inventorySlice.ts` define:

### Estado
```typescript
{
  articles: Article[],
  kits: Kit[],
  loading: boolean,
  error: string | null
}
```

### Thunks (Operaciones Asíncronas)
- `fetchArticles`: Carga artículos desde el servicio
- `fetchKits`: Carga kits desde el servicio

### Reducers (Operaciones Síncronas)
- `createArticle`, `updateArticle`, `deleteArticle`
- `createKit`, `updateKit`, `deleteKit`
- `recordMovement`

## Selectores Útiles

El archivo `/store/selectors.ts` incluye selectores convenientes:

```typescript
// Básicos
const articles = useAppSelector(selectArticles);
const kits = useAppSelector(selectKits);

// Computados
const lowStock = useAppSelector(selectLowStockArticles);
const outOfStock = useAppSelector(selectOutOfStockArticles);

// Por ID (necesitas pasar el ID)
const article = useAppSelector(state => selectArticleById(state, 1));
```

## Ventajas del Nuevo Sistema

1. **Centralización**: Todos los datos en un solo lugar (Redux store)
2. **Consistencia**: Todos los componentes ven los mismos datos
3. **Listo para API Real**: Solo cambiar el servicio para usar API real
4. **Estados de Carga**: Manejo apropiado de loading y errores
5. **Type Safety**: TypeScript en toda la cadena de datos
6. **Testing**: Más fácil hacer pruebas unitarias

## Migración de Código Existente

Si tienes código que usa el estado local, aquí está cómo migrarlo:

### Antes
```typescript
const [articles, setArticles] = useState(MOCK_ARTICLES);

const handleCreate = (newArticle) => {
  setArticles([...articles, newArticle]);
};
```

### Después
```typescript
const articles = useAppSelector(state => state.inventory.articles);
const dispatch = useAppDispatch();

const handleCreate = (newArticle) => {
  dispatch(createArticle(newArticle));
};
```

## Troubleshooting

### Los datos no se cargan
- Verifica que el componente dispatch `fetchArticles()` y `fetchKits()` en useEffect
- Revisa la consola del navegador por errores

### Los datos no se actualizan
- Asegúrate de usar `dispatch()` con las acciones correctas
- Verifica que estás usando `useAppSelector` en lugar de estado local

### Error de TypeScript
- Asegúrate de importar los tipos correctos de `./types`
- Verifica que uses `useAppDispatch` y `useAppSelector` de `/store/hooks`

## Próximos Pasos

1. **Integrar API Real**: Modificar `inventoryApi.ts` para usar fetch/axios
2. **Agregar Paginación**: Para manejar grandes volúmenes de datos
3. **Implementar Caché**: Evitar cargas innecesarias
4. **WebSocket**: Para actualizaciones en tiempo real
5. **Optimistic Updates**: Mejorar la UX con actualizaciones optimistas

## Soporte

Para más información, consulta:
- `/INVENTORY_REDUX_INTEGRATION.md` - Documentación técnica completa
- `/REDUX_DOCUMENTATION.md` - Documentación general de Redux
- `/components/features/inventory/README.md` - README del módulo
