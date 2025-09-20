// src/app/twitter-image/route.ts
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const contentType = 'image/png'
export const size = { width: 1200, height: 630 }

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #E9E3D5, #D8D3C6)',
          padding: 60,
        }}
      >
        <div style={{ display: 'flex', fontSize: 80, fontWeight: 700, letterSpacing: -1 }}>
          Zen Garden
        </div>
        <div style={{ display: 'flex', marginTop: 20, fontSize: 36 }}>
          Ruhige Sandkunst im Browser
        </div>
      </div>
    ),
    size
  )
}
