import { API_URL } from '../url';

export interface AzureUser {
  email: string;
  name: string;
  objectId: string;
  employeeId?: string;
}

export interface BackendUser {
  id: number;
  name: string;
  email: string;
  employeeId?: string;
  role: number;
  roleName: string;
  authType: number;
  departmentId?: number;
  departmentName?: string;
  department?: string;
  warehouseId?: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AzureLoginRequest {
  azureToken: string;
  userInfo: {
    objectId: string;
    email: string;
    name: string;
    employeeId?: string;
  };
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  user: BackendUser;
}

export const authService = {
  /**
   * Login local con email y contraseña
   */
  async loginLocal(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión');
    }

    return response.json();
  },

  /**
   * Registro de nuevo usuario
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al registrar usuario');
    }

    return response.json();
  },

  /**
   * Login con Azure AD
   */
  async loginWithAzure(data: AzureLoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/azure-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al iniciar sesión con Azure');
    }

    return response.json();
  },

  /**
   * Obtener información del usuario actual
   */
  async getCurrentUser(token: string): Promise<BackendUser> {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Error al obtener información del usuario');
    }

    return response.json();
  },

  /**
   * Guardar token en localStorage
   */
  saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  },

  // Guardar datos del usuario
  saveUser(user: BackendUser): void {
    localStorage.setItem('auth_user', JSON.stringify(user));
  },

  // Get User Data 
  getUser(): BackendUser | null {
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  // Limpiar auth
  removeUser(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  /**
   * Obtener token de localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  /**
   * Eliminar token de localStorage
   */
  removeToken(): void {
    localStorage.removeItem('auth_token');
  },

  /**
   * Verificar si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

/**
 * Test backend authentication endpoints
 */
export async function testPublicEndpoint(): Promise<any> {
  const response = await fetch(`${API_URL}/authtest/public`);
  if (!response.ok) {
    throw new Error('Public endpoint test failed');
  }
  return response.json();
}

/**
 * Test protected endpoint with Azure AD token
 */
export async function testProtectedEndpoint(accessToken: string): Promise<any> {
  const response = await fetch(`${API_URL}/authtest/protected`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Protected endpoint test failed');
  }

  return response.json();
}

/**
 * Create or get user from backend based on Azure AD authentication
 */
export async function syncUserWithBackend(
  accessToken: string,
  azureUser: AzureUser
): Promise<BackendUser> {
  const response = await authService.loginWithAzure({
    azureToken: accessToken,
    userInfo: {
      objectId: azureUser.objectId,
      email: azureUser.email,
      name: azureUser.name,
      employeeId: azureUser.employeeId,
    },
  });

  // Guardar token
  authService.saveToken(response.token);

  return response.user;
}
