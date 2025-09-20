'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function UpgradePage() {
  const { status } = useSession()
  const r = useRouter()
  const [busy, setBusy] = useState(false)

  async function startCheckout() {
    if (status !== 'authenticated') {
      toast.info('Bitte zuerst anmelden')
      // Wenn du ein Login-Modal über die Startseite öffnest:
      r.push('/?auth=open')
      // Alternativ: r.push('/login')
      return
    }

    try {
      setBusy(true)
      // Nur Einmalzahlung verwenden
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ mode: 'payment' }),
      })
      setBusy(false)

      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Checkout konnte nicht gestartet werden' }))
        toast.error(error || 'Checkout konnte nicht gestartet werden')
        return
      }

      const { url } = await res.json()
      if (url) window.location.href = url
      else toast.error('Kein Checkout-Link erhalten')
    } catch (e) {
      setBusy(false)
      console.error('[upgrade] checkout error', e)
      toast.error('Fehler beim Checkout')
    }
  }

  return (
    <main style={{ maxWidth: 720, margin: '64px auto', padding: '0 20px' }}>
      <header style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 28, margin: 0 }}>Premium freischalten</h1>
        <p style={{ margin: '8px 0 0', opacity: 0.8 }}>
          Einmal zahlen, dauerhaft genießen. Keine wiederkehrenden Gebühren.
        </p>
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 14,
          background: 'rgba(255,255,255,0.8)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 14,
          padding: 18,
          boxShadow: '0 6px 24px rgba(0,0,0,0.06)',
          marginBottom: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>❄️</span>
          <div>
            <div style={{ fontWeight: 700 }}>Wintermodus</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>Schnee-Optik & Winterklänge</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🪨</span>
          <div>
            <div style={{ fontWeight: 700 }}>Zusätzliche Gegenstände</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>Steinbrücke, Zen-Glocke u. v. m.</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 24 }}>🌐</span>
          <div>
            <div style={{ fontWeight: 700 }}>Teilen & Galerie</div>
            <div style={{ opacity: 0.7, fontSize: 14 }}>Deine Gärten öffentlich teilen</div>
          </div>
        </div>
      </section>

      <section
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          background: 'rgba(255,255,255,0.9)',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 14,
          padding: 18,
        }}
      >
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Einmalzahlung</div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>CHF 10.–</div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>inkl. MwSt., keine Abo-Gebühr</div>
        </div>

        <button
          onClick={startCheckout}
          disabled={busy}
          style={{
            padding: '12px 18px',
            fontWeight: 800,
            fontSize: 16,
            border: 'none',
            borderRadius: 10,
            cursor: busy ? 'default' : 'pointer',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
            background: 'linear-gradient(180deg, #ffd966, #ffb700)',
          }}
        >
          {busy ? '...' : '★ Upgrade – CHF 10.–'}
        </button>
      </section>

    
    </main>
  )
}
