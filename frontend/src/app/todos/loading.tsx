'use client';

// Todos page loading component - Shown during todos page load and data fetching

export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="loading-spinner"
          style={{
            width: '48px',
            height: '48px',
            margin: '0 auto var(--spacing-lg)',
            borderWidth: '4px',
          }}
        ></div>
        <p
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: 'var(--color-primary)',
            letterSpacing: '0.05em',
          }}
        >
          TODO APP
        </p>
      </div>
    </div>
  );
}
