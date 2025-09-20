'use client'
import { useSession, signIn } from 'next-auth/react'

export default function PremiumCheckoutButton() {
  const { status } = useSession()
  const authed = status === 'authenticated'

  const onBuy = async () => {
    if (!authed) {
      await signIn()
      return
    }
    const r = await fetch('/api/checkout/premium', { method: 'POST' })
    if (!r.ok) return alert('Checkout konnte nicht gestartet werden.')
    const { url } = await r.json()
    window.location.href = url
  }

  return (
    <button
      onClick={onBuy}
      style={{ padding:'10px 14px', borderRadius:10, fontWeight:700, background:'#111', color:'#fff', border:'none', cursor:'pointer' }}
    >
      Premium jetzt freischalten
    </button>
  )
}
