export default function Loading() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: 'var(--color-background-secondary)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          className="loading-spinner"
          style={{
            width: '32px',
            height: '32px',
            margin: '0 auto var(--spacing-md)',
          }}
        ></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
}
