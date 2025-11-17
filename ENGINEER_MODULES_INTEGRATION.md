# Engineer Modules - Documentación de Integración

## Módulos Integrados

Los siguientes 5 módulos del sistema Engineer han sido integrados exitosamente al sistema principal:

### 1. **Engineer Catalog** (`/engineer/catalog`)
- Catálogo de inventario con búsqueda avanzada
- Búsqueda por imagen con IA
- Sistema de carrito de compras integrado
- Filtros por warehouse

### 2. **Engineer Borrow Requests** (`/engineer/borrow`)
- Gestión de solicitudes de préstamo
- Visualización de historial de préstamos
- Estados de solicitudes (Pending, Approved, Rejected, etc.)
- Detalles expandibles de cada solicitud

### 3. **Engineer Purchase Requests** (`/engineer/purchase`)
- Solicitudes de compra de materiales
- Seguimiento de órdenes de compra
- Gestión de presupuestos
- Aprobaciones de compras

### 4. **Engineer Transfer Requests** (`/engineer/transfer`)
- Transferencias entre warehouses
- Solicitudes de traslado de inventario
- Tracking de transferencias en proceso

### 5. **My Engineer Inventory** (`/engineer/my-inventory`)
- Inventario personal del ingeniero
- Items asignados actualmente
- Historial de items utilizados
- Devoluciones y retornos

### 6. **Engineer Complete History** (`/engineer/history`)
- Historial completo de todas las transacciones
- Búsqueda y filtrado de historial
- Exportación de reportes

## Sistema de Autenticación con Tokens

El sistema Engineer incluye un sistema configurable de autenticación con tokens JWT.

### Configuración

Editar el archivo: `src/components/features/enginner/constants.ts`

```typescript
/**
 * USE_AUTH_TOKENS: Controla si la aplicación utiliza autenticación basada en tokens
 * - true: Activa el sistema de autenticación con tokens JWT, login, rutas privadas
 * - false: Desactiva autenticación, todas las rutas son accesibles
 */
export const USE_AUTH_TOKENS = false; // Cambiar a true para activar autenticación

/**
 * TOKEN_STORAGE_TYPE: Configuración de almacenamiento de tokens
 * - 'localStorage': Persiste entre sesiones del navegador
 * - 'sessionStorage': Se elimina al cerrar el navegador
 */
export const TOKEN_STORAGE_TYPE: 'localStorage' | 'sessionStorage' = 'localStorage';

/**
 * TOKEN_KEY: Nombre de la clave para almacenar el token
 */
export const TOKEN_KEY = 'auth_token';

/**
 * USER_KEY: Nombre de la clave para almacenar datos del usuario
 */
export const USER_KEY = 'user_data';
```

### Activar Sistema de Tokens

Para activar el sistema de autenticación:

1. Cambiar `USE_AUTH_TOKENS = true` en `constants.ts`
2. Los usuarios deberán hacer login para acceder a los módulos
3. Se verificará el token en cada solicitud
4. Las rutas estarán protegidas con `PrivateRoute`

### Desactivar Sistema de Tokens

Para desactivar el sistema de autenticación:

1. Cambiar `USE_AUTH_TOKENS = false` en `constants.ts`
2. Todos los usuarios tendrán acceso sin login
3. Se usará un usuario por defecto

## Integración con el Sistema Principal

### Store Redux

Los módulos Engineer se han integrado con el store principal de Redux:

- **engineerCart**: Carrito de compras del módulo Engineer
- **engineerUser**: Usuario del módulo Engineer
- Sincronización automática con el usuario principal del sistema

### Rutas

Las rutas están protegidas por el Layout principal:
- Acceso desde el menú lateral
- Ubicadas debajo de "User Management"
- Navegación integrada con React Router

### Middleware

El carrito de Engineer se persiste automáticamente en `localStorage` con el key `engineerCart`.

## Uso

### Navegación

Los módulos aparecen en el menú lateral después de "User Management":

1. Engineer Catalog
2. Engineer Borrow Requests
3. Engineer Purchase Requests
4. Engineer Transfer Requests
5. My Engineer Inventory
6. Engineer Complete History

### Desarrollo

Para modificar los módulos:

```bash
# Directorio de módulos
cd src/components/features/enginner

# Componentes de páginas
cd components/pages

# Store y estado
cd store/slices

# Servicios y API
cd services
```

## Notas Importantes

1. **Store Compartido**: Los módulos Engineer comparten el store principal pero mantienen su propio estado en slices separados
2. **Tokens Opcionales**: El sistema de tokens es completamente opcional y configurable
3. **Compatibilidad**: Los módulos son totalmente compatibles con el sistema existente
4. **Sincronización**: El usuario principal se sincroniza automáticamente con el usuario Engineer

## Troubleshooting

### Si los módulos no cargan:

1. Verificar que las importaciones en `App.tsx` sean correctas
2. Revisar que el store incluya `engineerCart` y `engineerUser`
3. Verificar que las rutas estén correctamente definidas

### Si el sistema de tokens no funciona:

1. Verificar `USE_AUTH_TOKENS` en `constants.ts`
2. Revisar que `authService.ts` esté configurado correctamente
3. Verificar tokens en localStorage/sessionStorage

### Si el carrito no persiste:

1. Verificar middleware en `store.ts`
2. Revisar localStorage con key `engineerCart`
3. Verificar que los reducers estén correctamente conectados
