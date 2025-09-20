// src/components/ClientPage.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'
import PixiGardenPlain from '@/components/canvas/PixiGardenPlain'

function AfterUpgradeRefresher() {
  const qp = useSearchParams()
  const { update, data } = useSession()
  const ranRef = useRef(false)

  useEffect(() => {
    const upgraded = qp.get('upgraded')
    if (upgraded !== '1' || ranRef.current) return
    ranRef.current = true

    ;(async () => {
      // 1) Session hard refreshen
      await update()

      // 2) Nutzer-Feedback
      const hasPremium = Boolean((data?.user as any)?.hasPremium)
      if (hasPremium) {
        toast.success('Premium aktiv – viel Freude! ✨')
      } else {
        toast.message('Aktualisiere deinen Account …')
        // zweiter „Tap“, falls das DB-Update Millisekunden hinterherhinkt
        setTimeout(() => update(), 400)
      }

      // 3) Query-Param wieder entfernen, damit kein Loop entsteht
      const url = new URL(window.location.href)
      url.searchParams.delete('upgraded')
      window.history.replaceState({}, '', url.toString())
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qp, update]) // absichtlich ohne 'data' in deps, damit der Effekt nicht erneut feuert

  return null
}

export default function ClientPage() {
  return (
    <>
      <AfterUpgradeRefresher />
      <PixiGardenPlain />
    </>
  )
}
