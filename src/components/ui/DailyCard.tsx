// src/components/DailyCard.tsx
'use client'

import { useEffect, useMemo, useState } from 'react'
import type { DailyCard as Card } from '@/data/daily'
import { DAILY_CARDS } from '@/data/daily'

type Props = {
  open: boolean
  onClose: () => void
  /** überschreibt die Auswahl; 0-basiert, wird intern modulo Länge gerechnet */
  indexOverride?: number
}

/** deterministische Auswahl (Fallback, falls kein indexOverride übergeben wird) */
function indexForToday(len: number) {
  const d = new Date()
  const str = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24)
  }
  return Math.abs(h) % len
}

export default function DailyCard({ open, onClose, indexOverride }: Props) {
  if (!open) return null

  const [liked, setLiked] = useState(false)

  const card: Card = useMemo(() => {
    if (!DAILY_CARDS.length) {
      return { id: 'empty', image: '', quote: 'Keine Karten konfiguriert.', author: '' }
    }
    const idx =
      typeof indexOverride === 'number'
        ? ((indexOverride % DAILY_CARDS.length) + DAILY_CARDS.length) % DAILY_CARDS.length
        : indexForToday(DAILY_CARDS.length)
    return DAILY_CARDS[idx]
  }, [indexOverride])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const key = `daily_like_${card.id}`
    setLiked(localStorage.getItem(key) === '1')
  }, [card.id])

  const toggleLike = () => {
    if (typeof window === 'undefined') return
    const key = `daily_like_${card.id}`
    const next = !liked
    setLiked(next)
    if (next) localStorage.setItem(key, '1')
    else localStorage.removeItem(key)
  }

  // Bild vorladen
  useEffect(() => {
    if (!card.image) return
    const img = new Image()
    img.src = card.image
  }, [card.image])

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

  // ---------- Styles ----------
  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 99960,
    display: 'grid',
    placeItems: 'start end',
    padding: 16,
    background: 'transparent',
  }
  const panel: React.CSSProperties = {
    width: 340,
    maxWidth: 'calc(100dvw - 32px)',
    borderRadius: 16,
    boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
    overflow: 'hidden',
    background: 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(10px)',
    fontFamily: 'system-ui, sans-serif',
    color: '#111',
  }
  const mediaWrap: React.CSSProperties = {
    width: '100%',
    height: 350,
    background: 'linear-gradient(135deg, rgba(240,235,221,.8), rgba(233,227,213,.9))',
    display: 'block',
  }
  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: card.image ? 'block' : 'none',
  }
  const body: React.CSSProperties = { padding: 12 }
  const quote: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.45, margin: 0 }
  const author: React.CSSProperties = { fontSize: 12, opacity: 0.7, marginTop: 6, marginBottom: 0 }
  const row: React.CSSProperties = { display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }
  const btn: React.CSSProperties = {
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    background: '#fff',
    cursor: 'pointer',
    fontSize: 13,
  }
  const btnDark: React.CSSProperties = { ...btn, background: '#111', color: '#fff', border: 'none' }
  const heart: React.CSSProperties = {
    width: 34,
    height: 34,
    borderRadius: 10,
    border: '1px solid rgba(0,0,0,0.15)',
    display: 'grid',
    placeItems: 'center',
    cursor: 'pointer',
    background: liked ? '#fce7e7' : '#fff',
    fontSize: 16,
  }
  const close: React.CSSProperties = {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 8,
    border: '1px solid rgba(0,0,0,0.15)',
    background: 'rgba(255,255,255,0.9)',
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    lineHeight: '28px',
  }

  return (
    <div style={overlay} onClick={onClose}>
      <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <div style={panel}>
          <div style={mediaWrap}>{card.image ? <img src={card.image} alt="" style={imgStyle} /> : null}</div>
          <button aria-label="Schließen" onClick={onClose} style={close}>
            ×
          </button>

          <div style={body}>
            <p style={quote}>“{card.quote}”</p>
            {card.author ? <p style={author}>— {card.author}</p> : null}

            <div style={row}>
              <button onClick={downloadImage} style={btn}>
                Bild speichern
              </button>
              <button
                onClick={() => {
                  const shareText = card.author ? `${card.quote} — ${card.author}` : card.quote
                  navigator.clipboard?.writeText(shareText)
                }}
                style={btnDark}
              >
                Zitat kopieren
              </button>
              <button onClick={toggleLike} style={heart} aria-pressed={liked}>
                {liked ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
