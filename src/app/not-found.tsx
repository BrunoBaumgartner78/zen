// src/app/not-found.tsx
'use client'

import Link from 'next/link'

export default function NotFound() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#e9e3d5', // Sandfarben
        textAlign: 'center',
        fontFamily: 'system-ui, sans-serif',
        padding: 24,
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          margin: 0,
          color: '#3b3a36',
          fontWeight: 700,
        }}
      >
        404
      </h1>
      <p
        style={{
          fontSize: 18,
          maxWidth: 480,
          marginTop: 12,
          marginBottom: 24,
          lineHeight: 1.5,
          color: '#444',
        }}
      >
        Dieser Pfad ist leer wie ein unberührter Zen-Garten.  
        Kehre zurück und finde deinen Weg.
      </p>
      <Link
        href="/"
        style={{
          padding: '10px 20px',
          background: '#7a8f76',
          borderRadius: 12,
          color: '#fff',
          fontWeight: 600,
          textDecoration: 'none',
          boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        }}
      >
        Zurück zum Garten
      </Link>
    </main>
  )
}
