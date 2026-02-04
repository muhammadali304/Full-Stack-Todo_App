'use client';

// Header component - Navigation and logout button
// Displays user info and provides logout functionality

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { MobileMenu } from './MobileMenu';

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
   * Handle logout - Stay on current page after logout
   */
  const handleLogout = async () => {
    try {
      await logout();
      // Don't redirect - stay on current page
    } catch (error) {
      console.error('Logout error:', error);
      // Don't redirect even if logout API call fails
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
          position: 'relative',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--spacing-lg) var(--spacing-md)',
          gap: 'var(--spacing-md)',
          flexWrap: 'wrap',
        }}
      >
        {/* Logo/Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flex: '0 0 auto' }}>
          <Link
            href="/"
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

        {/* Centered Navigation Links - Desktop only - Absolutely centered at screen center */}
        <nav className="desktop-nav-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
          <Link
            href="/"
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
            }}
          >
            Home
          </Link>
          {isAuthenticated && (
            <Link
              href="/todos"
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 500,
                color: 'var(--color-text)',
                textDecoration: 'none',
                transition: 'color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--color-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--color-text)';
              }}
            >
              Manage Tasks
            </Link>
          )}
          {/* <Link
            href="/contact"
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
            }}
          >
            Contact Us
          </Link> */}
          <Link
            href="/about"
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              textDecoration: 'none',
              transition: 'color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text)';
            }}
          >
            About
          </Link>
        </nav>

        {/* Right side - Theme toggle and user info */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-md)',
            flex: '0 0 auto',
          }}
        >
          {/* Desktop navigation - Hidden on mobile */}
          <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
            {/* Theme toggle */}
            <ThemeToggle />

            {/* User info and auth buttons */}
            {isAuthenticated && user ? (
              <>
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
              </>
            ) : (
              // Not logged in: Show login and sign up buttons
              <>
                <Link href="/login">
                  <button className="btn btn-secondary">Log In</button>
                </Link>
                <Link href="/register">
                  <button className="btn btn-primary">Sign Up</button>
                </Link>
              </>
            )}
          </div>

          {/* Theme toggle for mobile - Visible only on mobile */}
          <div className="mobile-theme-toggle">
            <ThemeToggle />
          </div>

          {/* Mobile menu - Visible only on mobile */}
          <MobileMenu onLogout={handleLogout} />
        </div>
      </div>

      {/* CSS for responsive navigation */}
      <style jsx>{`
        /* Hide desktop navigation on mobile */
        @media (max-width: 767px) {
          .desktop-nav {
            display: none !important;
          }
          .desktop-nav-center {
            display: none !important;
          }
        }

        /* Hide mobile theme toggle on desktop */
        @media (min-width: 768px) {
          .mobile-theme-toggle {
            display: none !important;
          }
        }

        /* Show mobile theme toggle only on mobile */
        @media (max-width: 767px) {
          .mobile-theme-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
