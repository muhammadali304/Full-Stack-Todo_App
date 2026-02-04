'use client';

// About page - Information about the Todo App
// Provides app overview, features, technology stack, and team information

import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';

export default function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)' }}>
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section
        style={{
          padding: 'var(--spacing-2xl) var(--spacing-md)',
          textAlign: 'center',
          backgroundColor: 'var(--color-background-secondary)',
        }}
      >
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: 700,
              marginBottom: 'var(--spacing-md)',
              color: 'var(--color-text)',
            }}
          >
            About Todo App
          </h1>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.6,
            }}
          >
            A modern, full-stack task management application built with cutting-edge technologies
            to help you stay organized and productive.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div
            style={{
              padding: 'var(--spacing-2xl)',
              backgroundColor: 'var(--color-background-secondary)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--font-size-2xl)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-lg)',
                color: 'var(--color-text)',
              }}
            >
              Our Mission
            </h2>
            <p
              style={{
                fontSize: 'var(--font-size-lg)',
                color: 'var(--color-text-secondary)',
                lineHeight: 1.8,
                maxWidth: '800px',
                margin: '0 auto',
              }}
            >
              We believe that staying organized shouldn&apos;t be complicated. Our mission is to provide
              a simple, intuitive, and powerful task management solution that helps individuals and teams
              achieve their goals without the clutter and complexity of traditional productivity tools.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-xl)',
              color: 'var(--color-text)',
              textAlign: 'center',
            }}
          >
            What Makes Us Different
          </h2>

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
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
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
                  <path d="M12 2L2 7l10 5 10-5-10-5z" />
                  <path d="M2 17l10 5 10-5" />
                  <path d="M2 12l10 5 10-5" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Modern Architecture
              </h3>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Built with Next.js 16+ and FastAPI, leveraging the latest web technologies for optimal performance
                and developer experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
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
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Secure & Private
              </h3>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Your data is protected with JWT-based authentication and encrypted storage. Each user&apos;s tasks
                are completely isolated and private.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              style={{
                padding: 'var(--spacing-xl)',
                backgroundColor: 'var(--color-background)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-primary-light)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 'var(--spacing-md)',
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
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-sm)',
                  color: 'var(--color-text)',
                }}
              >
                Serverless Database
              </h3>
              <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                Powered by Neon Serverless PostgreSQL for instant scaling, automatic backups, and zero
                database maintenance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <div className="container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-xl)',
              color: 'var(--color-text)',
              textAlign: 'center',
            }}
          >
            Technology Stack
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: 'var(--spacing-lg)',
            }}
          >
            {/* Frontend */}
            <div
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--color-primary)',
                }}
              >
                Frontend
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Next.js 16+ (App Router)
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • React 18+
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • TypeScript
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • CSS Variables (Theming)
                </li>
              </ul>
            </div>

            {/* Backend */}
            <div
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--color-primary)',
                }}
              >
                Backend
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Python FastAPI
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • SQLModel ORM
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Pydantic Validation
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • JWT Authentication
                </li>
              </ul>
            </div>

            {/* Database */}
            <div
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--color-primary)',
                }}
              >
                Database
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Neon Serverless PostgreSQL
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Automatic Scaling
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Instant Backups
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Branch Database Support
                </li>
              </ul>
            </div>

            {/* Development */}
            <div
              style={{
                padding: 'var(--spacing-lg)',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <h3
                style={{
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-md)',
                  color: 'var(--color-primary)',
                }}
              >
                Development
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Claude Code
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Spec-Kit Plus
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Git Version Control
                </li>
                <li style={{ padding: 'var(--spacing-xs) 0', color: 'var(--color-text-secondary)' }}>
                  • Docker Containerization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)', backgroundColor: 'var(--color-background-secondary)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <h2
            style={{
              fontSize: 'var(--font-size-2xl)',
              fontWeight: 600,
              marginBottom: 'var(--spacing-lg)',
              color: 'var(--color-text)',
            }}
          >
            Built with Modern Tools
          </h2>
          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              lineHeight: 1.8,
              marginBottom: 'var(--spacing-xl)',
            }}
          >
            This application was developed using the Agentic Dev Stack workflow, combining
            specification-driven development with AI-powered code generation. The result is a
            robust, maintainable, and scalable application built following industry best practices.
          </p>

          <div
            style={{
              padding: 'var(--spacing-xl)',
              backgroundColor: 'var(--color-background)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--color-border)',
            }}
          >
            <h3
              style={{
                fontSize: 'var(--font-size-lg)',
                fontWeight: 600,
                marginBottom: 'var(--spacing-md)',
                color: 'var(--color-text)',
              }}
            >
              Development Approach
            </h3>
            <p style={{ fontSize: 'var(--font-size-base)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              We follow a systematic approach: Write specification → Generate architectural plan →
              Break into testable tasks → Implement via specialized agents. This ensures every feature
              is well-designed, properly tested, and maintainable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: 'var(--spacing-2xl) var(--spacing-md)' }}>
        <div className="container" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          {isAuthenticated ? (
            // Logged-in user: Show different message and Manage Tasks button
            <>
              <h2
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Ready to Manage Your Tasks?
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--spacing-xl)',
                }}
              >
                Access your personal task dashboard and stay on top of your productivity goals.
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/todos">
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-xl)',
                      fontSize: 'var(--font-size-lg)',
                    }}
                  >
                    Manage Tasks →
                  </button>
                </Link>
                {/* <Link href="/contact">
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-xl)',
                      fontSize: 'var(--font-size-lg)',
                    }}
                  >
                    Contact Us
                  </button>
                </Link> */}
              </div>
            </>
          ) : (
            // Not logged in: Show sign up CTA
            <>
              <h2
                style={{
                  fontSize: 'var(--font-size-2xl)',
                  fontWeight: 600,
                  marginBottom: 'var(--spacing-lg)',
                  color: 'var(--color-text)',
                }}
              >
                Ready to Get Started?
              </h2>
              <p
                style={{
                  fontSize: 'var(--font-size-lg)',
                  color: 'var(--color-text-secondary)',
                  lineHeight: 1.6,
                  marginBottom: 'var(--spacing-xl)',
                }}
              >
                Join thousands of users who are already managing their tasks more efficiently with Todo App.
              </p>
              <div style={{ display: 'flex', gap: 'var(--spacing-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href="/register">
                  <button
                    className="btn btn-primary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-xl)',
                      fontSize: 'var(--font-size-lg)',
                    }}
                  >
                    Sign Up Free
                  </button>
                </Link>
                {/* <Link href="/contact">
                  <button
                    className="btn btn-secondary"
                    style={{
                      padding: 'var(--spacing-md) var(--spacing-xl)',
                      fontSize: 'var(--font-size-lg)',
                    }}
                  >
                    Contact Us
                  </button>
                </Link> */}
              </div>
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
    </div>
  );
}
