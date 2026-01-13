'use client';

// AuthContext - Global authentication state management
// Provides user state, token state, and authentication methods

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { apiRequest } from '@/lib/api';
import { isTokenExpired } from '@/lib/auth';
import type {
  User,
  AuthContextValue,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  LogoutResponse,
} from '@/lib/types';

// Create context with undefined default (will be provided by AuthProvider)
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 *
 * Manages global authentication state including:
 * - Current user
 * - JWT token
 * - Loading state
 * - Login/logout/register methods
 *
 * Automatically loads user from localStorage on mount
 * Checks token expiration and clears if expired
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (storedToken && storedUser) {
          // Check if token is expired
          if (isTokenExpired(storedToken)) {
            // Token expired, clear storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
          } else {
            // Token valid, restore session
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        // Clear invalid data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  /**
   * Login function
   *
   * @param email - User's email
   * @param password - User's password
   * @throws Error if login fails
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiRequest<LoginResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      // Store token and user in localStorage
      localStorage.setItem('auth_token', response.access_token);
      localStorage.setItem('user', JSON.stringify(response.user));

      // Update state
      setToken(response.access_token);
      setUser(response.user);
    } catch (error) {
      // Re-throw error for component to handle
      throw error;
    }
  };

  /**
   * Register function
   *
   * @param data - Registration data (email, username, password)
   * @throws Error if registration fails
   */
  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      await apiRequest<RegisterResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      // Registration successful - user needs to login
      // Don't automatically log in, redirect to login page
    } catch (error) {
      // Re-throw error for component to handle
      throw error;
    }
  };

  /**
   * Logout function
   *
   * Calls backend logout endpoint and clears local state
   */
  const logout = async (): Promise<void> => {
    try {
      // Call backend logout endpoint (for logging purposes)
      await apiRequest<LogoutResponse>('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');

      // Clear state
      setToken(null);
      setUser(null);
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    login,
    logout,
    register,
    isAuthenticated: !!(user && token),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
