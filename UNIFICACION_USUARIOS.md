# 🔍 ANÁLISIS VISUAL: 3 FUENTES DE USUARIO

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN ACTUAL                              │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                         REDUX STORE (global)                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  state.auth.user = {                                                   │
│    id: 'amx0142',          ← [FUENTE 1: authSlice]                    │
│    name: 'John Smith',                                                 │
│    email: 'john@company.com',                                          │
│    department: 'IT-Bolivia',                                           │
│    role: 'administrator'                                               │
│  }                                                                       │
│                                                                          │
│  state.engineerUser.currentUser = {                                    │
│    id: 'amx0142',          ← [FUENTE 2: userSlice]                    │
│    name: 'John Smith',                                                 │
│    email: 'john@company.com',                                          │
│    department: 'IT-Bolivia'                                            │
│  }                                                                       │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                    localStorage/sessionStorage                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  [FUENTE 3: authService]                                               │
│  ('auth_token', 'user_data')                                           │
│  ← Usado SOLO si USE_AUTH_TOKENS = true                               │
│  ← Actualmente: USE_AUTH_TOKENS = false (NO se usa)                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 FLUJOS DE DATOS ACTUALES

### Flujo 1: MyInventoryTransfer → Cargar Inventario

```
┌─────────────────────────────────────────────────────────┐
│ MyInventoryTransfer.tsx                                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ import { selectCurrentUser } from                       │
│   '../enginner/store/selectors'                        │
│                                                         │
│ const currentUser = useAppSelector(selectCurrentUser)   │
│                     ↓                                   │
│  selectCurrentUser(state) →                            │
│    state.engineerUser.currentUser                      │
│                     ↓                                   │
│  currentUser.id = 'amx0142'                            │
│                     ↓                                   │
│  const response = await getInventoryEngineer(          │
│    currentUser.id    // 'amx0142'                      │
│  )                                                      │
└─────────────────────────────────────────────────────────┘
```

### Flujo 2: useBorrowRequests → Cargar Préstamos

```
┌─────────────────────────────────────────────────────────┐
│ useBorrowRequests.ts                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ const currentUser = useAppSelector(selectCurrentUser)   │
│                     ↓                                   │
│  selectCurrentUser(state) →                            │
│    state.engineerUser.currentUser                      │
│                     ↓                                   │
│  currentUser.id = 'amx0142'                            │
│                     ↓                                   │
│  const requests = await getBorrowRequests(             │
│    currentUser.id    // 'amx0142'                      │
│  )                                                      │
└─────────────────────────────────────────────────────────┘
```

### Flujo 3: Login → Actualizar Usuario

```
┌─────────────────────────────────────────────────────────┐
│ Login.tsx                                               │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ const response = await loginUser({                      │
│   email, password                                       │
│ })                                                      │
│     ↓                                                   │
│ dispatch(login({                                        │
│   user: response.user,    // De authService            │
│   token: response.token                                │
│ }))                                                     │
│     ↓                                                   │
│ userSlice.login() →                                     │
│   state.engineerUser.currentUser = response.user        │
│   state.engineerUser.isLoggedIn = true                 │
│   state.engineerUser.token = response.token             │
└─────────────────────────────────────────────────────────┘
```

---

## 📍 MAPA DE SELECTORES (PROBLEMA)

