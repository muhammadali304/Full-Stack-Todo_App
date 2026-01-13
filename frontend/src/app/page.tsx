'use client';

// Home page - Landing page accessible to everyone
// Shows landing page for all users (authenticated and unauthenticated)

import { LandingPage } from '@/components/landing/LandingPage';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { loading } = useAuth();

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
        <div style={{ textAlign: 'center' }}>
          <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
          <p style={{
            fontSize: '1.75rem',
            fontWeight: 700,
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

  // Show landing page for everyone
  return <LandingPage />;
}
