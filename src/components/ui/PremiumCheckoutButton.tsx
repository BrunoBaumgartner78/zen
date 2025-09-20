'use client'

import { useSession, signIn } from 'next-auth/react'

export default function PremiumCheckoutButton() {
  const { status } = useSession()
  const authed = status === 'authenticated'

  const onBuy = async () => {
    if (!authed) {
      await signIn() // ggf. signIn('credentials') oder 'google' anpassen
      return
    }

    try {
      const r = await fetch('/api/stripe/checkout', { method: 'POST' })
      if (!r.ok) {
        const txt = await r.text()
        throw new Error(txt || 'Checkout konnte nicht gestartet werden.')
      }
      const { url } = await r.json()
      if (url) {
        window.location.href = url
      } else {
        throw new Error('Keine Checkout-URL zurückgegeben.')
      }
    } catch (err: any) {
      alert(err.message || 'Fehler beim Checkout.')
      console.error(err)
    }
  }

  return (
    <button
      onClick={onBuy}
      style={{
        padding: '10px 14px',
        borderRadius: 10,
        fontWeight: 700,
        background: '#111',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      Premium jetzt freischalten
    </button>
  )
}
