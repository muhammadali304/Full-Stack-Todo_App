'use client';

// Global error boundary - Catch and display unhandled errors

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--spacing-xl)',
        backgroundColor: 'var(--color-background-secondary)',
      }}
    >
      <div
        style={{
          maxWidth: '600px',
          width: '100%',
          backgroundColor: 'var(--color-background)',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            margin: '0 auto var(--spacing-lg)',
            backgroundColor: 'var(--color-error-light)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '2rem',
              color: 'var(--color-error)',
            }}
          >
            ⚠️
          </span>
        </div>

        <h1
          style={{
            fontSize: 'var(--font-size-2xl)',
            fontWeight: 600,
            marginBottom: 'var(--spacing-md)',
            color: 'var(--color-text)',
          }}
        >
          Something went wrong
        </h1>

        <p
          style={{
            fontSize: 'var(--font-size-base)',
            color: 'var(--color-text-secondary)',
            marginBottom: 'var(--spacing-xl)',
          }}
        >
          We encountered an unexpected error. Please try again or contact support if the problem persists.
        </p>

        {error.message && (
          <div
            style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-error-light)',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-xl)',
              textAlign: 'left',
            }}
          >
            <p
              style={{
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-error)',
                fontFamily: 'monospace',
                wordBreak: 'break-word',
              }}
            >
              {error.message}
            </p>
          </div>
        )}

        <div
          style={{
            display: 'flex',
            gap: 'var(--spacing-md)',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={reset}
            className="btn btn-primary"
            style={{ minWidth: '120px' }}
          >
            Try Again
          </button>

          <button
            onClick={() => (window.location.href = '/')}
            className="btn btn-secondary"
            style={{ minWidth: '120px' }}
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
