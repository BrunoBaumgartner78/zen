// src/app/upgrade/UpgradeClient.tsx
'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

export default function UpgradeClient() {
  const sp = useSearchParams()

  // Beispiel: Query-Parameter lesen (optional)
  const plan = useMemo(() => sp.get('plan') ?? 'premium', [sp])

  // … hier dein bisheriger /upgrade UI & Logik (Buttons, Stripe-Start etc.)
  return (
    <main style={{ maxWidth: 720, margin: '40px auto', padding: '0 16px' }}>
      <h1>Upgrade</h1>
      <p>Gewählter Plan: <strong>{plan}</strong></p>

      {/* Beispiel-Button: POST auf deine Checkout-API */}
      <form
        action="/api/stripe/checkout"
        method="post"
        style={{ marginTop: 20 }}
      >
        <button
          type="submit"
          style={{
            padding: '10px 16px',
            borderRadius: 10,
            border: '1px solid rgba(0,0,0,.1)',
            background: '#111',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Jetzt upgraden
        </button>
      </form>
    </main>
  )
}
