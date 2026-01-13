'use client';

// Header component - Navigation and logout button
// Displays user info and provides logout functionality

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';

/**
 * Header component
 *
 * Features:
 * - Application title/logo
 * - Current user display
 * - Logout button
 * - Responsive layout
 * - Accessible navigation
 */
export function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect even if logout API call fails
      router.push('/login');
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-lg) var(--spacing-md)',
          gap: 'var(--spacing-md)',
          flexWrap: 'wrap',
        }}
      >
        {/* Logo/Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Link
            href="/todos"
            style={{
              fontSize: 'var(--font-size-xl)',
              fontWeight: 700,
              color: 'var(--color-primary)',
              textDecoration: 'none',
            }}
          >
            Todo App
          </Link>
        </div>

        {/* User info and logout */}
        {isAuthenticated && user && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--spacing-md)',
              flexWrap: 'wrap',
            }}
          >
            {/* Theme toggle */}
            <ThemeToggle />

            {/* User info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
              }}
            >
              <span
                style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                Logged in as
              </span>
              <span
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                }}
              >
                {user.username}
              </span>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              aria-label="Logout"
              style={{
                padding: 'var(--spacing-sm) var(--spacing-lg)',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
