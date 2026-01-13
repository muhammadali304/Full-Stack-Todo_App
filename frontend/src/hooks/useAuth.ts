'use client';

// useAuth hook - Consume AuthContext
// Provides easy access to authentication state and methods

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import type { AuthContextValue } from '@/lib/types';

/**
 * useAuth hook
 *
 * Custom hook to access authentication context
 *
 * @returns AuthContextValue with user, token, loading, and auth methods
 * @throws Error if used outside AuthProvider
 *
 * Usage:
 * ```tsx
 * const { user, isAuthenticated, login, logout } = useAuth();
 * ```
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
