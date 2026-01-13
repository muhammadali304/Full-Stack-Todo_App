'use client';

// Home page - Redirect logic based on authentication status
// Authenticated users → /todos
// Unauthenticated users → /login

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function HomePage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for loading to complete
    if (loading) {
      return;
    }

    // Redirect based on authentication status
    if (isAuthenticated) {
      router.push('/todos');
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Show loading state while checking authentication
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
        <p>Loading...</p>
      </div>
    </div>
  );
}
