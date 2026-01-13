// API client utility for backend communication
// Handles JWT token injection, 401 handling, and 5-second timeout

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

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
 * Generic API request function with automatic token injection and error handling
 *
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with typed response data
 *
 * Features:
 * - Automatic JWT token injection from localStorage
 * - 5-second timeout (per spec requirement FR-007)
 * - Automatic 401 handling (clear token, redirect to login)
 * - Handles 204 No Content responses
 * - Standardized error handling
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    // Create abort controller for 5-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
      signal: controller.signal,
    });

    // Clear timeout if request completes
    clearTimeout(timeoutId);

    // Handle 401 Unauthorized - clear token and redirect to login
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      throw new Error('Authentication required');
    }

    // Handle 204 No Content (e.g., DELETE responses)
    if (response.status === 204) {
      return undefined as T;
    }

    // Parse JSON response
    const data = await response.json();

    // Handle error responses (4xx, 5xx)
    if (!response.ok) {
      throw new Error(data.detail || `Request failed with status ${response.status}`);
    }

    return data as T;
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout - please try again');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new Error('Network error - please check your connection');
    }

    // Re-throw other errors
    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred');
  }
}

/**
 * Helper function to check if user is authenticated
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('user');

  return !!(token && user);
}

/**
 * Helper function to get current user from localStorage
 */
export function getCurrentUser(): any | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const userStr = localStorage.getItem('user');
  if (!userStr) {
    return null;
  }

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Helper function to clear authentication data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem('auth_token');
  localStorage.removeItem('user');
}