```
┌──────────────────────────────────────────────────────────────────┐
│                    selectCurrentUser duplicado                   │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OPCIÓN A: /src/store/selectors.ts (GLOBAL)                    │
│  ─────────────────────────────────────────────────────────────  │
│  export const selectCurrentUser = (state: RootState) =>         │
│    state.auth.user                                             │
│                                                                  │
│  ✅ Usado por: App.tsx, PurchaseRequests.tsx (mal)             │
│                                                                  │
│  ─────────────────────────────────────────────────────────────  │
│                                                                  │
│  OPCIÓN B: /src/components/features/enginner/                 │
│           store/selectors.ts (ENGINEER MODULE)                 │
│  ─────────────────────────────────────────────────────────────  │
│  export const selectCurrentUser = (state: RootState) =>         │
│    state.engineerUser.currentUser                              │
│                                                                  │
│  ✅ Usado por: MyInventoryTransfer.tsx,                        │
│               useBorrowRequests.ts,                             │
│               BorrowRequests.tsx                                │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 🎯 USO POR COMPONENTE

### ✅ COMPONENTES QUE USAN ENGINEER USER (CORRECTO)

```
┌─────────────────────────────────────────┐
│  MyInventoryTransfer.tsx ✅              │
├─────────────────────────────────────────┤
│ Import:                                 │
│  selectCurrentUser from                 │
│  '../enginner/store/selectors'          │
│                                         │
│ Uso:                                    │
│  currentUser.id → getInventoryEngineer()│
│                                         │
│ ID: 'amx0142' ✅                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  useBorrowRequests.ts ✅                 │
├─────────────────────────────────────────┤
│ Import:                                 │
│  selectCurrentUser from                 │
│  '../../enginner/store/selectors'       │
│                                         │
│ Uso:                                    │
│  currentUser.id → getBorrowRequests()   │
│                                         │
│ ID: 'amx0142' ✅                       │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  BorrowRequests.tsx ✅                   │
├─────────────────────────────────────────┤
│ Import:                                 │
│  selectCurrentUser from                 │
│  '../enginner/store/selectors'          │
│                                         │
│ Uso:                                    │
│  currentUser → Pasa como prop a         │
│  LoanForm                               │
│                                         │
│ ID: 'amx0142' ✅                       │
└─────────────────────────────────────────┘
```

### ⚠️ COMPONENTES CON IMPORTACIÓN INCORRECTA

```
┌──────────────────────────────────────────────────┐
│  PurchaseRequests.tsx ⚠️ IMPORTACIÓN INCORRECTA   │
├──────────────────────────────────────────────────┤
│ Import (GLOBAL):                                 │
│  selectCurrentUser from '../../../../store'       │
│                      (está mal ↑)                │
│                                                  │
│ Debería ser:                                     │
│  selectCurrentUser from                          │
│  '../enginner/store/selectors'                   │
│                                                  │
│ Usa:                                             │
│  state.auth.user (de authSlice)                 │
│  en lugar de                                     │
│  state.engineerUser.currentUser                  │
│                                                  │
│ ID Obtenido: 'amx0142' ✅ (por coincidencia)   │
└──────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────┐
│  App.tsx ⚠️ USA AUTHSLICE (GLOBAL)              │
├──────────────────────────────────────────────────┤
│ Código:                                          │
│  const user = useAppSelector(                    │
│    (state) => state.auth.user                    │
│  )                                               │
│                                                  │
│ Usa:                                             │
│  state.auth.user directamente                    │
│                                                  │
│ Para:                                            │
│  Verificaciones globales de usuario              │
│                                                  │
│ ID: 'amx0142' ✅                                │
└──────────────────────────────────────────────────┘
```

---

## 🔄 TABLA COMPARATIVA

| Aspecto | authSlice | userSlice | authService |
|---------|-----------|-----------|-------------|
| **Ubicación** | /src/store/slices/ | /src/components/enginner/store/slices/ | /src/components/enginner/services/ |
| **Almacenamiento** | Redux (RAM) | Redux (RAM) | localStorage/sessionStorage |
| **Usuario inicial** | 'amx0142' hardcoded | 'amx0142' hardcoded | Retorna desde API |
| **Actualizable** | setUser action | login action | loginUser function |
| **Conectado a authService** | ❌ NO | ✅ SÍ (si USE_AUTH_TOKENS=true) | ✅ Auto-conectado |
| **Persiste entre sesiones** | ❌ NO | ✅ SÍ (via authService) | ✅ SÍ |
| **Usada en Inventory** | ❌ NO | ✅ SÍ (MyInventoryTransfer) | ✅ SÍ (indirectamente) |
| **Usada en Borrowing** | ❌ NO | ✅ SÍ (useBorrowRequests) | ✅ SÍ (indirectamente) |
| **Usada en Login** | ❌ NO | ✅ SÍ (Login.tsx) | ✅ SÍ (authService.loginUser) |
| **Selector duplicado** | ✅ SÍ existe | ✅ SÍ existe | N/A |
| **Estado de loggin** | isAuthenticated | isLoggedIn | token + USER_KEY |

---

## 🚨 PROBLEMAS IDENTIFICADOS

### 1. ❌ Dos `selectCurrentUser` idénticos

```typescript
// Problema: mismo nombre, diferente estado
/src/store/selectors.ts                 // → state.auth.user
/src/components/enginner/store/selectors.ts  // → state.engineerUser.currentUser
```

**Riesgo**: Importar del lugar equivocado sin saberlo

### 2. ❌ authSlice NO se sincroniza con userSlice

```typescript
// Cambiar authSlice.user NO actualiza userSlice.currentUser
dispatch(setUser(newUser))  // Solo actualiza state.auth.user
                            // userSlice sigue igual
```

### 3. ❌ authService desconectada de authSlice

```typescript
// authService puede guardar/cargar data, pero authSlice no la usa
loginUser() → saveUserData()  // Guarda en localStorage
                              // Pero authSlice.user sigue igual
```

### 4. ⚠️ userSlice lee de authService SOLO si USE_AUTH_TOKENS=true

```typescript
// Si USE_AUTH_TOKENS = false (actual):
const getInitialState = () => {
  // Ignora authService completamente
  // Usa usuario hardcodeado
  return { currentUser: { id: 'amx0142', ... } }
}
```

### 5. ❌ PurchaseRequests importa selectCurrentUser de lugar equivocado

```typescript
// ACTUAL (INCORRECTO):
import { selectCurrentUser } from '../../../../store';
// Retorna state.auth.user

// DEBERÍA SER:
import { selectCurrentUser } from '../enginner/store/selectors';
// Retorna state.engineerUser.currentUser
```

---

## 🎯 COMPONENTES A REVISAR

```
┌──────────────────────────────────────────────────────────────────┐
│  ANTES DE UNIFICAR, VERIFICA ESTOS COMPONENTES                 │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ MyInventoryTransfer.tsx       → selectCurrentUser (engineer)│
│  ✅ useBorrowRequests.ts          → selectCurrentUser (engineer)│
│  ✅ BorrowRequests.tsx            → selectCurrentUser (engineer)│
│  ⚠️  PurchaseRequests.tsx         → selectCurrentUser (GLOBAL)  │
│  ⚠️  App.tsx                      → state.auth.user (GLOBAL)    │
│  ✅ Login.tsx                     → userSlice.login()           │
│  ✅ PrivateRoute.tsx              → state.engineerUser.isLoggedIn
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💾 RESUMEN: QUIÉN USA QUÉ ACTUALMENTE

```
authSlice (state.auth.user)
├── App.tsx
└── PurchaseRequests.tsx (por error de import)

userSlice (state.engineerUser.currentUser)
├── MyInventoryTransfer.tsx ← ACTUAL
├── useBorrowRequests.ts ← ACTUAL
├── BorrowRequests.tsx ← ACTUAL
├── Login.tsx ← Actualiza al loguearse
└── PrivateRoute.tsx ← Verifica isLoggedIn

authService
└── Login.tsx → loginUser() → dispatch(userSlice.login)
    └── Guarda en localStorage (si USE_AUTH_TOKENS=true)
```


