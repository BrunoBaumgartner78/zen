'use client'
import { useEffect, useMemo, useState } from 'react'
import type { DailyCard as Card } from '@/data/daily'
import { DAILY_CARDS } from '@/data/daily'

type Props = {
  open: boolean
  onClose: () => void
}

/** deterministische Auswahl pro Datum (lokal, ohne TZ-Murks) */
function indexForToday(len: number) {
  const d = new Date()
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  // einfache Hash-Funktion
  const str = `${y}-${m}-${day}`
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h) % len
}

export default function DailyCard({ open, onClose }: Props) {
  const [liked, setLiked] = useState(false)

  const card: Card = useMemo(() => {
    if (!DAILY_CARDS.length) {
      return { id: 'empty', image: '', quote: 'Keine Karten konfiguriert.', author: '' }
    }
    const idx = indexForToday(DAILY_CARDS.length)
    return DAILY_CARDS[idx]
  }, [])

  // Like-Status aus LocalStorage (pro Karte)
  useEffect(() => {
    const key = `daily_like_${card.id}`
    const v = localStorage.getItem(key)
    setLiked(v === '1')
  }, [card.id])

  const toggleLike = () => {
    const key = `daily_like_${card.id}`
    const next = !liked
    setLiked(next)
    if (next) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  }

  // Preload Bild
  useEffect(() => {
    if (!card.image) return
    const img = new Image()
    img.src = card.image
  }, [card.image])

  // Download
  const downloadImage = async () => {
    if (!card.image) return
    try {
      const res = await fetch(card.image)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `zen-daily-${card.id}.jpg`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch {}
  }

  // Styles
  const wrapBase: React.CSSProperties = {
    position: 'absolute', top: 16, right: 16, zIndex: 30,
    pointerEvents: open ? 'auto' : 'none',
  }
  const panel: React.CSSProperties = {
    width: 320,
    maxWidth: 'calc(100dvw - 32px)',
    borderRadius: 16,
    boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(10px)',
    transform: open ? 'translateY(0)' : 'translateY(-8px)',
    opacity: open ? 1 : 0,
    transition: 'opacity .22s ease, transform .22s ease',
  }
  const imgStyle: React.CSSProperties = {
    width: '100%', height: 320, objectFit: 'cover', display: card.image ? 'block' : 'none'
  }
  const body: React.CSSProperties = { padding: 12, fontFamily: 'system-ui, sans-serif', color: '#111' }
  const quote: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.4, margin: 0 }
  const author: React.CSSProperties = { fontSize: 12, opacity: 0.7, marginTop: 6 }
  const row: React.CSSProperties = { display: 'flex', gap: 8, marginTop: 12 }
  const btn: React.CSSProperties = {
    padding: '6px 10px', borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)',
    background: 'white', cursor: 'pointer'
  }
  const btnDark: React.CSSProperties = { ...btn, background: '#1b1b1b', color: 'white', border: 'none' }
  const heart: React.CSSProperties = {
    width: 32, height: 32, borderRadius: 10, border: '1px solid rgba(0,0,0,0.15)',
    display: 'grid', placeItems: 'center', cursor: 'pointer',
    background: liked ? '#fce7e7' : 'white',
  }
  const close: React.CSSProperties = {
    position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.15)', background: 'rgba(255,255,255,0.85)', cursor: 'pointer',
    display: 'grid', placeItems: 'center'
  }

  return (
    <div style={wrapBase} aria-hidden={!open}>
      <div style={panel}>
        {card.image ? <img src={card.image} alt="" style={imgStyle} /> : null}
        <button aria-label="Schließen" onClick={onClose} style={close}>×</button>
        <div style={body}>
          <p style={quote}>“{card.quote}”</p>
          {card.author ? <p style={author}>— {card.author}</p> : null}
          <div style={row}>
            <button onClick={downloadImage} style={btn}>Bild speichern</button>
            <button onClick={() => {
              const shareText = card.author ? `${card.quote} — ${card.author}` : card.quote
              navigator.clipboard?.writeText(shareText)
            }} style={btnDark}>Zitat kopieren</button>
            <button onClick={toggleLike} style={heart} aria-pressed={liked}>
              {liked ? '♥' : '♡'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
