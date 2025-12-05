/**
 * gestiona todo lo relacionado con el estado de autenticación del usuario
 */
import { USE_AUTH_TOKENS, TOKEN_STORAGE_TYPE, TOKEN_KEY, USER_KEY } from '../constants';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    department: string;
  };
}

/**
 * Obtiene el storage apropiado según configuración
 */
const getStorage = (): Storage => {
  return TOKEN_STORAGE_TYPE === 'localStorage' ? localStorage : sessionStorage;
};

/**
 * Guarda el token de autenticación
 */
export const saveToken = (token: string): void => {
  if (USE_AUTH_TOKENS) {
    getStorage().setItem(TOKEN_KEY, token);
  }
};

/**
 * Obtiene el token de autenticación
 */
export const getToken = (): string | null => {
  if (!USE_AUTH_TOKENS) return null;
  return getStorage().getItem(TOKEN_KEY);
};

/**
 * Elimina el token de autenticación
 */
export const removeToken = (): void => {
  if (USE_AUTH_TOKENS) {
    getStorage().removeItem(TOKEN_KEY);
    getStorage().removeItem(USER_KEY);
  }
};

/**
 * Guarda los datos del usuario
 */
export const saveUserData = (user: AuthResponse['user']): void => {
  if (USE_AUTH_TOKENS) {
    getStorage().setItem(USER_KEY, JSON.stringify(user));
  }
};

/**
 * Obtiene los datos del usuario almacenados
 */
export const getUserData = (): AuthResponse['user'] | null => {
  if (!USE_AUTH_TOKENS) return null;
  const data = getStorage().getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

/**
 * Verifica si existe un token válido
 */
export const isAuthenticated = (): boolean => {
  if (!USE_AUTH_TOKENS) return true; // Siempre autenticado si USE_AUTH_TOKENS = false
  return !!getToken();
};

/**
 * Simula una llamada de login al API
 * En producción, esto debería hacer una llamada real al backend
 */
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulación de llamada API
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Validación simple para demo
      if (credentials.email && credentials.password.length >= 4) {
        const response: AuthResponse = {
          token: `mock_jwt_token_${Date.now()}`,
          user: {
            id: 'amx0142',
            name: 'John Smith',
            email: credentials.email,
            department: 'IT-Bolivia'
          }
        };
        
        if (USE_AUTH_TOKENS) {
          saveToken(response.token);
          saveUserData(response.user);
        }
        
        resolve(response);
      } else {
        reject(new Error('Credenciales inválidas'));
      }
    }, 800); // Simula delay de red
  });
};

/**
 * Cierra la sesión del usuario
 */
export const logoutUser = (): void => {
  removeToken();
};
/**
 * Obtiene los headers para las llamadas API
 * Incluye el token si USE_AUTH_TOKENS es true
 */
export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (USE_AUTH_TOKENS) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

/**
 * Ejemplo de cómo usar getAuthHeaders en una llamada API real
 * 
 * @example
 * ```typescript
 * const fetchInventoryItems = async () => {
 *   const response = await fetch('https://api.tuservidor.com/inventory', {
 *     method: 'GET',
 *     headers: getAuthHeaders()
 *   });
 *   return response.json();
 * };
 * 
 * const createInventoryItem = async (item: any) => {
 *   const response = await fetch('https://api.tuservidor.com/inventory', {
 *     method: 'POST',
 *     headers: getAuthHeaders(),
 *     body: JSON.stringify(item)
 *   });
 *   return response.json();
 * };
 * ```
 */
