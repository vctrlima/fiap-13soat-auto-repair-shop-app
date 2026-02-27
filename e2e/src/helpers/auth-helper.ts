import axios from 'axios';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  email: string;
  password: string;
}

const ADMIN_EMAIL = 'admin@email.com';
const ADMIN_PASSWORD = '@Abc1234';

/**
 * Authenticates a user and returns tokens
 */
export async function loginUser(email: string, password: string): Promise<AuthTokens> {
  const response = await axios.post('/auth', { email, password });
  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
  };
}

/**
 * Gets admin authentication tokens
 */
export async function getAdminTokens(): Promise<AuthTokens> {
  return loginUser(ADMIN_EMAIL, ADMIN_PASSWORD);
}

/**
 * Registers a new user using admin credentials and returns the new user's tokens
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  role: 'ADMIN' | 'DEFAULT' = 'DEFAULT'
): Promise<AuthTokens> {
  const adminTokens = await getAdminTokens();
  await axios.post(
    '/users',
    { email, password, name, role },
    { headers: { Authorization: `Bearer ${adminTokens.accessToken}` } }
  );
  return loginUser(email, password);
}

/**
 * Creates an authenticated axios instance with bearer token
 */
export function createAuthenticatedClient(accessToken: string) {
  return axios.create({
    baseURL: axios.defaults.baseURL,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

/**
 * Refreshes access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await axios.post('/auth/refresh', { refreshToken });
  return response.data.accessToken;
}

/**
 * Creates a test user with authentication
 */
export async function createTestUser(): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const timestamp = Date.now();
  const user: AuthUser = {
    email: `test.user.${timestamp}@example.com`,
    password: 'Test@1234',
  };

  const tokens = await registerUser(user.email, user.password, `Test User ${timestamp}`, 'DEFAULT');

  return { user, tokens };
}
