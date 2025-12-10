# Configuración HTTPS Local - Solución

## Problema
El navegador muestra "Tu conexión no es privada" y bloquea el acceso a `https://localhost:3000`

## Soluciones

### ✅ Opción 1: Aceptar Certificado (Solución Rápida)

#### Chrome/Edge:
1. Ve a `https://localhost:3000`
2. Verás: "Tu conexión no es privada"
3. Click en **"Avanzado"**
4. Click en **"Ir a localhost (no seguro)"**

#### Firefox:
1. Ve a `https://localhost:3000`
2. Click en **"Avanzado"**
3. Click en **"Aceptar el riesgo y continuar"**

---

### ✅ Opción 2: Usar mkcert (RECOMENDADO)

`mkcert` genera certificados SSL confiables para desarrollo local.

#### Paso 1: Instalar mkcert

**Windows (con Chocolatey):**
```bash
choco install mkcert
```

**Windows (sin Chocolatey):**
1. Descarga desde: https://github.com/FiloSottile/mkcert/releases
2. Descarga `mkcert-v1.4.4-windows-amd64.exe`
3. Renombra a `mkcert.exe`
4. Mueve a una carpeta en tu PATH (ej: `C:\Windows\System32`)

**Verificar instalación:**
```bash
mkcert -version
```

#### Paso 2: Instalar Certificate Authority Local

Abre PowerShell/CMD como **Administrador**:
```bash
mkcert -install
```

Esto instalará una CA local en tu sistema y navegadores.

#### Paso 3: Generar Certificados para localhost

En la carpeta del proyecto:
```bash
cd C:\dev\Front-MRO
mkdir .cert
mkcert -key-file .cert/localhost-key.pem -cert-file .cert/localhost-cert.pem localhost 127.0.0.1 ::1
```

Esto genera:
- `.cert/localhost-key.pem` - Private key
- `.cert/localhost-cert.pem` - Certificate

#### Paso 4: Configurar Vite

Actualiza `vite.config.ts` para usar los certificados:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // ... resto de configuración
  server: {
    port: 3000,
    open: true,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, '.cert/localhost-key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, '.cert/localhost-cert.pem')),
    },
  },
});
```

#### Paso 5: Agregar a .gitignore

```bash
# Certificados SSL (no commitear)
.cert/
*.pem
```

---

### ✅ Opción 3: Volver a HTTP Temporalmente

Si solo necesitas probar sin HTTPS:

**authConfig.ts:**
```typescript
export const msalConfig = {
  auth: {
    clientId: "273a815d-6cd5-43aa-958a-5c6685a1d13b",
    authority: "https://login.microsoftonline.com/8f137cf4-3c51-4772-9858-75e8fbd0ae28",
    redirectUri: "http://localhost:3000",  // ⬅️ Cambiar a HTTP
    postLogoutRedirectUri: "http://localhost:3000/login",  // ⬅️ HTTP
  },
  // ...
};
```

**vite.config.ts:**
```typescript
export default defineConfig({
  plugins: [react()], // ⬅️ Quitar basicSsl()
  // ...
  server: {
    port: 3000,
    open: true,
    // https: true,  // ⬅️ Comentar o eliminar
  },
});
```

**⚠️ IMPORTANTE:** También debes cambiar la configuración en Azure Portal:
- Redirect URIs → Agregar `http://localhost:3000`
- Front-channel logout URL → Cambiar a `http://localhost:3000/login`

---

## Recomendación

- **Desarrollo rápido:** Opción 1 (aceptar certificado)
- **Desarrollo profesional:** Opción 2 (mkcert)
- **Testing sin Azure:** Opción 3 (HTTP)

Para producción, siempre usa HTTPS con certificados válidos.