# 📋 ANÁLISIS MINUCIOSO: 3 FUENTES DE USUARIO

## 🎯 Resumen Ejecutivo

Hay **3 fuentes paralelas de usuario** en la aplicación:

1. **`authSlice`** (Global Store - `/src/store/slices/authSlice.ts`)
2. **`userSlice`** (Engineer Module - `/src/components/features/enginner/store/slices/userSlice.ts`)
3. **`authService`** (Service Layer - `/src/components/features/enginner/services/authService.ts`)

---

## 📍 UBICACIÓN DE LAS 3 FUENTES

### 1️⃣ **authSlice** 
📁 `src/store/slices/authSlice.ts`

```typescript
const initialState: AuthState = {
  user: {
    id: 'amx0142',
    name: 'John Smith',
    role: 'administrator',
    email: 'john@company.com',
    department: 'IT-Bolivia'
  },
  isAuthenticated: true,
};
```

**Almacenamiento**: Redux Store Global (`state.auth.user`)
**Selector**: `selectCurrentUser` en `/src/store/selectors.ts`
**Cambio de estado**: `setUser`, `logout`, `updateUserRole`

---

### 2️⃣ **userSlice** 
📁 `src/components/features/enginner/store/slices/userSlice.ts`

```typescript
// Estado inicial condicional basado en USE_AUTH_TOKENS
const getInitialState = (): UserState => {
  if (USE_AUTH_TOKENS) {
    const savedUser = getUserData();  // Desde authService
    const isAuth = isAuthenticated(); // Desde authService
    return {
      currentUser: savedUser || null,
      isLoggedIn: isAuth,
      token: null
    };
  } else {
    return {
      currentUser: {
        id: 'amx0142',
        name: 'John Smith',
        email: 'john@company.com',
        department: 'IT-Bolivia'
      },
      isLoggedIn: true,
      token: null
    };
  }
};
```

**Almacenamiento**: Redux Store Global (`state.engineerUser.currentUser`)
**Selector**: `selectCurrentUser` en `/src/components/features/enginner/store/selectors.ts`
**Cambio de estado**: `setUser`, `updateUser`, `login`, `logout`
**Particularidad**: Lee datos de `authService` si `USE_AUTH_TOKENS = true`

---

### 3️⃣ **authService** 
📁 `src/components/features/enginner/services/authService.ts`

```typescript
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simula una llamada API
  return {
    token: `mock_jwt_token_${Date.now()}`,
    user: {
      id: 'amx0142',
      name: 'John Smith',
      email: credentials.email,
      department: 'IT-Bolivia'
    }
  };
};

export const saveUserData = (user: AuthResponse['user']): void => {
  if (USE_AUTH_TOKENS) {
    getStorage().setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUserData = (): AuthResponse['user'] | null => {
  if (!USE_AUTH_TOKENS) return null;
  const data = getStorage().getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};
```

**Almacenamiento**: localStorage/sessionStorage (si `USE_AUTH_TOKENS = true`)
**Funciones principales**:
- `loginUser()`: Simula login, retorna user + token
- `saveUserData()`: Guarda en storage
- `getUserData()`: Lee desde storage
- `isAuthenticated()`: Verifica si existe token válido

---

## 🔍 DÓNDE SE USA CADA UNO

### ✅ **authSlice** (`state.auth.user`) - USO GLOBAL

**Dónde se importa**:
- `src/store/selectors.ts` → `selectCurrentUser = state.auth.user`
- `src/App.tsx` → `const user = useAppSelector((state) => state.auth.user)`

**Dónde se usa**:
1. **App.tsx (Main App)**
   - Obtiene usuario principal: `state.auth.user`
   - Verificación de permisos globales

2. **Layout.tsx** 
   - `useAppDispatch` y `logout` para cerrar sesión global
   - Manejo de estado general de la app

**Características**:
- ✅ Usuario por defecto: `id: 'amx0142'`
- ✅ Disponible siempre (inicializado)
- ✅ Usuario administrativo (role: 'administrator')
- ❌ **NO se conecta a authService**
- ❌ **NO usa tokens**
- ❌ **SU ESTADO NO CAMBIA** (estático)

---

### ✅ **userSlice** (`state.engineerUser.currentUser`) - USO EN ENGINEER MODULE

**Selector**: `/src/components/features/enginner/store/selectors.ts`
```typescript
export const selectCurrentUser = (state: RootState) => state.engineerUser.currentUser;
```

**Dónde se importa y usa**:

1. **MyInventoryTransfer.tsx** ✅ ACTIVA
   ```typescript
   import { selectCurrentUser } from '../enginner/store/selectors';
   const currentUser = useAppSelector(selectCurrentUser);
   
   // Usa currentUser.id para cargar inventario
   const response = await getInventoryEngineer(currentUser.id);
   ```
   - **Propósito**: Cargar inventario por engineer ID
   - **ID usado**: `'amx0142'`

2. **useBorrowRequests.ts** ✅ ACTIVA
   ```typescript
   import { selectCurrentUser } from '../../enginner/store/selectors';
   const currentUser = useAppSelector(selectCurrentUser);
   
   // Usa currentUser.id en getBorrowRequests
   const requestsData = await getBorrowRequests(currentUser.id);
   ```
   - **Propósito**: Obtener borrow requests del ingeniero
   - **ID usado**: `'amx0142'`

