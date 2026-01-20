'use client';

// Landing page component - Modern homepage for unauthenticated users
// Features hero section, features showcase, and CTAs

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { MobileMenu } from '@/components/layout/MobileMenu';

/**
 * LandingPage component
 *
 * Features:
 * - Hero section with compelling headline
 * - Features showcase with icons
 * - Call-to-action buttons
 * - Theme toggle support
 * - Responsive design
 * - Modern animations
 */
export function LandingPage() {
  const { theme } = useTheme();
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Navigation */}
      <nav
        style={{
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
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
              // Logged-in user: Show username and logout
              <>
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
                  <button className="btn btn-secondary">
                    Log In
                  </button>
                </Link>
                <Link href="/register">
                  <button className="btn btn-primary">
                    Sign Up
                  </button>
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
      </nav>

      {/* Hero Section */}
      <section
        style={{
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          textAlign: 'center',
          background: `linear-gradient(135deg, ${theme === 'dark' ? '#1f2937' : '#f9fafb'} 0%, ${theme === 'dark' ? '#111827' : '#ffffff'} 100%)`,
        }}
      >
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Hero badge */}
          <div
            style={{
              display: 'inline-block',
              padding: 'var(--spacing-xs) var(--spacing-lg)',
              backgroundColor: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              borderRadius: 'var(--radius-xl)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            ✨ Modern Task Management
          </div>

          {/* Hero headline */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--color-text)',
            }}
          >
            Organize Your Life,{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              One Task at a Time
            </span>
          </h1>

          {/* Hero description */}
          <p
            style={{
              fontSize: 'var(--font-size-xl)',
              color: 'var(--color-text-secondary)',
              marginBottom: 'var(--spacing-2xl)',
              lineHeight: 1.6,
            }}
          >
            A beautiful, intuitive task manager that helps you stay productive and focused.
            Track your tasks, set priorities, and achieve your goals effortlessly.
          </p>

          {/* Hero CTAs */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            {isAuthenticated ? (
              // Logged-in user: Show "Manage Tasks" button
              <Link href="/todos">
                <button
                  className="btn btn-primary"
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-2xl)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                  }}
                >
                  Manage Tasks →
                </button>
              </Link>
            ) : (
              // Not logged in: Show "Get Started" and "Log In" buttons
              <>
                <Link href="/register">
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-2xl)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 600,
                    }}
                  >
                    Get Started Free
                  </button>
                </Link>
                <Link href="/login">
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-2xl)',
                      fontSize: 'var(--font-size-lg)',
                      fontWeight: 600,
                    }}
                  >
                    Log In
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          backgroundColor: 'var(--color-background-secondary)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-2xl)' }}>
            <h2
              style={{
                fontSize: 'clamp(2rem, 4vw, 3rem)',
                fontWeight: 700,
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-text)',
              }}
            >
              Everything You Need to Stay Organized
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                maxWidth: '600px',
                margin: '0 auto',
              }}
            >
              Powerful features designed to help you manage tasks efficiently and boost your productivity.
            </p>
          </div>

          {/* Features grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 'var(--spacing-xl)',
            }}
          >
            {/* Feature 1 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 11l3 3L22 4" />
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Task Management
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Create, edit, and organize your tasks with ease. Mark tasks as complete and track your progress.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Secure & Private
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Your data is encrypted and secure. Each user has their own private workspace with full data isolation.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Dark Mode
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Beautiful dark and light themes that adapt to your preference. Easy on the eyes, day or night.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3h7v7H3z" />
                  <path d="M14 3h7v7h-7z" />
                  <path d="M14 14h7v7h-7z" />
                  <path d="M3 14h7v7H3z" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Smart Filters
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Filter tasks by status - view all, active, or completed tasks. Stay focused on what matters most.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Responsive Design
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Works seamlessly on desktop, tablet, and mobile. Manage your tasks anywhere, anytime.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                transition: 'transform var(--transition-fast), box-shadow var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-lg)',
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Real-time Updates
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Instant synchronization across all your devices. Your tasks are always up to date.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          textAlign: 'center',
          backgroundColor: 'var(--color-background)',
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          {isAuthenticated ? (
            // Logged-in user: Show different message
            <>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Ready to Manage Your Tasks?
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-2xl)',
                  lineHeight: 1.6,
                }}
              >
                Access your personal task dashboard and stay on top of your productivity goals.
              </p>
              <Link href="/todos">
                <button
                  className="btn btn-primary"
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-2xl)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                  }}
                >
                  Go to My Tasks →
                </button>
              </Link>
            </>
          ) : (
            // Not logged in: Show sign up CTA
            <>
              <h2
                style={{
                  fontSize: 'clamp(2rem, 4vw, 3rem)',
                  fontWeight: 700,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Ready to Get Organized?
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-xl)',
                  color: 'var(--color-text-secondary)',
                  marginBottom: 'var(--spacing-2xl)',
                  lineHeight: 1.6,
                }}
              >
                Join thousands of users who are already managing their tasks more efficiently.
                Start your journey to better productivity today.
              </p>
              <Link href="/register">
                <button
                  className="btn btn-primary"
                  style={{
                    padding: 'var(--spacing-md) var(--spacing-2xl)',
                    fontSize: 'var(--font-size-lg)',
                    fontWeight: 600,
                  }}
                >
                  Get Started Free →
                </button>
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: 'var(--spacing-xl) var(--spacing-md)',
          backgroundColor: 'var(--color-background-secondary)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--spacing-lg)' }}>
            {/* Logo */}
            <div style={{ flex: '0 0 auto' }}>
              <img
                src="/favicon.ico"
                alt="Todo App Logo"
                width="128"
                height="128"
                style={{ verticalAlign: 'middle' }}
              />
            </div>

            {/* About */}
            <div style={{ flex: '0 0 auto' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                About Us
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                A simple and powerful task management tool.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ flex: '0 0 auto' }}>
              <h3
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 600,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--spacing-sm)',
                }}
              >
                Quick Links
              </h3>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xs)' }}>
                <a
                  href="/todos"
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  Manage Tasks
                </a>
                <a
                  href="/about"
                  style={{
                    color: 'var(--color-text-secondary)',
                    textDecoration: 'none',
                    fontSize: 'var(--font-size-sm)',
                    transition: 'color var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-text-secondary)';
                  }}
                >
                  About
                </a>
              </nav>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ borderTop: '1px solid var(--color-border)', marginTop: 'var(--spacing-lg)', paddingTop: 'var(--spacing-md)', textAlign: 'center', width: '100%' }}>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
              © 2026 Todo App. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

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
    </div>
  );
}
