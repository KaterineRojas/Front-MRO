# Azure AD Login - Cambios Implementados

## Resumen
Se ha completado la integración completa de Azure AD Authentication con soporte HTTPS, obtención de perfil de usuario y foto de perfil.

## Cambios Realizados

### 1. Configuración HTTPS
**Archivos modificados:**
- `vite.config.ts`
- `package.json`

**Cambios:**
- ✅ Instalado `@vitejs/plugin-basic-ssl` para soporte de certificados HTTPS locales
- ✅ Configurado Vite para servir en HTTPS en puerto 3000
- ✅ El servidor de desarrollo ahora corre en `https://localhost:3000`

### 2. Configuración de Azure AD
**Archivo modificado:** `src/authConfig.ts`

**Cambios:**
- ✅ Actualizado `redirectUri` de HTTP a HTTPS: `https://localhost:3000`
- ✅ Agregado `postLogoutRedirectUri`: `https://localhost:3000/login`
- ✅ Agregados scopes adicionales:
  - `User.Read` - Leer perfil del usuario
  - `User.ReadBasic.All` - Leer información básica de usuarios

### 3. Estado de Usuario (Redux)
**Archivo modificado:** `src/store/slices/authSlice.ts`

**Cambios:**
- ✅ Agregados campos adicionales al interface `User`:
  - `photoUrl?: string` - URL de la foto del usuario
  - `jobTitle?: string` - Título del puesto
  - `mobilePhone?: string` - Teléfono móvil
  - `officeLocation?: string` - Ubicación de oficina
- ✅ Agregada acción `setUserPhoto` para actualizar la foto del usuario

### 4. Servicio de Microsoft Graph
**Archivo creado:** `src/services/graphService.ts`

**Funcionalidades:**
- ✅ `getUserProfile()` - Obtiene el perfil completo del usuario desde Microsoft Graph
- ✅ `getUserPhoto()` - Descarga la foto del usuario y retorna un blob URL
- ✅ `getUserProfileWithPhoto()` - Obtiene perfil y foto en paralelo

**Datos obtenidos:**
- Display Name
- Email / User Principal Name
- Job Title
- Department
- Mobile Phone
- Office Location
- Photo (si existe)

### 5. Autenticación Mejorada
**Archivo modificado:** `src/App.tsx`

**Cambios:**
- ✅ Importado servicio de Graph API
- ✅ Al autenticar, se obtiene automáticamente:
  - Perfil completo del usuario desde Graph API
  - Foto de perfil del usuario
- ✅ Los datos se almacenan en Redux store
- ✅ Logs de consola para debugging

### 6. Interfaz de Usuario
**Archivo modificado:** `src/components/Layout.tsx`

**Cambios:**
- ✅ Importado componente `Avatar` de Radix UI
- ✅ Importado `useMsal` para logout
- ✅ Avatar muestra:
  - Foto del usuario (si existe)
  - Iniciales del nombre como fallback
- ✅ Información del usuario en el dropdown:
  - Foto grande (12x12)
  - Nombre completo
  - Email
  - Job Title (si existe)
  - Departamento (si existe)
- ✅ Logout mejorado:
  - Limpia estado de Redux
  - Cierra sesión en Azure AD
  - Redirige a `/login`

## Estructura Visual del Menú de Usuario

```
┌─────────────────────────────────┐
│ [Photo]  John Doe               │
│          john.doe@company.com   │
│          Software Engineer      │
│          Engineering            │
├─────────────────────────────────┤
│ 🔔 Notifications            [3] │
│ ☀️ Dark Mode                    │
├─────────────────────────────────┤
│ 🚪 Log Out                      │
└─────────────────────────────────┘
```

## Flujo de Autenticación

1. Usuario accede a `https://localhost:3000`
2. Si no autenticado → redirige a `/login`
3. Click en "Continue with Microsoft"
4. Redirige a Azure AD login
5. Después de login exitoso → redirige a `https://localhost:3000`
6. `AuthHandler` en `App.tsx`:
   - Obtiene access token
   - Obtiene perfil de Graph API
   - Obtiene foto de Graph API
   - Guarda todo en Redux
7. Usuario ve dashboard con su foto y datos

## Flujo de Logout

1. Usuario click en "Log Out"
2. Layout.tsx:
   - Limpia Redux state
   - Llama `instance.logoutRedirect()`
3. Azure AD:
   - Cierra sesión
   - Redirige a `https://localhost:3000/login`

## Permisos Requeridos en Azure AD

Asegúrate de que la aplicación en Azure AD tenga estos permisos API:

- ✅ `User.Read` (Delegated)
- ✅ `User.ReadBasic.All` (Delegated)
- ✅ Scope personalizado: `api://[client-id]/access_as_user`

## Testing

### Para probar los cambios:

1. **Iniciar servidor de desarrollo:**
   ```bash
   cd Front-MRO
   npm run dev
   ```

2. **Aceptar certificado HTTPS:**
   - El navegador mostrará advertencia de certificado autofirmado
   - Hacer click en "Avanzado" → "Continuar a localhost"

3. **Probar login:**
   - Ir a `https://localhost:3000`
   - Hacer login con cuenta de Microsoft
   - Verificar que se muestre foto y datos del usuario

4. **Probar logout:**
   - Click en el avatar del usuario
   - Click en "Log Out"
   - Verificar que redirige a `/login`

## Notas Importantes

- ⚠️ El certificado HTTPS es autofirmado (solo para desarrollo)
- ⚠️ La foto del usuario se guarda como blob URL (se pierde al refrescar)
- ⚠️ Si el usuario no tiene foto en Azure, se muestra inicial del nombre
- ✅ Todos los datos se obtienen automáticamente al login
- ✅ El logout limpia completamente la sesión de Azure AD

## Próximos Pasos (Opcional)

1. **Persistencia de foto:** Guardar blob URL en sessionStorage
2. **Certificado HTTPS:** Para producción, usar certificado válido
3. **Roles de usuario:** Obtener roles desde Azure AD o backend
4. **Refresh token:** Implementar renovación automática de token
5. **Error handling:** Mejorar manejo de errores en Graph API calls

## Archivos Modificados

- ✅ `package.json` - Agregado `@vitejs/plugin-basic-ssl`
- ✅ `vite.config.ts` - Configurado HTTPS
- ✅ `src/authConfig.ts` - Actualizado URLs y scopes
- ✅ `src/store/slices/authSlice.ts` - Agregados campos de usuario
- ✅ `src/services/graphService.ts` - **NUEVO** Servicio de Graph API
- ✅ `src/App.tsx` - Integrado Graph API
- ✅ `src/components/Layout.tsx` - UI mejorada con foto y datos

## Estado Final

✅ **COMPLETADO** - Login con Azure AD funcionando completamente
✅ **COMPLETADO** - HTTPS configurado
✅ **COMPLETADO** - Foto de usuario desde Azure
✅ **COMPLETADO** - Datos completos del usuario
✅ **COMPLETADO** - Logout con redirección correcta
✅ **COMPILACIÓN EXITOSA** - Sin errores de TypeScript
