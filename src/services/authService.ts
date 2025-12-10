import { API_URL } from '../url';

export interface AzureUser {
  email: string;
  name: string;
  objectId: string;
}

export interface BackendUser {
  userId: number;
  email: string;
  role: 'administrator' | 'user' | 'purchasing' | 'auditor' | 'manager';
}

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
 * This can be implemented later when backend has a user sync endpoint
 */
export async function syncUserWithBackend(
  accessToken: string,
  azureUser: AzureUser
): Promise<BackendUser> {
  // TODO: Implement backend endpoint to sync/create user
  // For now, return a mock response
  console.log('Syncing user with backend:', azureUser);

  // This would call something like:
  // POST /api/auth/sync-user
  // with the Azure user info and token

  return {
    userId: 1,
    email: azureUser.email,
    role: 'user', // Default role, backend should determine this
  };
}
