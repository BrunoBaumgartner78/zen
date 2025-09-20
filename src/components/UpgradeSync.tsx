// src/components/UpgradeSync.tsx
'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { toast } from 'sonner'

export default function UpgradeSync() {
  const { data: session, status, update } = useSession()
  const qp = useSearchParams()
  const r = useRouter()
  const polled = useRef(false)

  // 1) Direkt nach ?upgraded=1 die Session refreshen
  useEffect(() => {
    const upgraded = qp.get('upgraded')
    if (upgraded === '1') {
      ;(async () => {
        try {
          await update() // holt neue JWT->Session (inkl. hasPremium)
          toast.success('Premium aktiv ✅')
        } catch {
          toast.error('Konnte Session nicht aktualisieren')
        } finally {
          // Query param säubern
          const url = new URL(window.location.href)
          url.searchParams.delete('upgraded')
          r.replace(url.pathname + url.search + url.hash)
        }
      })()
    }
  }, [qp, r, update])

  // 2) Falls Checkout-Callback zeitversetzt zustellt: einmalig kurz pollen
  useEffect(() => {
    if (polled.current) return
    polled.current = true

    let tries = 0
    const maxTries = 6 // ~6s
    const iv = setInterval(async () => {
      tries++
      if (status !== 'authenticated') return
      if ((session?.user as any)?.hasPremium) {
        clearInterval(iv)
        return
      }
      try {
        await update()
      } catch {}
      if (tries >= maxTries) clearInterval(iv)
    }, 1000)

    return () => clearInterval(iv)
  }, [status, session?.user, update])

  return null
}
