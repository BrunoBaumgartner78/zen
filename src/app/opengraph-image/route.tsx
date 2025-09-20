// src/app/twitter-image/route.ts
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Zen Garden – Sand, Steine & Wellen'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Keine Fonts/Fetches nötig – keep it simple
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',            // ← wichtig!
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(180deg,#E9E3D5,#D8D3C6)',
          fontFamily: 'sans-serif'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 88, fontWeight: 800, letterSpacing: -1 }}>Zen Garden</div>
          <div style={{ marginTop: 12, fontSize: 32, opacity: 0.8 }}>
            Ruhige Sandkunst im Browser
          </div>
        </div>
      </div>
    ),
    size
  )
}
