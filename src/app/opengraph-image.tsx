// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg,#EFE9DB 0%, #DCD6C7 100%)',
          letterSpacing: '-.02em',
          position: 'relative',
        }}
      >
        {/* dezente Wellenlinien */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08 }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 30 + i * 45,
                height: 2,
                background: '#BFB8A6',
              }}
            />
          ))}
        </div>

        <div style={{ display: 'grid', gap: 20, textAlign: 'center', zIndex: 1 }}>
          <div style={{ fontSize: 80, fontWeight: 800, color: '#1b1b1b' }}>Zen Garden</div>
          <div style={{ fontSize: 32, color: '#3b3b3b' }}>Sand · Steine · Ruhe</div>
          <div style={{ fontSize: 22, color: '#6b6b6b' }}>
            Ziehe Rillen, platziere Steine & lausche dem Wind
          </div>
        </div>
      </div>
    ),
    { ...size }
  )
}
