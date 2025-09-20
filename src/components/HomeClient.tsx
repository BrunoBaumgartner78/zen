// src/components/HomeClient.tsx
'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import ClientPage from '@/components/ClientPage'
import { DAILY_CARDS } from '@/data/daily'

// DailyCard nur im Client laden → verhindert SSR/Prerender-Probleme
const DailyCard = dynamic(() => import('@/components/ui/DailyCard'), { ssr: false })

function toDateOnlyISO(d = new Date()) {
  const y = d.getFullYear()
  const m = `${d.getMonth() + 1}`.padStart(2, '0')
  const day = `${d.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${day}`
}

function daysBetween(aISO: string, bISO: string) {
  const a = new Date(aISO + 'T00:00:00')
  const b = new Date(bISO + 'T00:00:00')
  const MS = 24 * 60 * 60 * 1000
  return Math.floor((b.getTime() - a.getTime()) / MS)
}

export default function HomeClient() {
  const [mounted, setMounted] = useState(false)
  const [dailyOpen, setDailyOpen] = useState(false)
  const [indexSafe, setIndexSafe] = useState(0)
  const [todayISO, setTodayISO] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true) // erst nach Mount Dinge mit localStorage machen
    const today = toDateOnlyISO()
    setTodayISO(today)

    try {
      let anchor = localStorage.getItem('daily_anchor')
      if (!anchor) {
        anchor = today
        localStorage.setItem('daily_anchor', anchor)
      }

      const diff = daysBetween(anchor, today)
      const idx = DAILY_CARDS.length
        ? ((diff % DAILY_CARDS.length) + DAILY_CARDS.length) % DAILY_CARDS.length
        : 0
      setIndexSafe(idx)

      const seenKey = `daily_seen_${today}`
      const seen = localStorage.getItem(seenKey) === '1'
      setDailyOpen(!seen)
    } catch {
      // Falls localStorage nicht verfügbar ist (z. B. Privacy Mode)
      setIndexSafe(0)
      setDailyOpen(true)
    }
  }, [])

  const onCloseDaily = () => {
    if (todayISO) {
      try {
        const seenKey = `daily_seen_${todayISO}`
        localStorage.setItem(seenKey, '1')
      } catch {
        // Ignorieren falls localStorage gesperrt
      }
    }
    setDailyOpen(false)
  }

  return (
    <>
      <ClientPage />
      {mounted && (
        <DailyCard
          open={dailyOpen}
          onClose={onCloseDaily}
          indexOverride={indexSafe}
        />
      )}
    </>
  )
}
