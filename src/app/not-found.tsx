// src/app/not-found.tsx
import Link from 'next/link'

export const dynamic = 'force-static'

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100dvh',
      display: 'grid',
      placeItems: 'center',
      background: 'linear-gradient(180deg,#E9E3D5,#D8D3C6)',
      padding: 24
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(6px)',
        borderRadius: 16,
        padding: '28px 24px',
        maxWidth: 560,
        textAlign: 'center',
        boxShadow: '0 10px 28px rgba(0,0,0,0.12)'
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>404 – Garten nicht gefunden</h1>
        <p style={{ marginTop: 8, opacity: 0.75 }}>
          Diese Sandfläche gibt’s nicht (mehr). Atme ein… aus… und kehre zum Zen Garden zurück.
        </p>
        <div style={{ marginTop: 16 }}>
          <Link href="/" style={{
            padding: '10px 14px',
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.12)',
            background: '#fff',
            textDecoration: 'none',
            color: '#111',
            fontWeight: 600
          }}>
            ⌂ Zur Startseite
          </Link>
        </div>
      </div>
    </main>
  )
}