3. **BorrowRequests.tsx** ✅ ACTIVA (prop)
   ```typescript
   const currentUser = useAppSelector(selectCurrentUser);
   // Pasa como prop a LoanForm
   <LoanForm currentUser={currentUser} ... />
   ```

4. **PurchaseRequests.tsx** ✅ ACTIVA
   ```typescript
   import { selectCurrentUser } from '../../../../store'; // ⚠️ WRONG IMPORT
   const currentUser = useAppSelector(selectCurrentUser);
   // Muestra usuario en UI pero no lo usa para API calls
   ```

5. **PrivateRoute.tsx** ✅ ACTIVA
   ```typescript
   const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
   // Verifica si está logueado
   ```

6. **Login.tsx** ✅ ACTIVA
   ```typescript
   import { login } from '../store/slices/userSlice';
   dispatch(login({ user: response.user, token: response.token }));
   ```
   - **Propósito**: Actualizar usuario después de login exitoso
   - **Llama a**: `authService.loginUser()`

**Características**:
- ✅ Usuario por defecto: `id: 'amx0142'`
- ✅ **CONECTADO A authService** si `USE_AUTH_TOKENS = true`
- ✅ Lee `getUserData()` de authService
- ✅ Maneja token en memoria (`token: null` actualmente)
- ✅ **ACTIVAMENTE USADO** en MyInventoryTransfer y useBorrowRequests

---

### ✅ **authService** - USO EN LOGIN

**Funciones y dónde se usan**:

1. **`loginUser()`** 
   - **Llamado desde**: `Login.tsx`
   ```typescript
   const response = await loginUser({ email, password });
   dispatch(login({ user: response.user, token: response.token }));
   ```
   - **Retorna**: `{ token, user }`

2. **`saveUserData()`**
   - **Llamado desde**: `authService.loginUser()` internamente
   - **Guarda en**: localStorage/sessionStorage (si `USE_AUTH_TOKENS = true`)
   - **Actualmente**: `USE_AUTH_TOKENS = false` → NO GUARDA

3. **`getUserData()`**
   - **Llamado desde**: `userSlice.ts` en `getInitialState()`
   - **Lee desde**: localStorage/sessionStorage
   - **Retorna**: Usuario guardado o `null`

4. **`isAuthenticated()`**
   - **Llamado desde**: `userSlice.ts` en `getInitialState()`
   - **Verifica**: Si existe token válido

5. **`getAuthHeaders()`**
   - **Documentado pero NO USADO**
   - **Propósito**: Agregar Authorization header a API calls
   - **Podría usarse en**: `myInventoryService.ts`, `borrowService.ts`

---

## ⚠️ CONFIGURACIÓN CRÍTICA

### **USE_AUTH_TOKENS** 
📁 `src/components/features/enginner/constants.ts`

```typescript
export const USE_AUTH_TOKENS = false; // ← ESTÁ EN FALSE
```

**Comportamiento según valor**:

| Parámetro | `USE_AUTH_TOKENS = false` | `USE_AUTH_TOKENS = true` |
|-----------|---------------------------|--------------------------|
| Login página | ❌ Accesible pero ignorado | ✅ Requerido |
| Almacenamiento | ❌ NO guarda tokens | ✅ Guarda en localStorage/sessionStorage |
| authService | ❌ Ignora datos guardados | ✅ Lee datos guardados |
| userSlice | ✅ Usa usuario hardcodeado | ✅ Lee desde authService |
| PrivateRoute | ⚠️ Siempre permite acceso | ✅ Bloquea sin login |

**Valor actual**: `false` → **Sistema funciona sin autenticación real**

---

## 🔄 FLUJOS DE DATOS COMPARADOS

### **Flujo ACTUAL (USE_AUTH_TOKENS = false)**

```
App Start
  ↓
authSlice initialState → state.auth.user = { id: 'amx0142', ... }
  ↓
userSlice initialState → getInitialState()
  ├─ USE_AUTH_TOKENS = false
  └─ state.engineerUser.currentUser = { id: 'amx0142', ... }
  ↓
authService → Ignorado (USE_AUTH_TOKENS = false)
  ↓
Componentes usan: selectCurrentUser → state.engineerUser.currentUser
  ↓
MyInventoryTransfer.tsx → currentUser.id = 'amx0142'
useBorrowRequests.ts → currentUser.id = 'amx0142'
```

### **Flujo SI fuera USE_AUTH_TOKENS = true**

```
App Start
  ↓
authService.loginUser() → Simula login
  ├─ saveUserData() → localStorage.setItem('user_data', {...})
  └─ Retorna user + token
  ↓
Login.tsx → dispatch(login({ user, token }))
  ↓
userSlice → getInitialState()
  ├─ USE_AUTH_TOKENS = true
  ├─ getUserData() → Lee desde localStorage
  ├─ isAuthenticated() → Verifica token
  └─ state.engineerUser.currentUser = userData desde localStorage
  ↓
Componentes usan: selectCurrentUser → state.engineerUser.currentUser
```

---

## 🎯 RESUMEN DE DEPENDENCIAS

### **authSlice DEPENDE DE**:
- ❌ Nada (Estado estático, no cambia)
- ❌ No se conecta a authService
- ❌ No lee de localStorage

### **userSlice DEPENDE DE**:
- ✅ **authService** (si `USE_AUTH_TOKENS = true`)
  - Lee: `getUserData()` 
  - Lee: `isAuthenticated()`
- ✅ **User type** de `/src/components/features/enginner/types/index`
- ✅ **USE_AUTH_TOKENS constant**

### **authService DEPENDE DE**:
- ✅ localStorage/sessionStorage (si `USE_AUTH_TOKENS = true`)
- ✅ Constantes: `USE_AUTH_TOKENS`, `TOKEN_STORAGE_TYPE`, `TOKEN_KEY`, `USER_KEY`
- ❌ No depende de Redux

