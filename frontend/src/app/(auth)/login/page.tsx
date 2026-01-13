'use client';

// Login page - User login interface

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '@/components/auth/LoginForm';
import type { LoginRequest } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (data: LoginRequest) => {
    await login(data.email, data.password);
  };

  const handleSuccess = () => {
    // Redirect to todos page after successful login
    router.push('/todos');
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: 'var(--spacing-lg)',
      backgroundColor: 'var(--color-background-secondary)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        backgroundColor: 'var(--color-background)',
        padding: 'var(--spacing-2xl)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h1 style={{
          fontSize: 'var(--font-size-2xl)',
          fontWeight: 600,
          textAlign: 'center',
          marginBottom: 'var(--spacing-xs)'
        }}>
          Welcome Back
        </h1>

        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          Sign in to access your tasks
        </p>

        <LoginForm onSubmit={handleLogin} onSuccess={handleSuccess} />

        <div style={{
          marginTop: 'var(--spacing-lg)',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)'
        }}>
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
