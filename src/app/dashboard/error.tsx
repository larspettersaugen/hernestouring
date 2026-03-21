'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: '#0f0f12',
        color: '#fafafa',
      }}
    >
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 8 }}>Something went wrong</h1>
      <p style={{ color: '#71717a', fontSize: 14, marginBottom: 24, textAlign: 'center', maxWidth: 400 }}>
        {error.message || 'An error occurred while loading this page.'}
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={reset}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            background: '#f59e0b',
            color: '#0f0f12',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
        <Link
          href="/dashboard"
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid #2a2a30',
            color: '#71717a',
            textDecoration: 'none',
          }}
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