---

## 💡 ANÁLISIS POR TIPO DE USUARIO

### **Usuario 'amx0142' - ACTUALMENTE IGUAL EN LOS 3**

| Fuente | ID | Nombre | Email | Department |
|--------|-------|---------|----------|-----------|
| **authSlice** | 'amx0142' | 'John Smith' | 'john@company.com' | 'IT-Bolivia' |
| **userSlice** | 'amx0142' | 'John Smith' | 'john@company.com' | 'IT-Bolivia' |
| **authService** | 'amx0142' | 'John Smith' | credentials.email | 'IT-Bolivia' |

**Conclusión**: Los 3 tienen el MISMO usuario hardcodeado

---

## 🔗 IMPORTACIONES INCONSISTENTES

### **Problema de selectCurrentUser duplicado**

```typescript
// En /src/store/selectors.ts (GLOBAL)
export const selectCurrentUser = (state: RootState) => state.auth.user;

// En /src/components/features/enginner/store/selectors.ts (ENGINEER)
export const selectCurrentUser = (state: RootState) => state.engineerUser.currentUser;
```

**Consecuencia**: 
- Si importas de `/src/store/selectors` → Obtienes `state.auth.user`
- Si importas de `../enginner/store/selectors` → Obtienes `state.engineerUser.currentUser`

**Ejemplo conflictivo en PurchaseRequests.tsx**:
```typescript
import { selectCurrentUser } from '../../../../store'; // ← GLOBAL (authSlice)
const currentUser = useAppSelector(selectCurrentUser); // Usa state.auth.user
```

Pero DEBERÍA usar Engineer module.

---

## 📊 MAPA DE COMPONENTES

### Componentes que USAN `selectCurrentUser` del Engineer Module:

1. ✅ **MyInventoryTransfer.tsx** - Load inventory by engineer ID
2. ✅ **useBorrowRequests.ts** - Load borrow requests by engineer ID  
3. ✅ **BorrowRequests.tsx** - Gets from Redux, passes to LoanForm
4. ⚠️ **PurchaseRequests.tsx** - Uses WRONG import (from global store)
5. ✅ **PrivateRoute.tsx** - Checks isLoggedIn status
6. ✅ **Login.tsx** - Updates user after login

### Componentes que reciben `currentUser` como PROP:

1. ✅ **LoanForm.tsx** - Receives currentUser prop from BorrowRequests
2. ✅ **PurchaseForm.tsx** - Receives currentUser prop from PurchaseRequests
3. ✅ **Header.tsx** - Receives currentUser prop (engineer module)
4. ✅ **Sidebar.tsx** - Receives notifications, not user directly

---

## 🚀 OPCIONES DE UNIFICACIÓN

### **OPCIÓN 1: Usar SOLO authSlice (Global Store)**
```
✅ Pros:
- Una sola fuente de verdad
- Simple de entender
- No hay selectCurrentUser duplicado

❌ Contras:
- authService queda sin usar
- authService no conecta a Redux
- Perder capacidad de persistencia de tokens
- Perder lógica condicional de USE_AUTH_TOKENS
```

### **OPCIÓN 2: Usar SOLO userSlice (Engineer Module)**
```
✅ Pros:
- Ya está integrado en engineer module
- Tiene lógica de tokens y authService
- Ya se usa en componentes críticos (Inventory, Borrowing)
- Preparado para producción

❌ Contras:
- Engineer module como "store principal" es confuso
- App.tsx aún accede a authSlice
- PrivateRoute se conectaría al engineer module
```

### **OPCIÓN 3: Mantener ambos SINCRONIZADOS**
```
✅ Pros:
- authSlice para app global
- userSlice para engineer module
- Cada uno con su propósito

❌ Contras:
- Más complejo
- Riesgo de inconsistencia
- Código duplicado
```

---

## 📌 RECOMENDACIÓN

**La decisión depende de tu arquitectura:**

- **Si el módulo Engineer es transitorio**: Usa `authSlice` globalmente
- **Si el módulo Engineer es principal**: Usa `userSlice` como referencia y sincroniza `authSlice` solo si es necesario
- **Para máxima flexibilidad**: Mantén sincronizados pero documenta bien dónde va cada uno

**Componentes que DEBEN cambiar si unificamos**:
1. PurchaseRequests.tsx - Cambiar import de selectCurrentUser
2. MyInventoryTransfer.tsx - Posiblemente cambiar de selector
3. useBorrowRequests.ts - Posiblemente cambiar de selector
4. PrivateRoute.tsx - Cambiar fuente del isLoggedIn
5. authSlice vs userSlice - Decidir cuál descartar



# 📊 RESUMEN EJECUTIVO: 3 FUENTES DE USUARIO

## 🎯 SITUACIÓN ACTUAL

Tu aplicación tiene **3 fuentes paralelas de usuario** con el mismo ID `'amx0142'`:

