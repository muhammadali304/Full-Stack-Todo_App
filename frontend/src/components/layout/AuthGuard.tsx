'use client';

// AuthGuard component - Protect routes from unauthenticated access
// Redirects unauthenticated users to login page

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard component
 *
 * Wraps protected pages to enforce authentication
 * Redirects unauthenticated users to /login
 * Shows loading state while checking authentication
 *
 * Usage:
 * ```tsx
 * <AuthGuard>
 *   <ProtectedPageContent />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        fontSize: '1.125rem',
        color: '#6b7280'
      }}>
        <div>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            color: 'var(--color-primary)',
            letterSpacing: '0.05em',
            textAlign: 'center'
          }}>
            TODO APP
          </p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return <>{children}</>;
}
