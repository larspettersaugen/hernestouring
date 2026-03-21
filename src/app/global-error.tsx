'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 24, fontFamily: 'system-ui, sans-serif', background: '#0f0f12', color: '#fafafa', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <h1 style={{ fontSize: '1.25rem', marginBottom: 8 }}>Something went wrong</h1>
        <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
          {error.message || 'An unexpected error occurred.'}
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={reset}
            style={{ padding: '8px 16px', borderRadius: 8, background: '#f59e0b', color: '#0f0f12', fontWeight: 500, border: 'none', cursor: 'pointer' }}
          >
            Try again
          </button>
          <a
            href="/dashboard"
            style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #2a2a30', color: '#71717a', textDecoration: 'none' }}
          >
            Back to dashboard
          </a>
        </div>
      </body>
    </html>
  );
}
