// Better Auth configuration for JWT authentication
// This file configures Better Auth for frontend authentication state management

/**
 * Better Auth configuration
 *
 * Note: Better Auth is primarily used for authentication state management.
 * The actual JWT token handling is done via the backend API.
 */
export const authConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001',
  endpoints: {
    login: '/api/auth/login',
    register: '/api/auth/register',
    logout: '/api/auth/logout',
    me: '/api/auth/me',
  },
  storage: {
    // Use localStorage for token storage
    getItem: (key: string): string | null => {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    },
    setItem: (key: string, value: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
    },
    removeItem: (key: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    },
  },
  tokenKey: 'auth_token',
  userKey: 'user',
};

/**
 * Decode JWT token to extract user information and expiration
 *
 * @param token - JWT token string
 * @returns Decoded token payload or null if invalid
 */
export function decodeJWT(token: string): any | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check if JWT token is expired
 *
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = decoded.exp * 1000;
  return Date.now() >= expirationTime;
}

/**
 * Get token expiration time in milliseconds
 *
 * @param token - JWT token string
 * @returns Expiration timestamp in milliseconds or null if invalid
 */
export function getTokenExpiration(token: string): number | null {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000;
}
