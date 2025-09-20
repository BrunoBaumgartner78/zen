// src/app/upgrade/success/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function UpgradeSuccessPage() {
  const r = useRouter()
  const qp = useSearchParams()
  const { update } = useSession()
  const sessionId = qp.get('session_id')

  useEffect(() => {
    (async () => {
      if (!sessionId) return
      const res = await fetch(`/api/stripe/success?session_id=${encodeURIComponent(sessionId)}`)
      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        console.error(json)
        toast.error(json?.error ?? 'Konnte Kauf nicht verifizieren')
        return
      }
      // Session sofort aktualisieren
      await update()
      toast.success('Premium freigeschaltet ✨')
      r.replace('/?upgraded=1')
    })()
  }, [sessionId, update, r])

  return (
    <main style={{maxWidth:680, margin:'60px auto', padding:20}}>
      <h1>Danke für deinen Kauf!</h1>
      <p>Wir verifizieren deinen Beleg…</p>
    </main>
  )
}