```
┌─────────────────────────────────────────────────────────┐
│  FUENTE 1: authSlice                                   │
│  Ubicación: /src/store/slices/authSlice.ts             │
│  Estado: state.auth.user = { id: 'amx0142', ... }     │
│  Usado por: App.tsx, PurchaseRequests.tsx (por error)  │
│  Sincronización: ❌ NO se sincroniza con las otras     │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FUENTE 2: userSlice ⭐ RECOMENDADA                    │
│  Ubicación: /src/components/enginner/store/slices/     │
│  Estado: state.engineerUser.currentUser = { ... }     │
│  Usado por:                                             │
│    ✅ MyInventoryTransfer.tsx (cargar inventario)     │
│    ✅ useBorrowRequests.ts (cargar préstamos)         │
│    ✅ BorrowRequests.tsx (formulario de préstamo)     │
│    ✅ Login.tsx (actualizar al loguearse)             │
│  Sincronización: ✅ Lee de authService si es necesario│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  FUENTE 3: authService                                  │
│  Ubicación: /src/components/enginner/services/         │
│  Almacenamiento: localStorage/sessionStorage            │
│  Usado por: userSlice (indirectamente vía Login)       │
│  Estado: USE_AUTH_TOKENS = false (actualmente NO usa)  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔍 ANÁLISIS RÁPIDO

| Aspecto | authSlice | userSlice | authService |
|---------|-----------|-----------|-------------|
| **Está en uso** | ⚠️ Parcial | ✅ Activamente | ⚠️ Solo en login |
| **Sincronizado** | ❌ NO | ✅ SÍ (con authService) | ✅ SÍ |
| **Para producción** | ❌ NO | ✅ SÍ | ✅ SÍ |
| **Integración** | Aislado | Conectado | Conectado |
| **Componentes críticos** | ❌ Ninguno | ✅ Inventory, Borrowing | ✅ Login |

**CONCLUSIÓN**: `userSlice` es la que REALMENTE se usa en tu app.

---

## 🚨 PROBLEMAS IDENTIFICADOS

1. **selectCurrentUser duplicado**: Existe en dos lugares diferentes
   - `/src/store/selectors.ts` → Apunta a `state.auth.user`
   - `/src/components/enginner/store/selectors.ts` → Apunta a `state.engineerUser.currentUser`

2. **PurchaseRequests.tsx usa selectCurrentUser equivocado** ⚠️
   - Importa de `/src/store` (GLOBAL)
   - Debería importar de `../enginner/store/selectors`

3. **authSlice nunca se actualiza**
   - Cuando Login.tsx hace dispatch(login()), solo actualiza userSlice
   - authSlice permanece con el usuario hardcodeado inicial

4. **authService desconectada de authSlice**
   - authService puede guardar/cargar, pero authSlice no lo usa
   - Solo userSlice lo usa (condicionalmente)

---

## ✅ RECOMENDACIÓN: UNIFICAR A `userSlice`

### Por qué:

1. ✅ **Ya está en uso en componentes críticos**
   - MyInventoryTransfer → Cargar inventario
   - useBorrowRequests → Cargar préstamos
   - Estas son FUNCIONALIDADES CORE

2. ✅ **Tiene mejor arquitectura**
   - Conecta con authService
   - Maneja tokens
   - Lógica de persistencia

3. ✅ **Reduce duplicación**
   - Eliminas selectCurrentUser duplicado
   - Una sola fuente de verdad
   - Código más limpio

4. ✅ **Preparado para escala**
   - Login/logout funciona bien
   - Persiste correctamente
   - Flexible para cambios futuros

---

## 🔧 CAMBIOS NECESARIOS (3 cambios mínimos)

### 1. Arreglar import en PurchaseRequests.tsx
```typescript
// ❌ CAMBIAR DE:
import { selectCurrentUser } from '../../../../store';

// ✅ A:
import { selectCurrentUser } from '../../enginner/store/selectors';
```

### 2. Actualizar App.tsx
```typescript
// ❌ CAMBIAR DE:
const user = useAppSelector((state) => state.auth.user);

// ✅ A:
const user = useAppSelector((state) => state.engineerUser.currentUser);
```

### 3. Actualizar Layout.tsx logout
```typescript
// ❌ CAMBIAR DE:
import { logout } from '../store';

// ✅ A:
import { logout } from '../components/features/enginner/store/slices/userSlice';
```

**Con estos 3 cambios, ya está unificado.**

---

## 📋 ARCHIVOS DE ANÁLISIS CREADOS

He creado 3 documentos detallados:

1. **`ANALISIS_USUARIOS.md`** - Análisis completo de las 3 fuentes
   - Código exacto de cada fuente
   - Dónde se usa cada una
   - Flujos de datos
   - Dependencias

2. **`ANALISIS_USUARIOS_VISUAL.md`** - Análisis visual
   - Diagramas ASCII
   - Mapas de flujo
   - Tablas comparativas
   - Identificación de problemas

3. **`UNIFICACION_USUARIOS.md`** - Plan de acción
   - Pasos exactos a seguir
   - Código antes/después
   - Checklist de verificación
   - Pruebas a realizar

---

## 🎯 PRÓXIMOS PASOS (POR ORDEN)

### Paso 1: Leer los documentos (5 min)
- Abre `ANALISIS_USUARIOS.md`
- Revisa `ANALISIS_USUARIOS_VISUAL.md`

### Paso 2: Decidir la estrategia (5 min)
- ¿Quieres unificar a `userSlice`? (recomendado)
- ¿O mantener ambos sincronizados?
- ¿O usar `authSlice` globalmente?

### Paso 3: Implementar cambios (15-30 min)
- Seguir instrucciones en `UNIFICACION_USUARIOS.md`
- 3 cambios mínimos o migración completa
- Probar que todo funciona

### Paso 4: Verificar funcionamiento
- MyInventoryTransfer carga inventario ✅
- useBorrowRequests carga préstamos ✅
- Login funciona correctamente ✅
- PrivateRoute valida correctamente ✅

---

## 💡 DECISIÓN FINAL RECOMENDADA

**UNIFICAR A `userSlice` (Engineer Module)**

```
Beneficios:
✅ Una sola fuente de verdad
✅ Componentes críticos ya lo usan
✅ Mejor integración con autenticación
✅ Código más limpio y mantenible

