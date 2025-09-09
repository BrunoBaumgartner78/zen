// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export default async function OGImage() {
  const { width, height } = size

  return new ImageResponse(
    (
      <div
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#E9E3D5',
          padding: 48,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              background: '#1b1b1b',
              marginRight: 16,
            }}
          />
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1b1b1b' }}>Zen Garden</div>
        </div>

        {/* Mittelbereich – ruhige Fläche */}
        <div
          style={{
            width: '100%',
            height: 360,
            background: '#EBE5D7',
            borderRadius: 24,
            // Box-Shadow ist nicht garantiert unterstützt, daher weggelassen.
          }}
        />

        {/* Footer */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 52, lineHeight: 1.15, color: '#1b1b1b', fontWeight: 800 }}>
            Ruhige Sandkunst im Browser
          </div>
          <div style={{ fontSize: 24, color: '#2d2d2d', marginTop: 8 }}>
            Ziehe sanfte Rillen, platziere Steine & lausche Wind und Chimes.
          </div>
          <div style={{ fontSize: 20, color: '#4b4b4b', marginTop: 16 }}>blue-lotos.ch</div>
        </div>
      </div>
    ),
    { width, height }
  )
}
