'use client';

/** Last-resort error boundary (renders its own <html>). */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', background: '#031c4a', color: '#fff' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center', padding: 24 }}>
          <div>
            <p style={{ fontSize: 64, fontWeight: 800, margin: 0, opacity: 0.2 }}>500</p>
            <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
            <p style={{ color: '#d9e3f5' }}>Please refresh the page or try again in a moment.</p>
            <button onClick={reset} style={{ marginTop: 16, background: '#f3a60c', color: '#02112f', border: 0, borderRadius: 12, padding: '12px 24px', fontWeight: 700, cursor: 'pointer' }}>
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
