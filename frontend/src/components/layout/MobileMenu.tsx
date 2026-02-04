'use client';

// MobileMenu component - Responsive hamburger menu for mobile devices
// Shows navigation links and authentication buttons in a slide-out menu

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface MobileMenuProps {
  onLogout?: () => void;
}

/**
 * MobileMenu component
 *
 * Features:
 * - Hamburger icon button
 * - Slide-out menu from right
 * - Backdrop overlay
 * - Responsive (mobile only)
 * - Authentication-aware menu items
 * - Smooth animations
 *
 * Usage:
 * ```tsx
 * <MobileMenu onLogout={handleLogout} />
 * ```
 */
export function MobileMenu({ onLogout }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleNavigation = (path: string) => {
    closeMenu();
    router.push(path);
  };

  const handleLogout = () => {
    closeMenu();
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile when menu is closed */}
      {!isOpen && (
        <button
          onClick={toggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          style={{
            display: 'none',
            flexDirection: 'column',
            justifyContent: 'space-around',
            width: '28px',
            height: '28px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            zIndex: 1001,
          }}
          className="mobile-menu-button"
        >
          <span
            style={{
              width: '28px',
              height: '3px',
              backgroundColor: 'var(--color-text)',
              borderRadius: '2px',
            }}
          />
          <span
            style={{
              width: '28px',
              height: '3px',
              backgroundColor: 'var(--color-text)',
              borderRadius: '2px',
            }}
          />
          <span
            style={{
              width: '28px',
              height: '3px',
              backgroundColor: 'var(--color-text)',
              borderRadius: '2px',
            }}
          />
        </button>
      )}

      {/* Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
            animation: 'fadeIn 0.3s ease',
          }}
        />
      )}

      {/* Slide-out Menu */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-100%',
          width: '280px',
          maxWidth: '80vw',
          height: '100vh',
          backgroundColor: 'var(--color-background)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 1000,
          transition: 'right 0.3s ease',
          overflowY: 'auto',
          padding: 'var(--spacing-xl)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--spacing-lg)',
        }}
      >
        {/* Close button */}
        <button
          onClick={closeMenu}
          aria-label="Close menu"
          style={{
            alignSelf: 'flex-end',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background-secondary)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            marginBottom: 'var(--spacing-md)',
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-text)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* User info (if logged in) */}
        {isAuthenticated && user && (
          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              marginBottom: 'var(--spacing-md)',
            }}
          >
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-text-secondary)',
                marginBottom: 'var(--spacing-xs)',
              }}
            >
              Logged in as
            </p>
            <p
              style={{
                fontSize: 'var(--font-size-base)',
                fontWeight: 600,
                color: 'var(--color-text)',
              }}
            >
              {user.username}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
          {/* Home */}
          <button
            onClick={() => handleNavigation('/')}
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🏠 Home
          </button>

          {/* Manage Tasks - Only show if logged in */}
          {isAuthenticated && (
            <button
              onClick={() => handleNavigation('/todos')}
              style={{
                padding: 'var(--spacing-md)',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                textAlign: 'left',
                fontSize: 'var(--font-size-base)',
                fontWeight: 500,
                color: 'var(--color-text)',
                cursor: 'pointer',
                transition: 'background-color var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              📋 Manage Tasks
            </button>
          )}

          {/* Contact Us */}
          {/* <button
            onClick={() => handleNavigation('/contact')}
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✉️ Contact Us
          </button> */}

          {/* About */}
          <button
            onClick={() => handleNavigation('/about')}
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              textAlign: 'left',
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              cursor: 'pointer',
              transition: 'background-color var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-background-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ℹ️ About
          </button>
        </nav>

        {/* Divider */}
        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--color-border)',
            margin: 'var(--spacing-md) 0',
          }}
        />

        {/* Authentication Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
          {isAuthenticated ? (
            // Logout button
            <button
              onClick={handleLogout}
              className="btn btn-secondary"
              style={{ width: '100%' }}
            >
              Logout
            </button>
          ) : (
            // Login & Sign Up buttons
            <>
              <button
                onClick={() => handleNavigation('/login')}
                className="btn btn-secondary"
                style={{ width: '100%' }}
              >
                Log In
              </button>
              <button
                onClick={() => handleNavigation('/register')}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* CSS for mobile visibility */}
      <style jsx>{`
        @media (max-width: 767px) {
          .mobile-menu-button {
            display: flex !important;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
