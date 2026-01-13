'use client';

// Registration page - User registration interface

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { RegisterForm } from '@/components/auth/RegisterForm';
import type { RegisterRequest } from '@/lib/types';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const handleRegister = async (data: RegisterRequest) => {
    await register(data);
  };

  const handleSuccess = () => {
    // Redirect to login page after successful registration
    router.push('/login');
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
          Create Account
        </h1>

        <p style={{
          textAlign: 'center',
          color: 'var(--color-text-secondary)',
          marginBottom: 'var(--spacing-xl)'
        }}>
          Sign up to start managing your tasks
        </p>

        <RegisterForm onSubmit={handleRegister} onSuccess={handleSuccess} />

        <div style={{
          marginTop: 'var(--spacing-lg)',
          textAlign: 'center',
          fontSize: 'var(--font-size-sm)',
          color: 'var(--color-text-secondary)'
        }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