Cambios mínimos:
✅ 3 importaciones a corregir
✅ App.tsx y PurchaseRequests.tsx
✅ Layout.tsx logout

Tiempo estimado:
⏱️ 30 minutos implementación
⏱️ 15 minutos testing
```

---

## 📞 PRÓXIMAS ACCIONES

Cuando hayas tomado una decisión, avísame y puedo:

1. ✅ Hacer los cambios automáticamente
2. ✅ Remover authSlice completamente
3. ✅ Actualizar todos los imports
4. ✅ Verificar compilación y errors
5. ✅ Crear tests para validar

**¿Quieres que proceda con la unificación a `userSlice`?**


# 🎯 RECOMENDACIONES: UNIFICAR A UNA SOLA FUENTE DE USUARIO

## 📌 DECISIÓN RECOMENDADA

Basado en el análisis, **RECOMIENDO UNIFICAR A `userSlice` (Engineer Module)** por las siguientes razones:

### ✅ Por qué `userSlice` es la mejor opción:

1. **Ya está en uso ACTIVO**:
   - MyInventoryTransfer.tsx lo usa ✅
   - useBorrowRequests.ts lo usa ✅
   - BorrowRequests.tsx lo usa ✅
   - Estos son componentes CRÍTICOS

2. **Tiene integración con authService**:
   - Conecta con login real
   - Puede persistir tokens
   - Lógica condicional de USE_AUTH_TOKENS
   - Preparado para producción

3. **Tiene mejor estructura**:
   - Separación de concerns (Engineer Module)
   - No mezcla usuario global con usuario de módulo
   - Más escalable para futuros módulos

4. **Reduce duplicación**:
   - Un único selectCurrentUser
   - Un único estado de usuario
   - Sincronización garantizada

---

## 🔧 PLAN DE UNIFICACIÓN A `userSlice`

### PASO 1: Remover selectCurrentUser de /src/store/selectors.ts

**Archivo**: `/src/store/selectors.ts`

```typescript
// ❌ REMOVER ESTA LÍNEA:
export const selectCurrentUser = (state: RootState) => state.auth.user;

// En su lugar, importar de engineer module:
// export { selectCurrentUser } from '../components/features/enginner/store/selectors';
```

### PASO 2: Actualizar App.tsx para usar userSlice

**Archivo**: `/src/App.tsx`

```typescript
// ❌ CAMBIAR DE:
import { selectCurrentUser } from './store';
const user = useAppSelector((state) => state.auth.user);

// ✅ A:
import { useAppSelector } from './store';
const user = useAppSelector((state) => state.engineerUser.currentUser);

// O mejor aún, importar el selector:
import { selectCurrentUser } from './components/features/enginner/store/selectors';
const user = useAppSelector(selectCurrentUser);
```

### PASO 3: Actualizar PurchaseRequests.tsx (Fix import)

**Archivo**: `/src/components/features/requests/Purchase/PurchaseRequests.tsx`

```typescript
// ❌ CAMBIAR DE:
import { selectCurrentUser } from '../../../../store';

// ✅ A:
import { selectCurrentUser } from '../../enginner/store/selectors';
```

### PASO 4: Desactivar authSlice (Opción A) o mantenerlo sin usar (Opción B)

#### OPCIÓN A: Remover authSlice completamente

**Requiere cambios**:
1. Remover importación de authSlice en `src/store/store.ts`
2. Remover acciones de authSlice de exports en `src/store/index.ts`
3. Remover selectCurrentUser, selectIsAuthenticated de `src/store/selectors.ts`

```typescript
// /src/store/store.ts
// ❌ Remover:
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    // ❌ Remover: auth: authReducer,
    engineerUser: engineerUserReducer,  // ✅ ÚNICO usuario
    // ... rest
  }
});
```

#### OPCIÓN B: Mantener authSlice pero NO usarlo

```typescript
// Dejar el código pero NO importar selectCurrentUser
// Mantenerlo para compatibilidad backwards
// Documentar que está deprecated
```

**RECOMENDACIÓN**: OPCIÓN A (Remover completamente)

### PASO 5: Mantener authService como capa de login

**Archivo**: `/src/components/features/enginner/services/authService.ts`

```typescript
// ✅ Mantener igual
// authService sigue siendo la fuente de validación de credenciales
// userSlice lo usa via dispatch(login(response))
```

### PASO 6: Actualizar Layout.tsx para usar acciones de userSlice

**Archivo**: `/src/components/Layout.tsx`

```typescript
// ❌ CAMBIAR DE:
import { logout } from './store';
dispatch(logout());  // Logout global

// ✅ A:
import { logout } from './components/features/enginner/store/slices/userSlice';
import { useAppDispatch } from './store';
const dispatch = useAppDispatch();
dispatch(logout());  // Logout del user slice
```

---

## 📋 LISTA DE CAMBIOS ESPECÍFICOS

### Cambio 1: App.tsx

```typescript
// LÍNEA 1-20: IMPORTS
// ❌ Remover:
// import { selectCurrentUser } from './store';

// ✅ Agregar:
import { selectCurrentUser } from './components/features/enginner/store/selectors';

// LÍNEA ~160: AppRoutes function
// ❌ CAMBIAR DE:
const user = useAppSelector((state) => state.auth.user);

// ✅ A:
const user = useAppSelector(selectCurrentUser);
```

### Cambio 2: PurchaseRequests.tsx

```typescript
// LÍNEA 15: IMPORTS
// ❌ CAMBIAR DE:
import { selectCurrentUser } from '../../../../store';

