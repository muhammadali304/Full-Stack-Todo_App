/**
 * Chat Authentication Middleware
 *
 * Provides authentication functionality for chat components using existing JWT handling.
 * This middleware ensures that all chat operations are properly authenticated.
 */

import { isAuthenticated } from '../lib/api';

/**
 * Get authentication header with JWT token from localStorage
 */
function getAuthHeader(): Record<string, string> {
  if (typeof window === 'undefined') {
    return {};
  }

  const token = localStorage.getItem('auth_token');
  if (token) {
    return {
      'Authorization': `Bearer ${token}`
    };
  }
  return {};
}

/**
 * Check if user is authenticated for chat operations
 * @returns boolean indicating if user is authenticated
 */
export function isChatAuthenticated(): boolean {
  return isAuthenticated();
}

/**
 * Get authentication headers for chat API requests
 * @returns Record containing authorization header with JWT token
 */
export function getChatAuthHeaders(): Record<string, string> {
  return getAuthHeader();
}

/**
 * Validate and get current user ID for chat operations
 * @returns user ID string or null if not authenticated
 */
export function getCurrentUserIdForChat(): string | null {
  if (!isChatAuthenticated()) {
    return null;
  }

  const user = localStorage.getItem('user');
  if (!user) {
    return null;
  }

  try {
    const userData = JSON.parse(user);
    return userData.id || null;
  } catch {
    return null;
  }
}

/**
 * Middleware function to validate chat request authentication
 * @param userId - The user ID making the request
 * @returns Promise resolving to true if authorized, false otherwise
 */
export async function validateChatAuth(userId: string): Promise<boolean> {
  if (!userId) {
    return false;
  }

  const currentUser = getCurrentUserIdForChat();
  return currentUser === userId;
}

/**
 * Get authentication context for chat operations
 * @returns Object containing auth status, user ID, and headers
 */
export function getChatAuthContext() {
  return {
    isAuthenticated: isChatAuthenticated(),
    userId: getCurrentUserIdForChat(),
    headers: getChatAuthHeaders()
  };
}

/**
 * Check if JWT token is valid and not expired for chat operations
 * @returns boolean indicating if token is valid
 */
export function isChatTokenValid(): boolean {
  if (!isChatAuthenticated()) {
    return false;
  }

  const token = localStorage.getItem('auth_token');
  if (!token) {
    return false;
  }

  try {
    // Decode JWT to check expiration
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const decoded = JSON.parse(jsonPayload);

    // Check if token is expired
    if (decoded.exp) {
      const expirationTime = decoded.exp * 1000;
      return Date.now() < expirationTime;
    }

    return true;
  } catch {
    return false;
  }
}