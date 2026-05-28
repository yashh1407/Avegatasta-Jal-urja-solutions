'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '1rem',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1rem' }}>500</h1>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Something went wrong</h2>
          <p style={{ color: '#666', maxWidth: '28rem', marginBottom: '2rem' }}>
            An unexpected error occurred on our server. Please try again.
          </p>
          <button
            onClick={reset}
            style={{
              backgroundColor: '#111827',
              color: '#fff',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