// ✅ A:
import { selectCurrentUser } from '../../enginner/store/selectors';
```

### Cambio 3: Layout.tsx

```typescript
// LÍNEA 5-10: IMPORTS
// ❌ CAMBIAR DE:
import { useAppDispatch, useAppSelector, logout } from '../store';

// ✅ A:
import { useAppDispatch, useAppSelector } from '../store';
import { logout } from '../components/features/enginner/store/slices/userSlice';
```

### Cambio 4: src/store/selectors.ts

```typescript
// ❌ REMOVER ESTAS LÍNEAS:
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;

// ✅ OPCIONAL: Re-exportar desde engineer module:
export { selectCurrentUser } from '../components/features/enginner/store/selectors';
```

### Cambio 5: src/store/index.ts

```typescript
// ❌ REMOVER:
export { setUser, logout, updateUserRole } from './slices/authSlice';
export type { UserRole } from './slices/authSlice';

// ✅ OPCIONAL: Re-exportar desde engineer module:
export { setUser, updateUser, login, logout } from '../components/features/enginner/store/slices/userSlice';
```

### Cambio 6: src/store/store.ts

```typescript
// ❌ OPCIÓN A (RECOMENDADA): Remover authSlice
// LÍNEA 1-5:
// ❌ Remover: import authReducer from './slices/authSlice';

// LÍNEA ~40: configureStore
// ❌ CAMBIAR DE:
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    engineerUser: engineerUserReducer,
    // ...
  }
});

// ✅ A:
export const store = configureStore({
  reducer: {
    ui: uiReducer,
    engineerUser: engineerUserReducer,  // ✅ ÚNICO usuario
    // ...
  }
});
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Después de hacer los cambios, verifica:

- [ ] Compilación sin errores TypeScript
- [ ] `state.auth.user` NO se usa en ningún lado (grep search)
- [ ] Todos los imports de `selectCurrentUser` vienen de `../enginner/store/selectors`
- [ ] `MyInventoryTransfer.tsx` sigue cargando inventario correctamente
- [ ] `useBorrowRequests.ts` sigue cargando préstamos correctamente
- [ ] `Login.tsx` sigue logueando correctamente (dispatch userSlice.login)
- [ ] `PrivateRoute.tsx` sigue validando isLoggedIn
- [ ] `Layout.tsx` logout sigue funcionando
- [ ] No hay `state.auth` en Redux DevTools (si usas)
- [ ] `currentUser.id = 'amx0142'` en todos los componentes que lo usan

---

## 🔄 PRUEBAS DESPUÉS DE CAMBIOS

### Prueba 1: Cargar aplicación
```
✅ Usuario 'amx0142' debe estar disponible en todos los componentes
```

### Prueba 2: MyInventoryTransfer
```
✅ Debe cargar inventario con currentUser.id = 'amx0142'
✅ Consola debe mostrar: Fetching inventory for engineer: amx0142
```

### Prueba 3: BorrowRequests / useBorrowRequests
```
✅ Debe cargar préstamos con currentUser.id = 'amx0142'
✅ Consola debe mostrar: GET /borrow-requests?requesterId=amx0142
```

### Prueba 4: Login (si USE_AUTH_TOKENS = true)
```
✅ authService.loginUser debe retornar usuario
✅ userSlice.login debe actualizar state.engineerUser.currentUser
✅ Redireccionar a dashboard
```

### Prueba 5: PrivateRoute
```
✅ Si USE_AUTH_TOKENS = false: Acceso total
✅ Si USE_AUTH_TOKENS = true: Requiere login
```

---

## 🚨 RIESGOS Y MITIGACIÓN

### Riesgo 1: App.tsx no pueda acceder a usuario

**Mitigación**: Cambiar a `state.engineerUser.currentUser`

### Riesgo 2: Otros módulos necesiten usuario global

**Mitigación**: Importar de `../components/features/enginner/store/selectors`

### Riesgo 3: authService quede sin usar

**Mitigación**: authService sigue siendo usada por Login.tsx

### Riesgo 4: Perder capacidad de múltiples usuarios

**Mitigación**: userSlice está diseñado para múltiples usuarios (login/logout)

---

## 📝 DOCUMENTO DE CAMBIOS

Cuando hagas los cambios, documenta:

```markdown
# Unificación de Usuario a userSlice

## Cambios realizados
- Removido selectCurrentUser de /src/store/selectors.ts
- Actualizado App.tsx para usar engineerUser
- Actualizado PurchaseRequests.tsx para usar selector correcto
- Removido authSlice de store.ts
- Actualizado Layout.tsx para usar logout de userSlice

## Razones
- UNA sola fuente de verdad para el usuario
- userSlice ya estaba en uso en componentes críticos
- Mejor integración con authService
- Menos duplicación de código

## Funcionalidad verificada
- ✅ Cargar inventario con ID del usuario
- ✅ Cargar préstamos con ID del usuario
- ✅ Login/Logout funciona correctamente
- ✅ Rutas privadas funcionan si USE_AUTH_TOKENS=true
```

---

## ⚡ IMPLEMENTACIÓN RÁPIDA

Si quieres hacerlo rápido, los cambios mínimos son:

```typescript
// 1. PurchaseRequests.tsx - FIX IMPORT
import { selectCurrentUser } from '../../enginner/store/selectors';

// 2. App.tsx - USE ENGINEER USER
const user = useAppSelector((state) => state.engineerUser.currentUser);

// 3. Layout.tsx - USE ENGINEER LOGOUT
import { logout } from '../components/features/enginner/store/slices/userSlice';
```

**Con solo esos 3 cambios, tienes unificado a userSlice**.

Luego puedes remover authSlice cuando tengas tiempo.

