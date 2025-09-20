'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const consent = localStorage.getItem('cookie_consent')
    if (!consent) setVisible(true)
  }, [])

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted')
    setVisible(false)
    // 👉 sofort Google Analytics laden (falls Snippet in layout.tsx wartet)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('ga-consent-granted'))
    }
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(233, 227, 213, 0.95)', // Zen-Sandfarbe
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 18,
        padding: '18px 24px',
        zIndex: 2000,
        maxWidth: 680,
        width: 'calc(100% - 32px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        fontFamily: 'system-ui, sans-serif',
        color: '#222',
        backdropFilter: 'blur(8px)',
      }}
    >
      <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>
        Wir verwenden Cookies, um dein Erlebnis zu verbessern. Mehr Infos findest du in unserer{' '}
        <Link
          href="/datenschutz"
          style={{ textDecoration: 'underline', color: '#3b3a36', fontWeight: 600 }}
        >
          Datenschutzerklärung
        </Link>
        , unseren{' '}
        <Link
          href="/agb"
          style={{ textDecoration: 'underline', color: '#3b3a36', fontWeight: 600 }}
        >
          AGB
        </Link>{' '}
        und im{' '}
        <Link
          href="/impressum"
          style={{ textDecoration: 'underline', color: '#3b3a36', fontWeight: 600 }}
        >
          Impressum
        </Link>
        .
      </p>

      <div
        style={{
          marginTop: 14,
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
        }}
      >
        <button
          onClick={accept}
          style={{
            padding: '8px 18px',
            fontWeight: 600,
            borderRadius: 12,
            border: 'none',
            background: '#7a8f76', // sanftes Zen-Grün
            color: '#fff',
            cursor: 'pointer',
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            transition: 'background 0.2s ease',
          }}
        >
          Akzeptieren
        </button>
        <button
          onClick={decline}
          style={{
            padding: '8px 18px',
            fontWeight: 500,
            borderRadius: 12,
            border: '1px solid rgba(0,0,0,0.15)',
            background: '#f0ebdd', // helles Beige
            color: '#333',
            cursor: 'pointer',
            transition: 'background 0.2s ease',
          }}
        >
          Ablehnen
        </button>
      </div>
    </div>
  )
}
